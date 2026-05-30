import Link from 'next/link';
import prisma from '../../lib/prisma';
import DOMPurify from 'isomorphic-dompurify';
import { getSystemConfigs } from '../../lib/config';

export const metadata = {
  title: '项目合作 - 云南星势力航空科技有限公司',
  description: '与云南星势力航空科技开展无人机应用项目合作，共同推动低空经济发展',
};

export const dynamic = 'force-dynamic';

export default async function CooperationPage(props) {
  const configs = await getSystemConfigs();
  const searchParams = await props.searchParams;
  const pageVal = searchParams?.page;
  const page = (pageVal && !isNaN(parseInt(pageVal))) ? parseInt(pageVal) : 1;

  const pageSize = 10;
  const totalCount = await prisma.cooperationProject.count();
  const totalPages = Math.ceil(totalCount / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));

  const projects = await prisma.cooperationProject.findMany({
    orderBy: { id: 'desc' },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  return (
    <>
      <div className="page-hero" style={{ backgroundImage: `url("${configs.banner_cooperation || '/img_service.png'}")` }}>
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <div className="breadcrumb"><Link href="/">首页</Link><span>/</span><span>{configs.banner_cooperation_title || '项目合作'}</span></div>
          <h1>{configs.banner_cooperation_title || '项目合作'}</h1>
          <p>{configs.banner_cooperation_desc || '携手共赢，共同推动低空经济与无人机产业发展'}</p>
        </div>
      </div>

      {/* Cooperation Modes */}
      <section style={{ background: '#fff', padding: '80px 5vw' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-header">
            <h2>合作模式</h2>
            <p>多种合作方式，灵活匹配您的业务需求</p>
            <div className="divider" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {[
              { icon: '🎓', title: '产教融合合作', desc: '与高校、职业院校共建无人机专业实训基地，提供课程资源、教具设备及师资培训，联合培养专业人才。' },
              { icon: '🔧', title: '技术服务合作', desc: '承接企业级无人机维修、改装、飞控调参及技术咨询服务，提供长期技术支持与保障协议。' },
              { icon: '✈️', title: '飞行作业合作', desc: '为农林、电力、测绘、应急等行业提供无人机飞行作业外包服务，配备持证飞手与专业设备。' },
              { icon: '🤝', title: '品牌代理合作', desc: '欢迎有资源、有渠道的合作伙伴加入，共同推广星势力航空科技培训课程与技术服务品牌。' },
            ].map((item, i) => (
              <div key={i} className="hover-border" style={{ padding: '2.5rem', border: '1px solid #e5e7eb', borderRadius: '12px', cursor: 'default' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '1.2rem', background: '#e8f0fb', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
                <h3 style={{ color: '#222', fontSize: '1.15rem', marginBottom: '0.8rem' }}>{item.title}</h3>
                <p style={{ color: '#666', fontSize: '0.92rem', lineHeight: 1.8 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      {projects.length > 0 && (
        <section style={{ background: '#f8f9fa', padding: '80px 5vw' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="section-header">
              <h2>合作案例</h2>
              <p>与众多企业及院校的成功合作经验</p>
              <div className="divider" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {projects.map((project, i) => (
                <div key={project.id} style={{
                  display: 'flex', gap: '2.5rem', alignItems: 'center',
                  flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
                  background: '#fff', borderRadius: '12px', overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)', flexWrap: 'wrap',
                }}>
                  <div style={{ flex: '0 0 360px', minWidth: '260px', maxWidth: '360px' }}>
                    <img src={project.image} alt={project.title} style={{ width: '100%', height: '260px', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div style={{ flex: 1, padding: '2rem', minWidth: '260px' }}>
                    {project.partner && (
                      <span style={{ background: '#e8f0fb', color: '#0056b3', padding: '3px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
                        合作方：{project.partner}
                      </span>
                    )}
                    <h3 style={{ fontSize: '1.3rem', color: '#222', margin: '1rem 0 0.8rem' }}>{project.title}</h3>
                    <p style={{ color: '#666', lineHeight: 1.9, fontSize: '0.95rem' }}>{project.description}</p>
                    {project.content && (
                      <div 
                        style={{ color: '#555', lineHeight: 1.9, fontSize: '0.92rem', marginTop: '0.8rem' }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.content) }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Premium Pagination Component */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3.5rem', alignItems: 'center' }}>
                <style>{`
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
                {currentPage > 1 && (
                  <Link href={`/cooperation?page=1`} className="page-btn">首页</Link>
                )}
                {currentPage > 1 && (
                  <Link href={`/cooperation?page=${currentPage - 1}`} className="page-btn">《</Link>
                )}
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const p = idx + 1;
                  const isCurrent = p === currentPage;
                  return (
                    <Link
                      key={p}
                      href={`/cooperation?page=${p}`}
                      className={isCurrent ? "page-btn active" : "page-btn"}
                    >
                      {p}
                    </Link>
                  );
                })}

                {currentPage < totalPages && (
                  <Link href={`/cooperation?page=${currentPage + 1}`} className="page-btn">》</Link>
                )}
                {currentPage < totalPages && (
                  <Link href={`/cooperation?page=${totalPages}`} className="page-btn">尾页</Link>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Why Partner */}
      <section style={{ background: '#fff', padding: '80px 5vw' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="section-header">
            <h2>为何选择我们</h2>
            <p>专业实力与诚信服务，是合作的最好基础</p>
            <div className="divider" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[
              ['🏅', '专业资质', 'CAAC认证，规范运营'],
              ['💪', '实力团队', '技术过硬，经验丰富'],
              ['⚡', '高效执行', '快速响应，按时交付'],
              ['🔒', '诚信合作', '合同规范，长期共赢'],
              ['📈', '持续创新', '紧跟行业趋势，技术持续升级'],
            ].map(([icon, title, desc], i) => (
              <div key={i} style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>{icon}</div>
                <h4 style={{ color: '#222', marginBottom: '0.4rem', fontSize: '1rem' }}>{title}</h4>
                <p style={{ color: '#888', fontSize: '0.85rem' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #0056b3, #003d82)', padding: '70px 5vw', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>期待与您携手合作</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '2.5rem' }}>请填写您的联系方式，我们将在24小时内与您取得联系</p>
        <Link href="/contact" className="btn-white">立即洽谈合作</Link>
      </section>
    </>
  );
}
