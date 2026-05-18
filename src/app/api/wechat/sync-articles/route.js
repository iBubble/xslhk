import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '../../../../lib/prisma';
import { getSystemConfig } from '../../../../lib/config';
import { revalidatePath } from 'next/cache';
import { execSync } from 'child_process';

/**
 * 用 curl 替代 Node.js fetch 调用微信 API（规避服务器 IPv6/DNS 兼容性问题）
 */
function curlGet(url) {
  try {
    const result = execSync(
      `curl -s --max-time 15 --ipv4 "${url}"`,
      { encoding: 'utf8' }
    );
    return JSON.parse(result);
  } catch (e) {
    throw new Error(`curl GET 失败: ${e.message}`);
  }
}

function curlPost(url, body) {
  try {
    const bodyStr = JSON.stringify(body).replace(/"/g, '\\"');
    const result = execSync(
      `curl -s --max-time 15 --ipv4 -X POST "${url}" -H "Content-Type: application/json" -d "${bodyStr}"`,
      { encoding: 'utf8' }
    );
    return JSON.parse(result);
  } catch (e) {
    throw new Error(`curl POST 失败: ${e.message}`);
  }
}

/**
 * 🔄 微信公众号主动同步接口
 * 支持：
 * 1. 管理员登录后在后台点击一键同步
 * 2. 外部定时脚本通过 Bearer Token 定期触发
 *
 * ⚠️ 注意：仅能同步通过"发表"按钮发布的文章（新版系统）。
 *    通过旧版"群发"发布的文章请使用 POST /api/wechat/sync 手动推送。
 */
export async function POST(request) {
  try {
    // 1. 权限校验：优先 Session，其次 Bearer Token
    let isAuthorized = false;
    const session = await getServerSession();
    if (session) {
      isAuthorized = true;
    } else {
      const authHeader = request.headers.get('authorization');
      const incomingToken = authHeader ? authHeader.replace('Bearer ', '').trim() : '';
      const configuredToken = await getSystemConfig('wechat_mp_token');
      if (configuredToken && incomingToken === configuredToken.trim()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({
        success: false,
        message: '未授权：请先登录后台或提供有效的 Bearer Token 验证令牌。'
      }, { status: 401 });
    }

    // 2. 获取公众号配置
    const appid = await getSystemConfig('wechat_mp_appid');
    const appsecret = await getSystemConfig('wechat_mp_appsecret');

    if (!appid || !appsecret) {
      return NextResponse.json({
        success: false,
        message: '同步失败：请先在"系统基本信息"中配置微信开发者 AppID 和 AppSecret。'
      }, { status: 400 });
    }

    console.log(`[WeChat Sync] 开始拉取文章 (AppID: ${appid})...`);

    // 3. 获取 access_token（使用 curl 避免 Node.js IPv6 问题）
    const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid.trim()}&secret=${appsecret.trim()}`;
    const tokenData = curlGet(tokenUrl);

    if (!tokenData.access_token) {
      return NextResponse.json({
        success: false,
        message: `获取微信凭证失败：[${tokenData.errcode || '未知'}] ${tokenData.errmsg || 'AppID 或 AppSecret 不正确'}`
      }, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // 4. 拉取已发表图文（freepublish - 新版"发表"系统）
    const batchUrl = `https://api.weixin.qq.com/cgi-bin/freepublish/batchget?access_token=${accessToken}`;
    const batchData = curlPost(batchUrl, { offset: 0, count: 20, no_content: 0 });

    if (batchData.errcode && batchData.errcode !== 0) {
      if (batchData.errcode === 48001) {
        return NextResponse.json({
          success: false,
          errcode: 48001,
          message: '接口未授权（48001）：您的公众号未通过认证，无法调用此接口。'
        }, { status: 403 });
      }
      return NextResponse.json({
        success: false,
        message: `拉取失败：[${batchData.errcode}] ${batchData.errmsg || '接口调用受限'}`
      }, { status: 400 });
    }

    const items = batchData.item || [];

    // 5. 如果 freepublish 返回空（旧版群发文章不在此接口），给出明确提示
    if (items.length === 0) {
      return NextResponse.json({
        success: false,
        errcode: 'EMPTY_FREEPUBLISH',
        message: '新版"发表"文章列表为空（共 0 篇）。\n\n您公众号的文章是通过旧版"群发"方式发布的，微信官方接口暂不支持通过 API 拉取群发历史文章。\n\n✅ 解决方案：请前往"公司动态管理"页面，点击"发布新动态"，手动填写文章标题、摘要和公众号原文链接，或使用第三方工具向本站 POST /api/wechat/sync 接口推送文章数据。',
        hint: 'use_manual_import'
      }, { status: 200 });
    }

    // 6. 写入数据库
    let importedCount = 0;
    let updatedCount = 0;

    for (const item of items) {
      const updateTime = item.update_time || item.content?.update_time;
      const pubDate = updateTime
        ? new Date(updateTime * 1000).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const newsItemArray = item.content?.news_item || [];

      for (const newsItem of newsItemArray) {
        const title = newsItem.title ? newsItem.title.trim() : '';
        const excerpt = newsItem.digest ? newsItem.digest.trim() : '';
        const content = newsItem.content || '';
        const wxLink = newsItem.url || '';
        const imageUrl = newsItem.thumb_url || '/img_news.png';

        if (!title || !wxLink) continue;

        const existing = await prisma.news.findFirst({ where: { wxLink } });

        if (existing) {
          await prisma.news.update({
            where: { id: existing.id },
            data: { title, excerpt, content, image: imageUrl, date: pubDate }
          });
          updatedCount++;
        } else {
          await prisma.news.create({
            data: { title, excerpt, content, image: imageUrl, date: pubDate, wxLink }
          });
          importedCount++;
        }
      }
    }

    revalidatePath('/');
    revalidatePath('/news');
    revalidatePath('/admin/news');

    return NextResponse.json({
      success: true,
      message: `同步成功！新增文章 ${importedCount} 篇，更新已有文章 ${updatedCount} 篇。`,
      importedCount,
      updatedCount
    });

  } catch (error) {
    console.error('[WeChat Sync API Error]:', error);
    return NextResponse.json({
      success: false,
      message: `同步接口内部异常：${error.message}`,
    }, { status: 500 });
  }
}
