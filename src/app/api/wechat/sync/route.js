import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getSystemConfig } from '../../../../lib/config';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

/**
 * 🔗 微信公众号服务器配置校验接口 (GET)
 * 用于微信后台的 "服务器配置" 校验握手。
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const signature = searchParams.get('signature') || '';
    const timestamp = searchParams.get('timestamp') || '';
    const nonce = searchParams.get('nonce') || '';
    const echostr = searchParams.get('echostr') || '';

    // 获取后台配置的 wechat_mp_token
    const configuredToken = await getSystemConfig('wechat_mp_token');
    
    if (!configuredToken) {
      return new Response('系统未配置 wechat_mp_token，请先在网站后台设置。', { status: 403 });
    }

    // 微信签名验证算法：
    // 1. 将token、timestamp、nonce三个参数进行字典序排序
    // 2. 将三个参数字符串拼接成一个字符串进行sha1加密
    // 3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    const tempArray = [configuredToken.trim(), timestamp, nonce].sort();
    const tempStr = tempArray.join('');
    const sha1 = crypto.createHash('sha1').update(tempStr).digest('hex');

    if (sha1 === signature) {
      return new Response(echostr, { headers: { 'Content-Type': 'text/plain' } });
    } else {
      return new Response('签名校验失败', { status: 403 });
    }
  } catch (error) {
    console.error('[WeChat Verification Error]:', error);
    return new Response('服务器内部错误', { status: 500 });
  }
}

/**
 * 🔗 微信公众号文章导入接口 (WeChat Official Account Sync API)
 * 
 * 后期二次开发说明：
 * 1. 后期同步服务 (如定时脚本、微信 Webhook 推送等) 可直接向本接口发送 POST 请求进行增量导入。
 * 2. 接口会自动校对 Token 进行身份验证，并对文章进行 Upsert 去重，确保导入的文章 100% 自动归入“公司动态”栏目。
 * 
 * 请求路径: POST /api/wechat/sync
 * 请求头: Authorization: Bearer <您的系统 wechat_mp_token>
 */
export async function POST(request) {
  try {
    // 1. 验证微信接口 Token 鉴权，防范外界恶意调用
    const configuredToken = await getSystemConfig('wechat_mp_token');
    
    // 如果系统配置中还未设置 Token，为安全起见默认不开放写入，防范脏数据
    if (!configuredToken) {
      return NextResponse.json({ 
        success: false, 
        message: '微信接口未在后台初始化：请先在“系统基本信息”中配置“接口 Token (验证令牌)”以开启公众号同步通道。' 
      }, { status: 403 });
    }

    const authHeader = request.headers.get('authorization');
    const incomingToken = authHeader ? authHeader.replace('Bearer ', '').trim() : '';

    if (incomingToken !== configuredToken.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: '接口验证失败：Authorization Token 不匹配。请确保请求头中的 Bearer Token 与系统设置一致。' 
      }, { status: 401 });
    }

    // 2. 解析微信群发文章 JSON 载荷 (WeChat Media Item)
    const payload = await request.json();
    const articles = Array.isArray(payload.articles) ? payload.articles : [payload];

    if (articles.length === 0) {
      return NextResponse.json({ success: false, message: '请求体中未检测到有效的 articles 微信文章载荷。' }, { status: 400 });
    }

    console.log(`[WeChat Sync] 接收到公众号导入请求，共 ${articles.length} 篇文章，准备写入“公司动态”栏目...`);

    const importedIds = [];
    const skippedIds = [];

    // 3. 对每篇微信图文文章进行清洗、幂等校验并导入数据库
    for (const article of articles) {
      // 字段映射适配：微信原始字段 vs 官方 News 数据结构
      const title = article.title ? article.title.trim() : '';
      const excerpt = article.digest ? article.digest.trim() : (article.excerpt || '');
      const content = article.content || '';
      const wxLink = article.url || article.wxLink || ''; // 公众号原文群发链接
      
      // 如果没有标题或原文链接，跳过，保证动态列表数据健康
      if (!title || !wxLink) {
        continue;
      }

      // 格式化微信发布日期，若无则使用当前服务器时间
      let pubDate = '';
      if (article.publish_time) {
        const d = new Date(parseInt(article.publish_time) * 1000);
        pubDate = d.toISOString().split('T')[0]; // 输出 "YYYY-MM-DD"
      } else if (article.date) {
        pubDate = article.date;
      } else {
        pubDate = new Date().toISOString().split('T')[0];
      }

      // 微信防盗链封面大图兼容性处理：若微信图文防盗链，在此智能 fallback 至公司动态本地精美配图
      let imageUrl = article.thumb_url || article.image || '/img_news.png';
      // 如果封面图包含微信域名，且为了规避前台浏览器出现防盗链裂图，可在之后做媒体库本地化，这里预留占位
      if (imageUrl.includes('qpic.cn')) {
        // 预留：此处在二期可以编写 downloadImageToLocal() 下载函数把图片落盘为本地静态图片
        // 目前为了极速展示，依然保留该链接，或根据偏好采用备用大图
      }

      // 核心幂等保护：以唯一的公众号原文链接 (wxLink) 作为判重主键，防止多次同步产生重复的公司动态
      const existingNews = await prisma.news.findFirst({
        where: { wxLink: wxLink }
      });

      if (existingNews) {
        // 若文章已存在，执行更新 (更新最新内容与标题)，防止重复创建
        const updated = await prisma.news.update({
          where: { id: existingNews.id },
          data: {
            title,
            excerpt,
            content,
            image: imageUrl,
            date: pubDate,
          }
        });
        skippedIds.push(updated.id);
      } else {
        // 若文章不存在，执行全新创建，直接自动归档并呈现在公司动态列表中！
        const created = await prisma.news.create({
          data: {
            title,
            excerpt,
            content,
            image: imageUrl,
            date: pubDate,
            wxLink: wxLink
          }
        });
        importedIds.push(created.id);
      }
    }

    // 4. 重建全站受影响的页面缓存，使得前台公司动态、首页最新文章列表秒级呈现更新！
    revalidatePath('/');
    revalidatePath('/news');

    return NextResponse.json({
      success: true,
      message: `公众号文章同步成功！共导入 News 新增文章 ${importedIds.length} 篇，更新已有文章 ${skippedIds.length} 篇。`,
      importedNewsIds: importedIds,
      updatedNewsIds: skippedIds
    });

  } catch (error) {
    console.error('[WeChat Sync API Error]:', error);
    return NextResponse.json({ 
      success: false, 
      message: '服务器同步接口发生内部异常。', 
      error: error.message 
    }, { status: 500 });
  }
}
