import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '../../../lib/prisma';
import DOMPurify from 'isomorphic-dompurify';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const item = await prisma.news.findUnique({ where: { id: parseInt(resolvedParams.id) } });
  if (!item) return { title: '未找到' };
  return { title: `${item.title} - 云南星势力航空科技` };
}

export default async function NewsDetail({ params }) {
  const resolvedParams = await params;
  const item = await prisma.news.findUnique({ where: { id: parseInt(resolvedParams.id) } });
  if (!item) notFound();

  const others = await prisma.news.findMany({ where: { id: { not: item.id } }, take: 3, orderBy: { date: 'desc' } });

  return (
    <>
      <div className="page-hero" style={{ backgroundImage: `url("${item.image || '/img_news.png'}")`, height: '320px' }}>
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <div className="breadcrumb">
            <Link href="/">首页</Link><span>/</span>
            <Link href="/news">公司动态</Link><span>/</span>
            <span>文章详情</span>
          </div>
        </div>
      </div>

      <section style={{ background: '#f8f9fa', padding: '50px 5vw' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Article */}
          <article style={{ flex: '1 1 600px', background: '#fff', borderRadius: '10px', padding: '2.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <span style={{ fontSize: '0.85rem', color: '#888' }}>{item.date}</span>
            <h1 style={{ fontSize: '1.7rem', color: '#222', margin: '1rem 0 1.5rem', lineHeight: 1.4, fontWeight: 700 }}>{item.title}</h1>
            <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem', color: '#555', lineHeight: 1.9, fontSize: '0.97rem' }}>
              {item.content ? (
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content) }} className="rich-content" />
              ) : (
                <div style={{ whiteSpace: 'pre-wrap' }}>{item.excerpt}</div>
              )}
            </div>
            {item.wxLink && (
              <div style={{ marginTop: '2rem', padding: '1rem 1.5rem', background: '#f0faf5', borderRadius: '8px', border: '1px solid #d4edda' }}>
                <a href={item.wxLink} target="_blank" rel="noreferrer" style={{ color: '#07c160', fontWeight: 500 }}>
                  📱 查看公众号原文
                </a>
              </div>
            )}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
              <Link href="/news" style={{ color: '#0056b3', fontSize: '0.9rem' }}>← 返回动态列表</Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside style={{ flex: '0 0 280px', minWidth: '240px' }}>
            <div style={{ background: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '1rem', color: '#222', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '2px solid #0056b3' }}>更多动态</h3>
              {others.map(n => (
                <Link key={n.id} href={`/news/${n.id}`} style={{ display: 'block', marginBottom: '1.2rem', paddingBottom: '1.2rem', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#999', display: 'block', marginBottom: '0.3rem' }}>{n.date}</span>
                  <span style={{ fontSize: '0.9rem', color: '#333', fontWeight: 500, lineHeight: 1.5, display: '-webkit-box', overflow: 'hidden', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{n.title}</span>
                </Link>
              ))}
              {others.length === 0 && <p style={{ color: '#999', fontSize: '0.85rem' }}>暂无其他动态</p>}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
