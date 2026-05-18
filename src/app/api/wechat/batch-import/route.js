import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '../../../../lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, message: '未授权' }, { status: 401 });
  }

  try {
    const { articles } = await request.json();
    if (!Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({ success: false, message: '未检测到有效文章数据' }, { status: 400 });
    }

    let importedCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (const article of articles) {
      try {
        const title = (article.title || '').trim();
        const excerpt = (article.digest || article.excerpt || '').trim();
        const wxLink = (article.url || article.link || '').trim();
        const imageUrl = article.thumb_url || article.cover || '/img_news.png';

        if (!title) continue;

        let pubDate = new Date().toISOString().split('T')[0];
        if (article.publish_time) {
          const ts = parseInt(article.publish_time);
          if (!isNaN(ts)) pubDate = new Date(ts * 1000).toISOString().split('T')[0];
        } else if (article.date) {
          pubDate = article.date;
        }

        if (wxLink) {
          const existing = await prisma.news.findFirst({ where: { wxLink } });
          if (existing) {
            await prisma.news.update({
              where: { id: existing.id },
              data: { title, excerpt, image: imageUrl, date: pubDate }
            });
            updatedCount++;
            continue;
          }
        }

        await prisma.news.create({
          data: { title, excerpt, content: '', image: imageUrl, date: pubDate, wxLink: wxLink || '' }
        });
        importedCount++;
      } catch (e) {
        errors.push(e.message);
      }
    }

    revalidatePath('/');
    revalidatePath('/news');
    revalidatePath('/admin/news');

    return NextResponse.json({
      success: true,
      message: `导入完成！新增 ${importedCount} 篇，更新 ${updatedCount} 篇。${errors.length > 0 ? `（${errors.length} 条错误已跳过）` : ''}`,
      importedCount,
      updatedCount,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
