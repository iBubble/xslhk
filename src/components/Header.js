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
  
  // 🔍 全局搜索相关状态
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  if (pathname?.startsWith('/demo') || pathname?.startsWith('/admin') || pathname?.startsWith('/auth')) return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 1. 搜索模态框事件监听与自动聚焦
  useEffect(() => {
    if (!isSearchOpen) {
      setSearchQuery('');
      setSearchResults(null);
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    
    // 锁定背景滚动
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    // 延迟聚焦输入框，确保 DOM 已加载
    const timer = setTimeout(() => {
      const searchInput = document.getElementById('global-search-input');
      if (searchInput) searchInput.focus();
    }, 100);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isSearchOpen]);

  // 2. 防抖实时全局模糊搜索效果 (300ms)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

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

          {/* 右侧动作控制组合 (搜索按钮、咨询预约、移动端菜单) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* 全局搜索按钮 */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '50%',
                color: '#333',
                transition: 'all 0.2s ease',
              }}
              className="search-trigger-btn"
              aria-label="全局搜索"
              title="全局搜索"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* CTA 咨询预约按钮 */}
            <Link href="/contact" className="btn-primary" style={{
              padding: '8px 22px',
              fontSize: '14px',
              display: 'none',
            }} id="header-cta">
              咨询预约
            </Link>

            {/* 移动端汉堡包菜单按钮 */}
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
        </div>
      </header>

      {/* 移动端悬浮菜单 */}
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

      {/* ===== 🔍 全局搜索弹窗 (Modal) ===== */}
      {isSearchOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '60px 20px 20px 20px',
          boxSizing: 'border-box',
          overflowY: 'auto',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={() => setIsSearchOpen(false)}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '700px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxSizing: 'border-box',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem' }}>🔍</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1e293b' }}>全站智能搜索</span>
              </div>
              <button 
                onClick={() => setIsSearchOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  transition: 'background-color 0.2s',
                }}
                className="search-close-btn"
              >
                ✕
              </button>
            </div>

            {/* 搜索框 */}
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                id="global-search-input"
                type="text"
                placeholder="搜索无人机维修课程、动态文章、合作项目..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 44px 14px 16px',
                  fontSize: '15px',
                  borderRadius: '10px',
                  border: '2px solid #e2e8f0',
                  outline: 'none',
                  transition: 'all 0.2s',
                  background: '#f8fafc',
                  color: '#334155',
                  boxSizing: 'border-box',
                }}
                className="global-search-field"
              />
              <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                {isSearching ? (
                  <span className="search-spinner" />
                ) : searchQuery ? (
                  <button 
                    onClick={() => setSearchQuery('')}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', fontSize: '14px', padding: '4px' }}
                  >
                    ✕
                  </button>
                ) : null}
              </div>
            </div>

            {/* 结果显示区 */}
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }} className="search-results-scroll">
              {!searchQuery && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  <p style={{ fontSize: '13.5px', margin: 0 }}>💡 支持对本站的维修课程、微信文章、合作项目、风采展示进行全局模糊搜索</p>
                </div>
              )}

              {searchQuery && !searchResults && isSearching && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: '#64748b' }}>
                  <span className="search-spinner" style={{ display: 'inline-block', marginBottom: '8px' }} />
                  <p style={{ fontSize: '13px', margin: 0 }}>正在搜寻全站数据中...</p>
                </div>
              )}

              {searchResults && (
                (() => {
                  const hasCourses = searchResults.courses?.length > 0;
                  const hasNews = searchResults.news?.length > 0;
                  const hasCooperation = searchResults.cooperation?.length > 0;
                  const hasShowcase = searchResults.showcase?.length > 0;
                  const hasAny = hasCourses || hasNews || hasCooperation || hasShowcase;

                  if (!hasAny) {
                    return (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                        <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '8px' }}>🕵️‍♂️</span>
                        <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 6px 0', color: '#334155' }}>未找到与“{searchQuery}”相关的结果</p>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>您可以尝试更换其他关键词重新搜索</p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                      {/* 1. 维修课程分类 */}
                      {hasCourses && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#0056b3', background: '#e8f0fb', padding: '4px 10px', borderRadius: '4px', marginBottom: '8px', width: 'fit-content' }}>
                            🎓 无人机维修课程培训
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {searchResults.courses.map(item => (
                              <Link 
                                key={item.id} 
                                href={`/courses/${item.id}`}
                                onClick={() => setIsSearchOpen(false)}
                                style={{ display: 'block', padding: '10px 12px', borderRadius: '8px', transition: 'background-color 0.2s', textDecoration: 'none' }}
                                className="search-result-item"
                              >
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '3px' }}>{item.title}</div>
                                <div style={{ fontSize: '12.5px', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. 公司动态分类 */}
                      {hasNews && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '4px', marginBottom: '8px', width: 'fit-content' }}>
                            📰 公司最新动态
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {searchResults.news.map(item => (
                              <Link 
                                key={item.id} 
                                href={`/news/${item.id}`}
                                onClick={() => setIsSearchOpen(false)}
                                style={{ display: 'block', padding: '10px 12px', borderRadius: '8px', transition: 'background-color 0.2s', textDecoration: 'none' }}
                                className="search-result-item"
                              >
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '3px' }}>{item.title}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#64748b' }}>
                                  <span style={{ whiteSpace: 'nowrap' }}>{item.date}</span>
                                  <span>•</span>
                                  <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.excerpt}</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. 项目合作分类 */}
                      {hasCooperation && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 10px', borderRadius: '4px', marginBottom: '8px', width: 'fit-content' }}>
                            🤝 业务合作项目
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {searchResults.cooperation.map(item => (
                              <Link 
                                key={item.id} 
                                href="/cooperation"
                                onClick={() => setIsSearchOpen(false)}
                                style={{ display: 'block', padding: '10px 12px', borderRadius: '8px', transition: 'background-color 0.2s', textDecoration: 'none' }}
                                className="search-result-item"
                              >
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '3px' }}>{item.title}</div>
                                <div style={{ fontSize: '12.5px', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {item.partner && <span style={{ marginRight: '8px', color: '#334155', fontWeight: 500 }}>合作对象: {item.partner}</span>}
                                  {item.description}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4. 风采展示分类 */}
                      {hasShowcase && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', padding: '4px 10px', borderRadius: '4px', marginBottom: '8px', width: 'fit-content' }}>
                            📸 团队与现场风采展示
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {searchResults.showcase.map(item => (
                              <Link 
                                key={item.id} 
                                href="/showcase"
                                onClick={() => setIsSearchOpen(false)}
                                style={{ display: 'block', padding: '10px 12px', borderRadius: '8px', transition: 'background-color 0.2s', textDecoration: 'none' }}
                                className="search-result-item"
                              >
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '3px' }}>{item.title}</div>
                                <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '3px', marginRight: '8px', fontSize: '11px' }}>{item.category}</span>
                                  <span>查看详情</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

            {/* 底部按键提示 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '14px', fontSize: '12px', color: '#94a3b8' }}>
              <span>💡 输入内容即时获取搜索结果</span>
              <span>键盘 <b>ESC</b> 退出</span>
            </div>
          </div>
        </div>
      )}

      {/* 占位间距 */}
      <div style={{ height: '76px' }} />

      <style>{`
        .desktop-nav { display: flex !important; }
        .hamburger-btn { display: none !important; }
        #header-cta { display: inline-block !important; }
        .nav-link:hover { color: #0056b3 !important; }
        .nav-link:hover .nav-underline { width: 100% !important; }
        
        /* 🔍 全局搜索专属动态高感度样式 */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .search-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e2e8f0;
          border-top-color: #0056b3;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        .search-trigger-btn:hover {
          background-color: #f1f5f9 !important;
          color: #0056b3 !important;
        }
        .search-close-btn:hover {
          background-color: #e2e8f0 !important;
          color: #1e293b !important;
        }
        .global-search-field:focus {
          border-color: #0056b3 !important;
          box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.1) !important;
          background-color: #fff !important;
        }
        .search-result-item:hover {
          background-color: #f8fafc !important;
        }
        .search-result-item:hover div {
          color: #0056b3 !important;
        }
        .search-results-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .search-results-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .search-results-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 99px;
        }
        .search-results-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

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
