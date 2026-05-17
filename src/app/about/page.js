import Link from 'next/link';
import prisma from '../../lib/prisma';

export const metadata = {
  title: '关于星势力 - 云南星势力航空科技有限公司',
  description: '了解云南星势力航空科技有限公司的发展历程、企业使命与服务优势',
};

import { getSystemConfigs } from '../../lib/config';

export default async function About() {
  await getSystemConfigs();
  const contents = await prisma.aboutContent.findMany();
  const cm = {};
  contents.forEach(c => { cm[c.section] = c; });

  return (
    <>
      <div className="page-hero" style={{ backgroundImage: 'url("/img_about.png")' }}>
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <div className="breadcrumb"><Link href="/">首页</Link><span>/</span><span>关于星势力</span></div>
          <h1>关于星势力</h1>
          <p>深耕航空科技，引领低空经济新纪元</p>
        </div>
      </div>

      <section style={{ background: '#fff', padding: '80px 5vw' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ width: '40px', height: '3px', background: '#0056b3', marginBottom: '1.2rem' }} />
            <h2 style={{ fontSize: '1.9rem', color: '#222', marginBottom: '1.5rem' }}>{cm['intro']?.title || '公司简介'}</h2>
            <div 
              style={{ color: '#555', lineHeight: 1.9, marginBottom: '1rem' }}
              dangerouslySetInnerHTML={{ __html: cm['intro']?.content || '云南星势力航空科技有限公司，位于云南省昆明市盘龙区，是一家专注于无人机专业培训、技术维修及行业应用解决方案的科技企业。公司拥有经验丰富的技术研发与培训团队，承接各类多旋翼、固定翼、复合翼无人机的维修、改装与飞控调参业务，同时开展无人机维修技术培训课程，助力更多从业者掌握核心技术。我们与云南省多所高校、职业院校及行业单位建立了深度合作关系，致力于推动低空经济人才培养与产业生态建设。' }}
            />
            <Link href="/contact" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>联系我们</Link>
          </div>
          <div style={{ flex: '1 1 380px' }}>
            <img src={cm['intro']?.image || '/img_about.png'} alt="公司介绍"
              style={{ width: '100%', height: '380px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }} />
          </div>
        </div>
      </section>

      <div className="data-strip">
        {[['500+','培训学员'],['10+','专业课程'],['5年+','行业经验'],['50+','合作企业']].map(([n,l]) => (
          <div key={l}><div className="num">{n}</div><div className="label">{l}</div></div>
        ))}
      </div>

      <section style={{ background: '#f8f9fa', padding: '80px 5vw' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-header">
            <h2>使命与愿景</h2>
            <p>以创新为驱动，助力低空经济高质量发展</p>
            <div className="divider" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              { icon: '🎯', title: '企业使命', key: 'mission', def: '为无人机行业培养高素质技术人才，提供专业可靠的维修与应用服务，推动西南地区低空经济持续发展。' },
              { icon: '🔭', title: '企业愿景', key: 'vision', def: '成为西南地区最具影响力的无人机培训与技术服务企业，让每一位学员都能掌握过硬的专业技能。' },
              { icon: '💡', title: '核心价值观', key: 'values', def: '专业严谨、诚信服务、持续创新、客户至上。用技术说话，用结果证明价值。' },
            ].map((item) => (
              <div key={item.key} style={{ background: '#fff', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1.2rem' }}>{item.icon}</div>
                <h3 style={{ color: '#222', marginBottom: '1rem' }}>{item.title}</h3>
                <div 
                  style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.8 }}
                  dangerouslySetInnerHTML={{ __html: cm[item.key]?.content || item.def }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: '#fff', padding: '80px 5vw' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-header">
            <h2>我们的优势</h2>
            <p>专业资质认证、丰富实战经验、全方位服务保障</p>
            <div className="divider" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            {[
              { icon: '🏆', title: 'CAAC认证', desc: '持有民航局认证资质，课程体系符合国家标准' },
              { icon: '👨‍🔧', title: '专业团队', desc: '核心成员均具备多年无人机维修与培训经验' },
              { icon: '🔩', title: '设备齐全', desc: '配备先进的检测与维修设备，支持各主流机型' },
              { icon: '📋', title: '完善体系', desc: '系统化课程设计，理论与实操全面覆盖' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb', transition: 'all 0.3s' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem', background: '#e8f0fb', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.1rem', color: '#222', marginBottom: '0.6rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'linear-gradient(135deg, #0056b3, #003d82)', padding: '70px 5vw', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>与我们携手共创未来</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '2.5rem' }}>欢迎来电咨询或亲临参观，期待与您合作</p>
        <Link href="/contact" className="btn-white">立即联系</Link>
      </section>
    </>
  );
}
