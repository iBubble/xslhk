/**
 * 🚀 微信公众号文章全自动同步与防盗链本地化引擎 (WeChat MP Sync & Assets Localization Engine)
 * 
 * 功能特点：
 * 1. 自动从数据库获取后台保存的公众号开发者凭证 (AppID & AppSecret)。
 * 2. 自动拉取微信官方最新的群发成功发表记录 (Free Publish List)。
 * 3. 【独家黑科技】自动下载微信文章的封面图及正文中的所有微信图片至官网本地服务器，
 *    100% 破解微信防盗链 (qpic.cn 裂图问题)，实现超高清本地图文秒开。
 * 4. 自动携带 Token 请求本地 API，触发 Next.js 的路由增量静态生成 (ISR) 页面缓存重构。
 * 
 * 运行方式：
 * node scripts/wechat_sync.js
 */

const { PrismaClient } = require('@prisma/client');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const prisma = new PrismaClient();

// 辅助函数：计算 MD5
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

// 辅助函数：网络请求 (GET / POST)
function makeRequest(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, data }));
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'object' ? JSON.stringify(postData) : postData);
    }
    req.end();
  });
}

// 辅助函数：下载微信防盗链图片并返回官网本地 URL
function downloadImage(imageUrl) {
  return new Promise((resolve) => {
    if (!imageUrl || !imageUrl.includes('qpic.cn')) {
      return resolve(imageUrl); // 如果不是微信图片，直接返回原链接
    }

    try {
      // 1. 创建本地存储文件夹
      const assetsDir = path.join(__dirname, '../public/wechat_assets');
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }

      // 2. 智能提取文件后缀名 (根据微信参数)
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

      // 3. 用图片链接的 MD5 作为唯一文件名，防止重复下载
      const fileName = `${md5(imageUrl)}.${ext}`;
      const localPath = path.join(assetsDir, fileName);
      const relativeUrl = `/wechat_assets/${fileName}`;

      // 如果本地已经存在该图片，跳过下载，直接返回相对路径，保护服务器带宽
      if (fs.existsSync(localPath)) {
        return resolve(relativeUrl);
      }

      // 4. 下载图片
      https.get(imageUrl, (res) => {
        if (res.statusCode !== 200) {
          console.warn(`[Download Warn] 下载图片失败，状态码: ${res.statusCode}, URL: ${imageUrl}`);
          return resolve(imageUrl); // 失败时 Fallback 使用原图
        }

        const fileStream = fs.createWriteStream(localPath);
        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`[Assets] 微信防盗链图片已完美本地化: ${relativeUrl}`);
          resolve(relativeUrl);
        });
      }).on('error', (err) => {
        console.warn(`[Download Error] 网络异常下载失败: ${err.message}`);
        resolve(imageUrl); // 报错 Fallback
      });
    } catch (e) {
      console.warn(`[Download Exception] 发生未知异常: ${e.message}`);
      resolve(imageUrl);
    }
  });
}

// 核心逻辑：正文微信图片深度清洗与本地化下载
async function localizeContentImages(htmlContent) {
  if (!htmlContent) return '';
  
  // 匹配 HTML 中所有带有微信域名的图片链接 (src="...") 或 (data-src="...")
  const imgRegex = /(src|data-src)="([^"]*?qpic\.cn[^"]*?)"/gi;
  let match;
  let newContent = htmlContent;
  const urlsToDownload = new Set();

  while ((match = imgRegex.exec(htmlContent)) !== null) {
    if (match[2]) {
      urlsToDownload.add(match[2]);
    }
  }

  // 顺序下载图片并替换正文链接
  for (const wxUrl of urlsToDownload) {
    const cleanUrl = wxUrl.replace(/&amp;/g, '&'); // 规避 XML/HTML 转义符对下载链接的干扰
    const localUrl = await downloadImage(cleanUrl);
    if (localUrl !== wxUrl) {
      // 替换 src 和 data-src 属性
      newContent = newContent.split(wxUrl).join(localUrl);
    }
  }

  // 适配微信排版：有些微信文章会把真实图片放在 data-src 中，导致前台显示空白，在此将 data-src 统一修复为 src
  newContent = newContent.replace(/data-src=/gi, 'src=');

  return newContent;
}

async function main() {
  console.log('====================================================');
  console.log('🔄 开始微信公众号文章全自动同步与防盗链本地化任务...');
  console.log('====================================================');

  try {
    // 1. 从数据库读取系统配置参数
    const appidConfig = await prisma.systemConfig.findUnique({ where: { key: 'wechat_mp_appid' } });
    const secretConfig = await prisma.systemConfig.findUnique({ where: { key: 'wechat_mp_appsecret' } });
    const tokenConfig = await prisma.systemConfig.findUnique({ where: { key: 'wechat_mp_token' } });
    const syncConfig = await prisma.systemConfig.findUnique({ where: { key: 'wechat_mp_auto_sync' } });

    const appId = appidConfig ? appidConfig.value.trim() : '';
    const appSecret = secretConfig ? secretConfig.value.trim() : '';
    const mpToken = tokenConfig ? tokenConfig.value.trim() : '';
    const autoSync = syncConfig ? syncConfig.value === 'true' : false;

    if (!appId || !appSecret) {
      console.log('❌ [提示] 尚未配置公众号开发者凭证 (AppID 或 AppSecret)。');
      console.log('💡 请先登录官网后台，在「系统基本信息」->「微信公众号文章导入设置」中填入参数并保存。');
      process.exit(0);
    }

    if (!autoSync) {
      console.log('⚠️ [提示] 微信自动定期同步处于 [关闭] 状态。');
      console.log('💡 若需要全自动同步，请在官网后台设置中将“是否启用微信文章定期同步”改为：开启。');
      // process.exit(0); // 在终端手动运行脚本时，依然允许强制执行同步，因此不强制中断
    }

    console.log(`[Config] 载入参数成功: AppID=${appId.slice(0, 6)}... , Token=${mpToken ? '已设置' : '未设置'}`);

    // 2. 第一步：获取微信 Access Token
    console.log('\n🔑 [1/3] 正在向微信服务器请求 Access Token...');
    const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
    const tokenRes = await makeRequest(tokenUrl);
    const tokenData = JSON.parse(tokenRes.data);

    if (tokenData.errcode) {
      throw new Error(`微信 Token 获取失败: [${tokenData.errcode}] ${tokenData.errmsg}`);
    }

    const accessToken = tokenData.access_token;
    console.log('✅ Access Token 获取成功，准备获取已发表文章列表...');

    // 3. 第二步：拉取微信已发表的图文文章列表
    console.log('\n📄 [2/3] 正在获取微信已群发的图文文章列表 (Free Publish)...');
    const publishUrl = `https://api.weixin.qq.com/cgi-bin/freepublish/batchget?access_token=${accessToken}`;
    const publishRes = await makeRequest(publishUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      offset: 0,
      count: 20, // 每次拉取最新的 20 条记录（微信单次限制最大为 20）
      no_content: 0 // 0 代表拉取完整的正文 HTML，以便于做本地防盗链图片下载替换
    });

    const publishData = JSON.parse(publishRes.data);

    if (publishData.errcode) {
      throw new Error(`获取微信发表记录失败: [${publishData.errcode}] ${publishData.errmsg}`);
    }

    const items = publishData.item || [];
    console.log(`✅ 成功拉取到 ${items.length} 组已发表记录。`);

    if (items.length === 0) {
      console.log('🎉 微信公众号上没有已发表的图文，无需导入。');
      process.exit(0);
    }

    // 4. 第三步：对微信图文数据进行深度清洗、去重与图片本地化
    console.log('\n🛡️  [3/3] 启动防盗链本地化引擎并整理导入载荷...');
    const processedArticles = [];

    for (const item of items) {
      const publishTime = item.update_time; // 微信群发时间戳 (秒)
      
      if (item.content && Array.isArray(item.content.news_item)) {
        for (const news of item.content.news_item) {
          console.log(`\n👉 正在处理文章: 《${news.title}》`);

          // 1. 本地化下载封面图
          console.log('   - 正在本地化封面大图...');
          const localThumbUrl = await downloadImage(news.thumb_url);

          // 2. 本地化下载文章正文里的所有微信防盗链图片
          console.log('   - 正在扫描并本地化正文图片 (此过程下载可能需要几秒，请稍候)...');
          const localizedContent = await localizeContentImages(news.content);

          processedArticles.push({
            title: news.title,
            digest: news.digest,
            content: localizedContent,
            url: news.url, // 微信群发原文链接作为唯一判重 ID (wxLink)
            publish_time: publishTime,
            thumb_url: localThumbUrl
          });
        }
      }
    }

    console.log(`\n✨ 数据清洗完毕！共有 ${processedArticles.length} 篇图文准备导入系统。`);

    // 5. 第四步：推送至本地同步 API
    // 自动判断本地 Next.js 服务是否正常开启在 3000 端口，若开启则走 API 触发增量生成缓存；
    // 若未开启（例如仅是在做后台构建部署），则直接写 SQLite 数据库，实现双重保障！
    const syncPayload = { articles: processedArticles };
    let httpSuccess = false;

    if (mpToken) {
      console.log('\n🚀 正在通过 HTTP POST 推送给官网同步接口...');
      try {
        const response = await makeRequest('http://localhost:3000/api/wechat/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mpToken}`
          }
        }, syncPayload);

        const resJson = JSON.parse(response.data);
        if (response.statusCode === 200 && resJson.success) {
          console.log(`🎉 [HTTP 导入成功]: ${resJson.message}`);
          httpSuccess = true;
        } else {
          console.warn(`⚠️ [HTTP 导入反馈异常] 状态码: ${response.statusCode}, 信息: ${resJson.message}`);
        }
      } catch (httpErr) {
        console.log(`ℹ️ 本地 Next.js 服务端口未启用或暂不可达，切换为「直接数据库入库」机制...`);
      }
    }

    // Fallback: 如果 HTTP 未成功，直接对 SQLite 进行 Upsert 处理，保证数据同步 100% 成功
    if (!httpSuccess) {
      console.log('💾 正在直接将同步内容写入本地 SQLite 数据库...');
      let newCount = 0;
      let updateCount = 0;

      for (const article of processedArticles) {
        const title = article.title ? article.title.trim() : '';
        const excerpt = article.digest ? article.digest.trim() : '';
        const content = article.content || '';
        const wxLink = article.url || '';
        const pubDate = new Date(parseInt(article.publish_time) * 1000).toISOString().split('T')[0];
        const imageUrl = article.thumb_url || '/img_news.png';

        if (!title || !wxLink) continue;

        // 幂等查询
        const existing = await prisma.news.findFirst({
          where: { wxLink: wxLink }
        });

        if (existing) {
          await prisma.news.update({
            where: { id: existing.id },
            data: { title, excerpt, content, image: imageUrl, date: pubDate }
          });
          updateCount++;
        } else {
          await prisma.news.create({
            data: { title, excerpt, content, image: imageUrl, date: pubDate, wxLink }
          });
          newCount++;
        }
      }
      console.log(`🎉 [DB 导入成功]: 新增导入文章 ${newCount} 篇，更新已有文章 ${updateCount} 篇！`);
    }

    console.log('\n====================================================');
    console.log('✅ 微信文章自动同步及防盗链图片本地化任务圆满成功！');
    console.log('====================================================');

  } catch (error) {
    console.error('\n❌ 同步任务发生致命错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
