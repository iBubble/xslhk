'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { name: '控制台大盘', path: '/admin', icon: '📊' },
    { name: '基本信息', path: '/admin/config', icon: '⚙️' },
    { name: '栏目管理', path: '/admin/columns', icon: '📁' },
    { name: '首页轮播图', path: '/admin/hero', icon: '🎠' },
    { name: '公司动态', path: '/admin/news', icon: '📰' },
    { name: '维修课程列表', path: '/admin/courses', icon: '🔧' },
    { name: '风采展示', path: '/admin/showcase', icon: '🖼️' },
    { name: '项目合作', path: '/admin/cooperation', icon: '🤝' },
    { name: '关于页内容', path: '/admin/about', icon: '🏢' },
    { name: '联络与工单', path: '/admin/contacts', icon: '📞' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: '0', backgroundColor: '#0a0b10' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        backgroundColor: '#0e1017',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 200,
      }}>
        {/* Logo area */}
        <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <img src="/images/LOGO.png" alt="星势力" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
          </Link>
          <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.5rem' }}>后台管理系统</p>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.path || (
                item.path !== '/admin' && 
                pathname?.startsWith(item.path) && 
                !navItems.some(otherItem => otherItem.path !== item.path && otherItem.path.startsWith(item.path) && pathname.startsWith(otherItem.path))
              );
              return (
                <li key={item.path}>
                  <Link href={item.path} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    padding: item.isSub ? '0.5rem 0.9rem 0.5rem 2.2rem' : '0.7rem 0.9rem',
                    borderRadius: '8px',
                    backgroundColor: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: isActive ? '#60a5fa' : (item.isSub ? '#64748b' : '#94a3b8'),
                    fontWeight: isActive ? 500 : 400,
                    fontSize: item.isSub ? '0.82rem' : '0.88rem',
                    transition: 'all 0.2s',
                    borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                  }}>
                    <span style={{ fontSize: item.isSub ? '0.95rem' : '1.1rem', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/admin/password" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.7rem 0.9rem', color: '#94a3b8', fontSize: '0.85rem', borderRadius: '8px' }}>
            <span>🔐</span> 修改密码
          </Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.7rem 0.9rem', color: '#94a3b8', fontSize: '0.85rem', borderRadius: '8px' }}>
            <span>🏠</span> 返回前台
          </Link>
          <Link href="/api/auth/signout" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.7rem 0.9rem', color: '#ff6b6b', fontSize: '0.85rem', borderRadius: '8px' }}>
            <span>🚪</span> 退出登录
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '240px', padding: '2.5rem', minHeight: '100vh', overflowY: 'auto', color: '#f8fafc' }}>
        {children}
      </main>
    </div>
  );
}
