import Link from 'next/link';
import ContactForm from '../../components/ContactForm';
import { getSystemConfigs } from '../../lib/config';

export const metadata = {
  title: '联系我们 - 云南星势力航空科技有限公司',
  description: '期待与您的每一次沟通，欢迎随时咨询无人机维修、培训与项目合作',
};

export default async function ContactPage() {
  const configs = await getSystemConfigs();

  const address = configs.contact_address || '云南省昆明市盘龙区联盟街道办事处\n北京路924号财智心景大厦1701-1702';
  const phone = configs.contact_phone || '400-XXX-XXXX';
  const email = configs.contact_email || 'contact@ynxslhk.com';
  const hours = configs.contact_hours || '周一至周六 09:00 - 18:00';
  const qrCode = configs.contact_qrcode || '/images/fav.png';
  const companyName = configs.company_name || '云南星势力航空科技有限公司';

  return (
    <>
      <div className="page-hero" style={{ backgroundImage: `url("${configs.banner_contact || '/img_service.png'}")` }}>
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <div className="breadcrumb"><Link href="/">首页</Link><span>/</span><span>联系我们</span></div>
          <h1>联系我们</h1>
          <p>期待与您的每一次沟通，欢迎随时咨询</p>
        </div>
      </div>

      <section style={{ background: '#f8f9fa', padding: '70px 5vw' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Contact Info */}
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ width: '40px', height: '3px', background: '#0056b3', marginBottom: '1.2rem' }} />
            <h2 style={{ fontSize: '1.7rem', color: '#222', marginBottom: '2rem' }}>联系方式</h2>
            {[
              { icon: '📍', title: '公司地址', content: address },
              { icon: '📞', title: '联系电话', content: phone },
              { icon: '✉️', title: '电子邮箱', content: email },
              { icon: '🕐', title: '服务时间', content: hours },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '1.4rem', background: '#e8f0fb', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#222', marginBottom: '0.3rem', fontSize: '0.95rem' }}>{item.title}</div>
                  <div style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{item.content}</div>
                </div>
              </div>
            ))}

            {/* WeChat QR */}
            <div style={{ background: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <div style={{ width: '120px', height: '120px', background: '#f0f0f0', borderRadius: '8px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={qrCode} alt="微信公众号二维码" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>扫码关注公众号</p>
              <p style={{ color: '#555', fontSize: '0.82rem', fontWeight: 500 }}>{companyName}</p>
            </div>
          </div>

          {/* Form */}
          <div style={{ flex: '1 1 420px', background: '#fff', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#222', marginBottom: '0.5rem' }}>在线咨询</h3>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2rem' }}>填写信息，我们将尽快与您联系</p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
