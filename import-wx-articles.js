/**
 * 微信公众号文章批量抓取导入脚本
 * 用法：node import-wx-articles.js
 * 把文章URL填入下方 ARTICLE_URLS 数组，每行一个
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ========== 在此填入文章URL ==========
const ARTICLE_URLS = [
  'https://mp.weixin.qq.com/s/SwS6dSxZbTSITmDUuGW-fw?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/s-8G8o21bMd9aLQEwL2A7Q?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/pQMGuUB06VoN9UOtUU5PAA?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/qk9zokhBpqvvpiEcKCTmjg?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/nQUssJ8Xk_iTY_qTD1MKjQ?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/1op9vpAyknDQMVaGMu6aXQ?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/aLHBbonHD1-ziqhRysmAFw?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/X5cll6-upcwLZHzUBP4-CQ?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/PJTO-27LF011dCnifqk7iw?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/0EcmrwGfnYmu_0TofWc3cA?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/G3vjHbpeLWJbKIwCd9UVOg?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/f_9vcnLbTyelx9AZjUVFUg?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/aRlzZdLKR97sL25zNrePXw?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/Ryt6uo5SkcIbeKKdqy5KDw?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/m4_3LuTE_-F-BEaWVWxBhQ?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/FSzRKlQKHbm7JLnteSOJfA?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/0hsVrE8f-eQd9XemopKPYA?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/UUcn3jOg_nTRHxLuHDN18g?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/-tDzrh4NVhDe0HDgcAHpHw?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/uk22tnTFfmIlxz0P6aBdIQ?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/vV7C47gxXD8QIqKFuZz2mQ?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/ZrmEwbjP7eylD7b9ouvG9A?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/8275HYvoUt_TjI3cQm08Kg?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/5OxNN8uh8W1-deH1C-DSgA?token=458259285&lang=zh_CN',
  'https://mp.weixin.qq.com/s/45DWNeGy6pb-vZDEzDDuig?token=458259285&lang=zh_CN',
];
// =====================================

const IMG_DIR = path.join(__dirname, 'public', 'wx-images');

function curlGet(url) {
  try {
    return execSync(
      `curl -s --max-time 20 --ipv4 -L -A "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1" "${url}"`,
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );
  } catch (e) {
    console.warn('  curl失败:', e.message);
    return '';
  }
}

function downloadImage(imgUrl, filename) {
  try {
    if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });
    const dest = path.join(IMG_DIR, filename);
    execSync(
      `curl -s --max-time 15 --ipv4 -L -A "Mozilla/5.0" -o "${dest}" "${imgUrl}"`,
      { encoding: 'utf8' }
    );
    const stat = fs.statSync(dest);
    if (stat.size > 1000) return `/wx-images/${filename}`;
    fs.unlinkSync(dest);
    return null;
  } catch {
    return null;
  }
}

function extractMeta(html, property) {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)="${property}"[^>]+content="([^"]*)"`, 'i'))
           || html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="${property}"`, 'i'));
  return m ? m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim() : '';
}

function extractPublishDate(html) {
  // 方式1：var ct = "1234567890"
  const m1 = html.match(/var\s+ct\s*=\s*"(\d+)"/);
  if (m1) return new Date(parseInt(m1[1]) * 1000).toISOString().split('T')[0];

  // 方式2：publish_time 文本
  const m2 = html.match(/id="publish_time"[^>]*>([^<]+)</);
  if (m2) return m2[1].trim().replace(/\s+/g, '-');

  return new Date().toISOString().split('T')[0];
}

function extractContent(html) {
  // 提取正文区域
  const m = html.match(/<div[^>]+id="js_content"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*(?:<div|<section)/i)
           || html.match(/<div[^>]+class="[^"]*rich_media_content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i);
  if (!m) return '';
  // 清理脚本和样式
  return m[1]
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .trim()
    .substring(0, 50000);
}

async function parseArticle(url) {
  console.log('  正在抓取:', url.substring(0, 80) + '...');
  const html = curlGet(url);

  if (!html || html.length < 500) {
    console.warn('  ⚠️  页面内容过短或抓取失败，跳过');
    return null;
  }

  const title = extractMeta(html, 'og:title');
  const digest = extractMeta(html, 'og:description');
  const ogImage = extractMeta(html, 'og:image');
  const pubDate = extractPublishDate(html);
  const content = extractContent(html);

  if (!title) {
    console.warn('  ⚠️  未能提取标题，跳过');
    return null;
  }

  // 下载封面图到本地
  let imageUrl = '/img_news.png';
  if (ogImage && ogImage.startsWith('http')) {
    const ext = ogImage.includes('.jpg') ? 'jpg' : 'png';
    const filename = `wx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const localImg = downloadImage(ogImage, filename);
    if (localImg) {
      imageUrl = localImg;
      console.log('  📷 封面图已保存:', localImg);
    } else {
      console.log('  📷 封面图下载失败，使用默认图');
    }
  }

  return { title, excerpt: digest, content, image: imageUrl, date: pubDate, wxLink: url };
}

async function main() {
  const urls = ARTICLE_URLS.filter(u => u && u.trim().startsWith('http'));

  if (urls.length === 0) {
    console.log('❌ 请在脚本顶部的 ARTICLE_URLS 数组中填入文章URL后再运行！');
    process.exit(1);
  }

  console.log(`\n🚀 开始批量导入 ${urls.length} 篇微信文章...\n`);

  let imported = 0, updated = 0, failed = 0;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i].trim();
    console.log(`[${i + 1}/${urls.length}]`);

    try {
      const article = await parseArticle(url);
      if (!article) { failed++; continue; }

      const existing = await prisma.news.findFirst({ where: { wxLink: url } });
      if (existing) {
        await prisma.news.update({
          where: { id: existing.id },
          data: { title: article.title, excerpt: article.excerpt, content: article.content, image: article.image, date: article.date }
        });
        console.log(`  ✅ 更新: ${article.title.substring(0, 30)}`);
        updated++;
      } else {
        await prisma.news.create({ data: article });
        console.log(`  ✅ 新增: ${article.title.substring(0, 30)}`);
        imported++;
      }

      // 避免请求过快
      if (i < urls.length - 1) await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.error(`  ❌ 失败: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n🎉 导入完成！新增 ${imported} 篇，更新 ${updated} 篇，失败 ${failed} 篇。`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
