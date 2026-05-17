import Head from 'next/head';
import Link from 'next/link';

export default function Training() {
  return (
    <>
      <Head>
        <title>无人机培训 - 星势力航空科技</title>
      </Head>

      <div style={{
        height: '400px',
        position: 'relative',
        backgroundImage: 'url("/img_training.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,5,5,0.4) 0%, rgba(5,5,5,0.8) 100%)' }} />
        <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', paddingBottom: '3rem' }}>
          <div>
            <h1 style={{ marginBottom: '1rem' }}>无人机 <span style={{ color: 'var(--text-secondary)' }}>执照培训</span></h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-primary)', opacity: 0.9 }}>
              CAAC民航局授权认证持牌教员，为您提供专业、系统的无人机驾驶与应用培训。
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ height: '220px', backgroundImage: 'url("/card_training.png")', backgroundSize: 'cover', borderBottom: '1px solid var(--border-glass)' }} />
            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>多旋翼 (视距内/超视距)</h2>
              <p style={{ flex: 1, marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>最基础且市场需求最大的执照类型，适用于航拍、小范围巡检及基础应用场景。</p>
              <Link href="/contact" className="btn-outline" style={{ textAlign: 'center' }}>咨询报名</Link>
            </div>
          </div>

          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ height: '220px', backgroundImage: 'url("/home_hero.png")', backgroundSize: 'cover', borderBottom: '1px solid var(--border-glass)' }} />
            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>垂直起降固定翼 (超视距)</h2>
              <p style={{ flex: 1, marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>结合多旋翼的起落便利与固定翼的续航优势，广泛用于大面积测绘与长距离通道巡检。</p>
              <Link href="/contact" className="btn-outline" style={{ textAlign: 'center' }}>咨询报名</Link>
            </div>
          </div>

          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, borderColor: 'var(--accent-blue)' }}>
            <div style={{ height: '220px', backgroundImage: 'url("/img_news.png")', backgroundSize: 'cover', borderBottom: '1px solid var(--border-glass)' }} />
            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>教员等级培训</h2>
              <p style={{ flex: 1, marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>进阶认证，培养具备教学资质的高级人才，为航空事业输送中坚力量。</p>
              <Link href="/contact" className="btn-primary" style={{ textAlign: 'center' }}>挑战教员</Link>
            </div>
          </div>

        </div>

        <div style={{ marginTop: '5rem', padding: '4rem', background: 'var(--bg-glass)', borderRadius: '8px', border: '1px solid var(--border-glass)', backgroundImage: 'linear-gradient(to right, rgba(5,5,5,0.9), rgba(5,5,5,0.7)), url("/img_cases.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>培训优势</h2>
          <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
            <li><strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '1.2rem', marginBottom: '0.5rem' }}>01. 实机操作</strong> 全真机型实飞，保障充足上机时间</li>
            <li><strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '1.2rem', marginBottom: '0.5rem' }}>02. 小班授课</strong> 小班化授课，1对1动作精讲</li>
            <li><strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '1.2rem', marginBottom: '0.5rem' }}>03. 三维一体</strong> 理论+模拟+实操三维一体教学</li>
            <li><strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '1.2rem', marginBottom: '0.5rem' }}>04. 过考无忧</strong> 过考无忧，提供终身技术指导</li>
          </ul>
        </div>
      </div>
    </>
  );
}
