import Link from 'next/link';
import prisma from '../../lib/prisma';
import ShowcaseGallery from '../../components/ShowcaseGallery';
import { getSystemConfigs } from '../../lib/config';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '风采展示 - 云南星势力航空科技有限公司',
  description: '展示云南星势力航空科技团队风采、活动现场、培训实况与精彩成果',
};

export default async function ShowcasePage() {
  const configs = await getSystemConfigs();
  const items = await prisma.showcaseItem.findMany({ orderBy: { id: 'desc' } });

  return (
    <>
      <div className="page-hero" style={{ backgroundImage: `url("${configs.banner_showcase || '/img_cases.png'}")` }}>
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <div className="breadcrumb"><Link href="/">首页</Link><span>/</span><span>{configs.banner_showcase_title || '风采展示'}</span></div>
          <h1>{configs.banner_showcase_title || '风采展示'}</h1>
          <p>{configs.banner_showcase_desc || '记录每一次飞翔，展示我们的专业与热情'}</p>
        </div>
      </div>
      <section style={{ background: '#f8f9fa', padding: '70px 5vw', minHeight: '500px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-header">
            <h2>精彩瞬间</h2>
            <p>团队风采、实训现场、飞行活动与合作成果</p>
            <div className="divider" />
          </div>

          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: '#999' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</div>
              <p>精彩内容即将上线，敬请期待</p>
            </div>
          ) : (
            <ShowcaseGallery items={items} />
          )}
        </div>
      </section>

      <section style={{ background: 'linear-gradient(135deg, #0056b3, #003d82)', padding: '70px 5vw', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>加入我们的团队</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '2.5rem' }}>与志同道合的航空人共同创造精彩</p>
        <Link href="/contact" className="btn-white">联系我们</Link>
      </section>
    </>
  );
}
