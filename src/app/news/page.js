import Link from 'next/link';
import prisma from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '公司动态 - 云南星势力航空科技有限公司',
  description: '同步云南星势力航空科技公众号最新资讯与公司动态',
};

export default async function NewsPage(props) {
  const searchParams = await props.searchParams;
  const pageVal = searchParams?.page;
  const page = (pageVal && !isNaN(parseInt(pageVal))) ? parseInt(pageVal) : 1;

  const pageSize = 10;
  const totalCount = await prisma.news.count();
  const totalPages = Math.ceil(totalCount / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));

  const newsList = await prisma.news.findMany({
    orderBy: { id: 'desc' },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  return (
    <>
      <style>{`
        .news-card { transition: transform 0.3s, box-shadow 0.3s; }
        .news-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.12) !important; }
        .news-card img { transition: transform 0.4s ease; }
        .news-card:hover img { transform: scale(1.04); }
        .page-btn {
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #4b5563;
          font-size: 0.88rem;
          font-weight: 500;
          transition: all 0.2s;
          text-decoration: none;
        }
        .page-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
          color: #1f2937;
        }
        .page-btn.active {
          background: #0056b3;
          border-color: #0056b3;
          color: #fff;
          box-shadow: 0 4px 10px rgba(0,86,179,0.25);
        }
      `}</style>

      <div className="page-hero" style={{ backgroundImage: 'url("/img_news.png")' }}>
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <div className="breadcrumb"><Link href="/">首页</Link><span>/</span><span>公司动态</span></div>
          <h1>公司动态</h1>
          <p>同步"云南星势力航空科技有限公司"公众号最新内容</p>
        </div>
      </div>

      <section style={{ background: '#f8f9fa', padding: '60px 5vw', minHeight: '400px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {newsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '6rem 0', color: '#999' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📰</div>
              <p style={{ fontSize: '1.1rem' }}>暂无动态，敬请期待</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {newsList.map((item) => (
                <div key={item.id} className="news-card" style={{
                  background: '#fff', borderRadius: '10px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  display: 'flex', overflow: 'hidden', flexWrap: 'wrap',
                }}>
                  <div style={{ flex: '0 0 280px', minHeight: '200px', overflow: 'hidden', position: 'relative' }}>
                    <img src={item.image || '/img_news.png'} alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '200px', display: 'block' }} />
                  </div>
                  <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '280px' }}>
                    <span style={{ fontSize: '0.83rem', color: '#888', display: 'block', marginBottom: '0.7rem' }}>{item.date}</span>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#222', marginBottom: '0.8rem', lineHeight: 1.4 }}>{item.title}</h2>
                    <p style={{ color: '#666', fontSize: '0.93rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>{item.excerpt}</p>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Link href={`/news/${item.id}`} style={{ color: '#0056b3', fontSize: '0.9rem', fontWeight: 500, borderBottom: '1px solid #0056b3', paddingBottom: '2px' }}>
                        阅读全文 →
                      </Link>
                      {item.wxLink && (
                        <a href={item.wxLink} target="_blank" rel="noreferrer" style={{ color: '#07c160', fontSize: '0.85rem' }}>
                          📱 查看公众号原文
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Premium Pagination Component */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3.5rem', alignItems: 'center' }}>
              {currentPage > 1 && (
                <Link href={`/news?page=1`} className="page-btn">首页</Link>
              )}
              {currentPage > 1 && (
                <Link href={`/news?page=${currentPage - 1}`} className="page-btn">《</Link>
              )}
              
              {Array.from({ length: totalPages }).map((_, idx) => {
                const p = idx + 1;
                const isCurrent = p === currentPage;
                return (
                  <Link
                    key={p}
                    href={`/news?page=${p}`}
                    className={isCurrent ? "page-btn active" : "page-btn"}
                  >
                    {p}
                  </Link>
                );
              })}

              {currentPage < totalPages && (
                <Link href={`/news?page=${currentPage + 1}`} className="page-btn">》</Link>
              )}
              {currentPage < totalPages && (
                <Link href={`/news?page=${totalPages}`} className="page-btn">尾页</Link>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
