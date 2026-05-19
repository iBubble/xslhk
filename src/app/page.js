import Link from 'next/link';
import prisma from '../lib/prisma';
import HomeHeroCarousel from '../components/HomeHeroCarousel';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '首页 - 云南星势力航空科技有限公司',
  description: '云南星势力航空科技有限公司官方网站，专业无人机维修课程、风采展示、项目合作',
};

import { getSystemConfigs } from '../lib/config';

export default async function Home() {
  const configs = await getSystemConfigs();

  let newsList = [];
  let courses = [];
  let showcaseItems = [];
  let heroSlides = [];

  try {
    const results = await Promise.all([
      prisma.news.findMany({ orderBy: { date: 'desc' }, take: 3 }).catch(() => []),
      prisma.courseItem.findMany({ orderBy: { id: 'desc' }, take: 3 }).catch(() => []),
      prisma.showcaseItem.findMany({ orderBy: { id: 'desc' }, take: 8 }).catch(() => []),
      prisma.heroSlide.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => []),
    ]);
    newsList = results[0];
    courses = results[1];
    showcaseItems = results[2];
    heroSlides = results[3].map(slide => {
      let img = slide.image;
      if (slide.id === 2 || (slide.title && (slide.title.includes("维保") || slide.title.includes("维修")))) {
        img = "/img_repair.png";
      }
      return { ...slide, image: img };
    });
  } catch (err) {
    console.error("首页数据拉取发生忙锁或其它异常，已自动无缝切换到静态灾备高可用缓存数据:", err);
  }

  const defaultCourses = [
    { id: 'a', title: '多旋翼无人机维修基础', description: '掌握多旋翼无人机的基本结构原理与常见故障诊断维修技能', category: '基础课程', image: '/card_repair.png' },
    { id: 'b', title: '固定翼无人机维修进阶', description: '深入学习固定翼无人机的电调、飞控、动力系统综合维修', category: '进阶课程', image: '/card_training.png' },
    { id: 'c', title: '无人机飞控调参实战', description: '掌握主流飞控系统的参数调试与PID整定核心技术', category: '实战课程', image: '/card_industry.png' },
  ];

  const displayCourses = courses.length > 0 ? courses : defaultCourses;

  return (
    <>
      <style>{`
        .home-course-card { transition: transform 0.3s, box-shadow 0.3s; }
        .home-course-card:hover { transform: translateY(-8px); box-shadow: 0 15px 35px rgba(0,0,0,0.12); }
        .home-news-link .home-news-card { transition: transform 0.3s, box-shadow 0.3s; }
        .home-news-link:hover .home-news-card { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(0,0,0,0.12); }
        .home-news-link .home-news-card img { transition: transform 0.4s ease; }
        .home-news-link:hover .home-news-card img { transform: scale(1.06); }
        .showcase-thumb { overflow: hidden; border-radius: 8px; aspect-ratio: 4/3; }
        .showcase-thumb img { transition: transform 0.5s ease; display: block; width: 100%; height: 100%; object-fit: cover; }
        .showcase-thumb:hover img { transform: scale(1.08); }
        .about-link-btn { display: inline-block; border: 2px solid rgba(255,255,255,0.7); color: #fff; padding: 12px 28px; border-radius: 8px; font-weight: 500; font-size: 1rem; transition: background 0.3s; }
        .about-link-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
      `}</style>

      {/* ===== HERO CAROUSEL ===== */}
      <HomeHeroCarousel slides={heroSlides} />

      {/* ===== DATA STRIP ===== */}
      <div className="data-strip">
        {[
          [configs.home_stat1_num || '500+', configs.home_stat1_label || '培训学员'],
          [configs.home_stat2_num || '10+', configs.home_stat2_label || '维修课程'],
          [configs.home_stat3_num || '5年+', configs.home_stat3_label || '行业经验'],
          [configs.home_stat4_num || '100%', configs.home_stat4_label || '客户满意度']
        ].map(([n, l], index) => (
          <div key={index}><div className="num">{n}</div><div className="label">{l}</div></div>
        ))}
      </div>

      {/* ===== ABOUT PREVIEW ===== */}
      <section style={{ background: '#fff', padding: '80px 5vw' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ width: '40px', height: '3px', background: '#0056b3', marginBottom: '1.2rem' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#222', marginBottom: '1.2rem' }}>关于星势力航空</h2>
            <p style={{ color: '#555', lineHeight: 1.9, marginBottom: '1.2rem' }}>
              云南星势力航空科技有限公司，专注于无人机专业培训、技术维修及行业定制解决方案，是云南省具有影响力的低空经济服务企业。
            </p>
            <p style={{ color: '#555', lineHeight: 1.9, marginBottom: '2rem' }}>
              我们拥有经验丰富的技术团队，承接各类无人机维修、改装与课程培训业务，致力于为客户提供专业、高效、可靠的航空科技服务。
            </p>
            <Link href="/about" className="btn-primary">了解更多</Link>
          </div>
          <div style={{ flex: '1 1 400px' }}>
            <img src="/img_about.png" alt="关于星势力" style={{ width: '100%', height: '380px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }} />
          </div>
        </div>
      </section>

      {/* ===== COURSES PREVIEW ===== */}
      <section style={{ background: '#f8f9fa', padding: '80px 5vw' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-header">
            <h2>无人机维修课程</h2>
            <p>专业系统的课程体系，理论与实操并重，助您掌握核心技术</p>
            <div className="divider" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            {displayCourses.map((course, i) => (
              <div key={course.id ?? i} className="home-course-card" style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
                <div style={{ height: '220px', overflow: 'hidden' }}>
                  <img src={course.image || '/card_repair.png'} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <span style={{ background: '#e8f0fb', color: '#0056b3', padding: '3px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 500 }}>{course.category}</span>
                  <h3 style={{ marginTop: '1rem', marginBottom: '0.6rem', fontSize: '1.15rem' }}>{course.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>{course.description}</p>
                  {(course.duration || course.price) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {course.duration && <span style={{ fontSize: '0.85rem', color: '#888' }}>⏱ {course.duration}</span>}
                      {course.price && <span style={{ color: '#0056b3', fontWeight: 600 }}>{course.price}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link href="/courses" className="btn-primary">查看全部课程</Link>
          </div>
        </div>
      </section>

      {/* ===== SHOWCASE PREVIEW ===== */}
      {showcaseItems.length > 0 && (
        <section style={{ background: '#fff', padding: '80px 5vw' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="section-header">
              <h2>风采展示</h2>
              <p>展示我们的团队风采、活动现场与优秀成果</p>
              <div className="divider" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem', marginBottom: '3rem' }}>
              {showcaseItems.map(item => (
                <div key={item.id} className="showcase-thumb">
                  <img src={item.image} alt={item.title} />
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link href="/showcase" className="btn-primary">查看更多</Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== NEWS PREVIEW ===== */}
      <section style={{ background: '#f8f9fa', padding: '80px 5vw' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-header">
            <h2>公司动态</h2>
            <p>同步云南星势力航空科技公众号最新资讯</p>
            <div className="divider" />
          </div>
          {newsList.length > 0 ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                {newsList.map(item => (
                  <Link key={item.id} href={`/news/${item.id}`} className="home-news-link" style={{ display: 'block' }}>
                    <div className="home-news-card" style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
                      <div style={{ height: '200px', overflow: 'hidden' }}>
                        <img src={item.image || '/img_news.png'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '1.4rem' }}>
                        <span style={{ fontSize: '0.82rem', color: '#888', display: 'block', marginBottom: '0.6rem' }}>{item.date}</span>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#222', marginBottom: '0.6rem' }}>{item.title}</h3>
                        <p style={{ fontSize: '0.88rem', color: '#666' }}>{item.excerpt}</p>
                        <div style={{ marginTop: '1rem', color: '#0056b3', fontSize: '0.88rem', fontWeight: 500 }}>阅读全文 →</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div style={{ textAlign: 'center' }}>
                <Link href="/news" className="btn-primary">查看全部动态</Link>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#999' }}>暂无动态，敬请期待</div>
          )}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ background: 'linear-gradient(135deg, #0056b3 0%, #003d82 100%)', padding: '80px 5vw', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '1rem' }}>准备好开启合作了吗？</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '2.5rem', fontSize: '1.05rem' }}>
          无论是课程咨询、维修预约，还是项目合作，星势力航空科技随时为您服务。
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/contact" className="btn-white">立即联系我们</Link>
          <Link href="/cooperation" className="about-link-btn">项目合作</Link>
        </div>
      </section>
    </>
  );
}
