import Head from 'next/head';
import Link from 'next/link';

export default function Repair() {
  return (
    <>
      <Head>
        <title>无人机维修 - 星势力航空科技</title>
      </Head>

      <div style={{
        height: '400px',
        position: 'relative',
        backgroundImage: 'url("/img_repair.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,5,5,0.4) 0%, rgba(5,5,5,0.8) 100%)' }} />
        <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', paddingBottom: '3rem' }}>
          <div>
            <h1 style={{ marginBottom: '1rem' }}>专业 <span style={{ color: 'var(--text-secondary)' }}>维修保养</span></h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-primary)', opacity: 0.9 }}>
              拥有高级维修工程师团队与原厂级诊断设备，让您的无人机重焕新生。
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '4rem 1.5rem' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center', marginBottom: '5rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>精准诊断 快修快返</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              我们处理包括大疆全系（Mavic、Phantom、Inspire、Matrice矩阵系列等）在内的各类消费级、行业级机型的故障维修。
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}><span style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-glass)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>✓</span> 进水清理与电路板修复</li>
              <li style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}><span style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-glass)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>✓</span> 云台相机畸变校正与排线更换</li>
              <li style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}><span style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-glass)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>✓</span> 机臂、电机及外壳硬损伤修复</li>
              <li style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}><span style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-glass)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>✓</span> 飞行控制器数据读取与状态分析</li>
            </ul>
          </div>
          <div style={{ height: '400px', borderRadius: '12px', backgroundImage: 'url("/card_repair.png")', backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--border-glass)', boxShadow: 'var(--shadow-premium)' }}>
          </div>
        </div>

        <div className="glass-effect" style={{ padding: '3rem', borderRadius: '8px', textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔧</div>
          <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>全周期保养计划</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>为行业级重载设备提供定期健康检查与深度去污保养，消除飞行隐患，延长作业寿命。</p>
        </div>

        <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px solid var(--border-glass)', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>需要维修支持？</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>填写保修/维修申请单，我们的技术专家会尽快联系您。</p>
          <Link href="/contact?type=repair" className="btn-primary">申请维修</Link>
        </div>
      </div>
    </>
  );
}
