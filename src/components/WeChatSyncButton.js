'use client';

import React, { useState } from 'react';

export default function WeChatSyncButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleOpen = () => {
    setIsOpen(true);
    setUrl('');
    setStatus(null);
  };

  const handleClose = () => {
    if (loading) return;
    setIsOpen(false);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!url.trim()) {
      setStatus({ type: 'error', message: '请先输入公众号文章链接地址！' });
      return;
    }
    if (!url.trim().includes('mp.weixin.qq.com')) {
      setStatus({ type: 'error', message: '链接格式有误，请输入以 mp.weixin.qq.com 开头的微信公众号文章地址。' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/wechat/import-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({
          type: 'success',
          message: data.message,
        });
        setTimeout(() => {
          setIsOpen(false);
          window.location.reload();
        }, 3000);
      } else {
        setStatus({
          type: 'error',
          message: data.message || '抓取失败，请检查文章链接是否有效或稍后重试。',
        });
      }
    } catch (err) {
      console.error('Import WeChat article error:', err);
      setStatus({
        type: 'error',
        message: '连接抓取服务失败，请检查您的网络连接或服务器日志。',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        onClick={handleOpen}
        style={{
          background: 'linear-gradient(135deg, #07c160 0%, #05a04e 100%)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '0.6rem 1.4rem',
          borderRadius: '8px',
          fontSize: '0.88rem',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 12px rgba(7, 193, 96, 0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(7, 193, 96, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(7, 193, 96, 0.2)';
        }}
      >
        <span style={{ fontSize: '1rem' }}>📥</span>
        导入公众号文章
      </button>

      {/* 弹出式 Modal 窗口 */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(5, 5, 8, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{
            background: '#0e1017',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            width: '580px',
            maxWidth: '90%',
            padding: '2.2rem',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
            animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
          }}>
            {/* 头部 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span>📥</span> 导入微信公众号文章
              </h3>
              <button
                onClick={handleClose}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '1.4rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  padding: 0,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.color = '#f8fafc'; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.color = '#64748b'; }}
              >
                ×
              </button>
            </div>

            {/* 描述信息 */}
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
              输入您要导入的微信公众号文章 URL。系统将自动抓取该网页，下载封面图片，提取图文正文内容并优化所有排版格式（自动关联文章原格式及防盗链图片），一键添加到您的“公司动态”文章列表中。
            </p>

            {/* 表单 */}
            <form onSubmit={handleImport} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}>文章链接地址 (URL)</label>
                <input
                  type="url"
                  required
                  disabled={loading}
                  placeholder="https://mp.weixin.qq.com/s/SwS6dSxZbTSITmDUuGW-fw"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="admin-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.88rem',
                    borderColor: loading ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
                  }}
                />
              </div>

              {/* 结果和状态通知反馈 */}
              {status && (
                <div style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  backgroundColor: status.type === 'success' ? 'rgba(7,193,96,0.08)' : 'rgba(239,68,68,0.08)',
                  border: status.type === 'success' ? '1px solid rgba(7,193,96,0.2)' : '1px solid rgba(239,68,68,0.2)',
                  color: status.type === 'success' ? '#34d399' : '#f87171',
                }}>
                  {status.type === 'success' ? '🎉' : '⚠️'} {status.message}
                </div>
              )}

              {/* 操作栏 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#94a3b8',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.color = '#f8fafc'; }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.color = '#94a3b8'; }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading ? '#1e293b' : 'linear-gradient(135deg, #07c160 0%, #05a04e 100%)',
                    color: loading ? '#64748b' : '#ffffff',
                    border: 'none',
                    padding: '0.6rem 1.8rem',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 12px rgba(7, 193, 96, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                >
                  {loading && (
                    <span style={{
                      display: 'inline-block',
                      animation: 'spin 1.2s linear infinite',
                      fontSize: '1rem',
                    }}>
                      🌀
                    </span>
                  )}
                  {loading ? '正在抓取并排版文章...' : '开始抓取并导入'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 动画所需的 CSS 样式注入 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
