import Link from 'next/link';
import prisma from '../../lib/prisma';

export const metadata = {
  title: '无人机维修课程 - 云南星势力航空科技有限公司',
  description: '专业无人机维修课程，涵盖多旋翼、固定翼、飞控调参等全系列技术培训',
};

import { getSystemConfigs } from '../../lib/config';

export const dynamic = 'force-dynamic';

export default async function CoursesPage(props) {
  await getSystemConfigs();
  const searchParams = await props.searchParams;
  const pageVal = searchParams?.page;
  const page = (pageVal && !isNaN(parseInt(pageVal))) ? parseInt(pageVal) : 1;

  const pageSize = 10;
  const totalCount = await prisma.courseItem.count();
  const totalPages = Math.ceil(totalCount / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));

  const courses = await prisma.courseItem.findMany({
    orderBy: { id: 'desc' },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  const defaultCourses = [
    { id: 'a', title: '多旋翼无人机维修基础', category: '基础课程', description: '掌握多旋翼无人机的基本结构原理，学习电机、电调、电池、飞控等核心部件的常见故障诊断与维修技能。', duration: '3天', price: '面议', image: '/card_repair.png' },
    { id: 'b', title: '固定翼无人机维修进阶', category: '进阶课程', description: '深入学习固定翼无人机的伺服系统、电调、动力总成及通讯链路 of 综合维修与调试技术，适合有一定基础的学员。', duration: '5天', price: '面议', image: '/card_training.png' },
    { id: 'c', title: '无人机飞控调参实战', category: '实战课程', description: '掌握主流飞控系统（ArduPilot、PX4、DJI）的参数调试与PID整定核心技术，实操比例占比80%以上。', duration: '3天', price: '面议', image: '/card_industry.png' },
    { id: 'd', title: '无人机图传与数链维修', category: '专项课程', description: '专项讲解图像传输系统、遥控数链模块的工作原理、常见干扰排查及硬件级维修方法，含天线焊接实操。', duration: '2天', price: '面议', image: '/card_repair.png' },
  ];

  const displayCourses = courses.length > 0 ? courses : defaultCourses;

  return (
    <>
      <div className="page-hero" style={{ backgroundImage: 'url("/img_repair.png")' }}>
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <div className="breadcrumb"><Link href="/">首页</Link><span>/</span><span>无人机维修课程</span></div>
          <h1>无人机维修课程</h1>
          <p>系统学习，实操为主，掌握无人机维修核心技能</p>
        </div>
      </div>

      {/* Intro */}
      <section style={{ background: '#fff', padding: '60px 5vw' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 420px' }}>
            <div style={{ width: '40px', height: '3px', background: '#0056b3', marginBottom: '1.2rem' }} />
            <h2 style={{ fontSize: '1.9rem', color: '#222', marginBottom: '1.2rem' }}>为什么选择我们的课程？</h2>
            <p style={{ color: '#555', lineHeight: 1.9, marginBottom: '1.5rem' }}>
              星势力航空科技拥有专业的无人机维修培训基地，配备齐全的实训设备与真实机型，由具备丰富实战经验的技术工程师担任讲师。
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {['80%实操比例，真机拆装练习','资深工程师全程授课指导','小班制教学，一对一答疑','结业颁发培训证书','终身免费复训一次'].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#444', fontSize: '0.95rem' }}>
                  <span style={{ color: '#0056b3', fontWeight: 700, fontSize: '1.1rem' }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: '1 1 360px' }}>
            <img src="/img_repair.png" alt="维修课程" style={{ width: '100%', height: '360px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }} />
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section style={{ background: '#f8f9fa', padding: '80px 5vw' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-header">
            <h2>课程介绍</h2>
            <p>全系列无人机维修课程，满足不同层次学员需求</p>
            <div className="divider" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {displayCourses.map((course, i) => (
              <div key={course.id ?? i} className="hover-lift" style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
                <div style={{ height: '200px', overflow: 'hidden' }}>
                  <img src={course.image || '/card_repair.png'} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <span style={{ background: '#e8f0fb', color: '#0056b3', padding: '3px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 500 }}>
                    {course.category || '维修课程'}
                  </span>
                  <h3 style={{ margin: '1rem 0 0.6rem', fontSize: '1.1rem', color: '#222' }}>{course.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: '#666', lineHeight: 1.7, marginBottom: '1.2rem' }}>{course.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
                    {course.duration && <span style={{ fontSize: '0.83rem', color: '#888' }}>⏱ {course.duration}</span>}
                    {course.price && <span style={{ color: '#0056b3', fontWeight: 600, fontSize: '0.95rem' }}>{course.price}</span>}
                  </div>
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
                <Link href={`/courses?page=1`} className="page-btn">首页</Link>
              )}
              {currentPage > 1 && (
                <Link href={`/courses?page=${currentPage - 1}`} className="page-btn">《</Link>
              )}
              
              {Array.from({ length: totalPages }).map((_, idx) => {
                const p = idx + 1;
                const isCurrent = p === currentPage;
                return (
                  <Link
                    key={p}
                    href={`/courses?page=${p}`}
                    className={isCurrent ? "page-btn active" : "page-btn"}
                  >
                    {p}
                  </Link>
                );
              })}

              {currentPage < totalPages && (
                <Link href={`/courses?page=${currentPage + 1}`} className="page-btn">》</Link>
              )}
              {currentPage < totalPages && (
                <Link href={`/courses?page=${totalPages}`} className="page-btn">尾页</Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #0056b3, #003d82)', padding: '70px 5vw', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>报名咨询</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '2.5rem' }}>想了解更多课程详情或报名参加，欢迎联系我们</p>
        <Link href="/contact" className="btn-white">立即咨询报名</Link>
      </section>
    </>
  );
}
