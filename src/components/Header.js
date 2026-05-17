"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { label: '首页', href: '/' },
  { label: '关于星势力', href: '/about' },
  { label: '公司动态', href: '/news' },
  { label: '无人机维修课程', href: '/courses' },
  { label: '风采展示', href: '/showcase' },
  { label: '项目合作', href: '/cooperation' },
  { label: '联系我们', href: '/contact' },
];

export default function Header({ logoUrl = '/demo/logo.png' }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname?.startsWith('/demo') || pathname?.startsWith('/admin') || pathname?.startsWith('/auth')) return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        background: '#fff',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.3s ease',
        height: '76px',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1300px',
          margin: '0 auto',
          padding: '0 4vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img src={logoUrl} alt="星势力航空科技" style={{ height: '66px', width: 'auto' }} />
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', height: '100%' }} className="desktop-nav">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 14px',
                    fontSize: '14.5px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#0056b3' : '#333',
                    transition: 'color 0.25s',
                    whiteSpace: 'nowrap',
                  }}
                  className="nav-link"
                >
                  {item.label}
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: isActive ? '100%' : '0%',
                    height: '3px',
                    background: '#0056b3',
                    transition: 'width 0.3s ease',
                  }} className="nav-underline" />
                </Link>
              );
            })}
          </nav>

          {/* CTA Button */}
          <Link href="/contact" className="btn-primary" style={{
            padding: '8px 22px',
            fontSize: '14px',
            display: 'none',
          }} id="header-cta">
            咨询预约
          </Link>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'none' }}
            className="hamburger-btn"
            aria-label="菜单"
          >
            <span style={{ display: 'block', width: '22px', height: '2px', background: '#333', margin: '5px 0', transition: 'all 0.3s' }} />
            <span style={{ display: 'block', width: '22px', height: '2px', background: '#333', margin: '5px 0', transition: 'all 0.3s' }} />
            <span style={{ display: 'block', width: '22px', height: '2px', background: '#333', margin: '5px 0', transition: 'all 0.3s' }} />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: '76px',
          left: 0,
          right: 0,
          background: '#fff',
          zIndex: 999,
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          padding: '1rem 0',
        }}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '14px 5vw',
                  fontSize: '15px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#0056b3' : '#333',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: '76px' }} />

      <style>{`
        .desktop-nav { display: flex !important; }
        .hamburger-btn { display: none !important; }
        #header-cta { display: inline-block !important; }
        .nav-link:hover { color: #0056b3 !important; }
        .nav-link:hover .nav-underline { width: 100% !important; }
        @media (max-width: 960px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: block !important; }
          #header-cta { display: none !important; }
        }
        @media (max-width: 480px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </>
  );
}
