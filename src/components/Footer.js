"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer({ configs = {} }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/demo') || pathname?.startsWith('/admin') || pathname?.startsWith('/auth')) return null;

  const logoUrl = configs.logo_url || '/demo/logo.png';
  const companyName = configs.company_name || '云南星势力航空科技有限公司';
  const address = configs.contact_address || '云南省昆明市盘龙区联盟街道北京路924号财智心景大厦1701-1702';
  const phone = configs.contact_phone || '400-XXX-XXXX';
  const email = configs.contact_email || 'contact@ynxslhk.com';
  const icp = configs.icp_record || '滇ICP备2026007307号';

  return (
    <footer style={{ background: '#1a1a2e', color: '#aaa', marginTop: 'auto' }}>
      <div style={{ borderBottom: '1px solid #2a2a3e', padding: '60px 5vw 40px' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem',
        }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <img
              src={logoUrl}
              alt="星势力航空科技"
              style={{ height: '44px', width: 'auto', filter: 'brightness(0) invert(1)', marginBottom: '1.2rem' }}
            />
            <p style={{ color: '#888', fontSize: '0.88rem', lineHeight: 1.8, marginBottom: '1rem' }}>
              {companyName}<br />
              创造天空生产力，领航低空经济新纪元。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1.2rem', fontWeight: 600 }}>快速导航</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {[
                { label: '首页', href: '/' },
                { label: '关于星势力', href: '/about' },
                { label: '公司动态', href: '/news' },
                { label: '无人机维修课程', href: '/courses' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} style={{ color: '#888', fontSize: '0.88rem', transition: 'color 0.2s' }} className="footer-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1.2rem', fontWeight: 600 }}>业务板块</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {[
                { label: '风采展示', href: '/showcase' },
                { label: '项目合作', href: '/cooperation' },
                { label: '联系我们', href: '/contact' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} style={{ color: '#888', fontSize: '0.88rem', transition: 'color 0.2s' }} className="footer-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1.2rem', fontWeight: 600 }}>联系方式</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <span style={{ color: '#0078d4', flexShrink: 0, marginTop: '2px' }}>📍</span>
                <span style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {address}
                </span>
              </li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: '#0078d4' }}>📞</span>
                <span style={{ color: '#888', fontSize: '0.85rem' }}>{phone}</span>
              </li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: '#0078d4' }}>✉️</span>
                <span style={{ color: '#888', fontSize: '0.85rem' }}>{email}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '18px 5vw',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        fontSize: '0.82rem',
        color: '#555',
      }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span>© {new Date().getFullYear()} {companyName} 版权所有</span>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#555', transition: 'color 0.2s' }}
            className="footer-link-muted"
          >
            {icp}
          </a>
        </div>
        <div style={{ display: 'flex', gap: '1.2rem' }}>
          <Link href="/contact" style={{ color: '#555' }} className="footer-link-muted">隐私政策</Link>
          <Link href="/contact" style={{ color: '#555' }} className="footer-link-muted">服务条款</Link>
        </div>
      </div>

      <style>{`
        .footer-link:hover { color: #fff !important; }
        .footer-link-muted:hover { color: #aaa !important; }
      `}</style>
    </footer>
  );
}
