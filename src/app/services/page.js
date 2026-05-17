import Head from 'next/head';
import Link from 'next/link';

export default function Services() {
  return (
    <>
      <Head>
        <title>业务介绍 - 星势力航空科技</title>
      </Head>

      <div style={{
        height: '400px',
        position: 'relative',
        backgroundImage: 'url("/img_service.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,5,5,0.4) 0%, rgba(5,5,5,0.8) 100%)' }} />
        <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', paddingBottom: '3rem' }}>
          <div>
            <h1 style={{ marginBottom: '1rem' }}>我们的 <span style={{ color: 'var(--text-secondary)' }}>核心业务</span></h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-primary)', opacity: 0.9 }}>
              全场景无人机行业应用解决方案，量身定制，赋能产业数字化升级。
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
          
          <div className="premium-card" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 300px', height: '240px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', backgroundImage: 'url("/services_payload.png")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
            </div>
            <div style={{ flex: '2 1 400px' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>行业无人机定制研发</h2>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                针对特殊作业环境（如高海拔、强磁场、极高/低温等），提供飞行平台、挂载负载及图传链路的深度定制作业系统，满足军警、科研等高精尖领域需求。
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                <li>重载物流无人机平台定制</li>
                <li>多光谱/高光谱相机挂载集成</li>
                <li>定制化地面站与控制软件开发</li>
              </ul>
            </div>
          </div>

          <div className="premium-card" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', flexDirection: 'row-reverse' }}>
            <div style={{ flex: '1 1 300px', height: '240px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', backgroundImage: 'url("/card_industry.png")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
            </div>
            <div style={{ flex: '2 1 400px' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>农林植保与巡检方案</h2>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                将无人机应用下沉至一线作业，极大地提升农业喷洒效率和电力电网巡检的安全系数。
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                <li>大面积果林、农田全自动化喷洒</li>
                <li>高压输电走廊及风电叶片精细化巡检</li>
                <li>基于AI的三维建模与缺陷识别</li>
              </ul>
            </div>
          </div>

          <div className="premium-card" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 300px', height: '240px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', backgroundImage: 'url("/img_cases.png")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
            </div>
            <div style={{ flex: '2 1 400px' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>测绘与航拍服务</h2>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                提供厘米级高精度航测服务，结合倾斜摄影和激光雷达技术，输出高质量的实景三维模型（实景3D）。
              </p>
              <Link href="/contact" className="btn-outline">获取详细报价方案</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
