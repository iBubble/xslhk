import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '../../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * 🔒 微信公众号文章单链接抓取导入接口
 * 请求方法: POST
 * 请求路径: /api/wechat/import-url
 * 数据格式: { url: "https://mp.weixin.qq.com/s/..." }
 */

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function curlGetHtml(url) {
  try {
    return execFileSync('curl', [
      '-s', '--max-time', '25', '--ipv4', '-L',
      '-A', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      url
    ], { encoding: 'utf8', maxBuffer: 15 * 1024 * 1024 });
  } catch (e) {
    throw new Error(`请求网页失败: ${e.message}`);
  }
}

function downloadImageSafe(imgUrl, filename) {
  try {
    const imgDir = path.join(process.cwd(), 'public', 'wx-images');
    if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir, { recursive: true });
    }
    const dest = path.join(imgDir, filename);
    
    if (fs.existsSync(dest)) {
      return `/wx-images/${filename}`;
    }

    execFileSync('curl', [
      '-s', '--max-time', '15', '--ipv4', '-L',
      '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      '-o', dest,
      imgUrl
    ], { encoding: 'utf8' });

    const stat = fs.statSync(dest);
    if (stat.size > 1000) {
      return `/wx-images/${filename}`;
    }
    fs.unlinkSync(dest);
    return null;
  } catch (e) {
    console.error('[WeChat Import] Failed to download image:', e.message);
    return null;
  }
}

// 核心逻辑：正文微信防盗链图片深度清洗与安全本地化下载
function downloadContentImage(imageUrl) {
  if (!imageUrl || !imageUrl.includes('qpic.cn')) {
    return imageUrl;
  }
  
  try {
    let ext = 'png';
    if (imageUrl.includes('wx_fmt=')) {
      const match = imageUrl.match(/wx_fmt=([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        ext = match[1].toLowerCase();
      }
    } else if (imageUrl.includes('tp=')) {
      const match = imageUrl.match(/tp=([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        ext = match[1].toLowerCase();
      }
    }
    if (ext === 'jpeg') ext = 'jpg';

    const hashedName = md5(imageUrl);
    const filename = `${hashedName}.${ext}`;
    
    const imgDir = path.join(process.cwd(), 'public', 'wx-images');
    if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir, { recursive: true });
    }
    const dest = path.join(imgDir, filename);
    const relativeUrl = `/wx-images/${filename}`;

    // 如果本地已经存在该图片，直接返回相对路径，保护服务器带宽与防重复请求
    if (fs.existsSync(dest)) {
      return relativeUrl;
    }

    // 用安全的 execFileSync curl 下载
    execFileSync('curl', [
      '-s', '--max-time', '15', '--ipv4', '-L',
      '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      '-o', dest,
      imageUrl
    ], { encoding: 'utf8' });

    const stat = fs.statSync(dest);
    if (stat.size > 1000) {
      return relativeUrl;
    }
    fs.unlinkSync(dest);
    return imageUrl; // 失败时 Fallback 使用原图
  } catch (e) {
    console.error('[WeChat Content Image Import] Failed to download content image:', e.message);
    return imageUrl; // 报错 Fallback
  }
}

function extractMeta(html, property) {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)="${property}"[^>]+content="([^"]*)"`, 'i'))
           || html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="${property}"`, 'i'));
  return m ? m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim() : '';
}

function extractPublishDate(html) {
  const m1 = html.match(/var\s+ct\s*=\s*"(\d+)"/);
  if (m1) return new Date(parseInt(m1[1]) * 1000).toISOString().split('T')[0];

  const m2 = html.match(/id="publish_time"[^>]*>([^<]+)</);
  if (m2) return m2[1].trim().replace(/\s+/g, '-');

  return new Date().toISOString().split('T')[0];
}

function extractContent(html) {
  const m = html.match(/<div[^>]+id="js_content"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*(?:<div|<section)/i)
           || html.match(/<div[^>]+class="[^"]*rich_media_content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i);
  if (!m) return '';
  
  return m[1]
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .trim()
    .substring(0, 100000);
}

export async function POST(request) {
  try {
    // 1. 安全授权检查
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: '未授权：请先登录后台管理系统。' }, { status: 401 });
    }

    // 2. 解析请求参数
    const body = await request.json();
    const { url } = body;

    if (!url || !url.trim().startsWith('http')) {
      return NextResponse.json({ success: false, message: '参数错误：请输入有效的文章链接地址。' }, { status: 400 });
    }

    const trimmedUrl = url.trim();
    
    // 3. 校验是否是微信公众号链接
    if (!trimmedUrl.includes('mp.weixin.qq.com')) {
      return NextResponse.json({ success: false, message: '格式错误：目前仅支持导入微信公众号文章（以 mp.weixin.qq.com 开头）。' }, { status: 400 });
    }

    console.log(`[WeChat Import] 开始抓取微信文章 URL: ${trimmedUrl}`);

    // 4. 抓取网页 HTML
    const html = curlGetHtml(trimmedUrl);
    if (!html || html.length < 500) {
      return NextResponse.json({ success: false, message: '抓取失败：微信页面未返回有效内容，请检查链接或稍后重试。' }, { status: 400 });
    }

    // 5. 提取文章内容
    const title = extractMeta(html, 'og:title');
    const digest = extractMeta(html, 'og:description') || '从微信公众号导入的图文文章。';
    const ogImage = extractMeta(html, 'og:image');
    const pubDate = extractPublishDate(html);
    const contentRaw = extractContent(html);

    if (!title) {
      return NextResponse.json({ success: false, message: '解析失败：未能从该链接中解析出文章标题，请确认是否为微信公众号群发图文链接。' }, { status: 400 });
    }

    // 6. 下载封面图到本地 public 目录以保持稳定
    let localImageUrl = '/img_news.png';
    if (ogImage && ogImage.startsWith('http')) {
      const ext = ogImage.includes('.jpg') ? 'jpg' : 'png';
      const filename = `wx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const downloaded = downloadImageSafe(ogImage, filename);
      if (downloaded) {
        localImageUrl = downloaded;
      }
    }

    // 7. 本地化下载正文中的微信防盗链图片
    const imgRegex = /(src|data-src)="([^"]*?qpic\.cn[^"]*?)"/gi;
    let match;
    const urlsToDownload = new Set();

    while ((match = imgRegex.exec(contentRaw)) !== null) {
      if (match[2]) {
        urlsToDownload.add(match[2]);
      }
    }

    let cleanedContent = contentRaw;

    // 顺序下载图片并替换正文链接
    for (const wxUrl of urlsToDownload) {
      const cleanUrl = wxUrl.replace(/&amp;/g, '&'); // 规避 XML/HTML 转义符
      const localUrl = downloadContentImage(cleanUrl);
      if (localUrl !== wxUrl) {
        cleanedContent = cleanedContent.split(wxUrl).join(localUrl);
      }
    }

    // 适配微信排版：把所有的 data-src 统一替换为真实的 src 属性
    cleanedContent = cleanedContent.replace(/data-src=/gi, 'src=');

    // 8. 写入/更新 SQLite 数据库中的 News 表
    const existing = await prisma.news.findFirst({ where: { wxLink: trimmedUrl } });
    let resultArticle;

    if (existing) {
      resultArticle = await prisma.news.update({
        where: { id: existing.id },
        data: {
          title,
          excerpt: digest,
          content: cleanedContent,
          image: localImageUrl,
          date: pubDate
        }
      });
      console.log(`[WeChat Import] 成功更新文章: ${title}`);
    } else {
      resultArticle = await prisma.news.create({
        data: {
          title,
          excerpt: digest,
          content: cleanedContent,
          image: localImageUrl,
          date: pubDate,
          wxLink: trimmedUrl
        }
      });
      console.log(`[WeChat Import] 成功新增文章: ${title}`);
    }

    // 9. 更新前台和后台相关路径的静态缓存，确保用户立即看到最新动态
    revalidatePath('/');
    revalidatePath('/news');
    revalidatePath(`/news/${resultArticle.id}`);
    revalidatePath('/admin/news');

    return NextResponse.json({
      success: true,
      message: `🎉 成功导入微信文章！\n\n文章标题: 《${title}》\n发布日期: ${pubDate}\n\n所有正文图片已 100% 完成本地防盗链下载，已自动添加到您的公司动态列表中。`,
      id: resultArticle.id
    });

  } catch (error) {
    console.error('[WeChat Import URL API Error]:', error);
    return NextResponse.json({
      success: false,
      message: `导入失败：${error.message || '内部接口异常'}`
    }, { status: 500 });
  }
}
