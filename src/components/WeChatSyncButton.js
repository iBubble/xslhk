'use client';

import React, { useState } from 'react';

export default function WeChatSyncButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleSync = async () => {
    if (loading) return;
    
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/wechat/sync-articles', {
        method: 'POST',
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStatus({
          type: 'success',
          message: data.message || '微信文章同步成功！',
        });
        setTimeout(() => { window.location.reload(); }, 2200);

      } else if (data.errcode === 'EMPTY_FREEPUBLISH') {
        // 旧版群发文章，给出明确引导
        setStatus({
          type: 'warn',
          message: data.message,
        });

      } else {
        let friendlyMsg = data.message || '微信同步失败，请检查配置。';
        if (data.errcode === 48001) {
          friendlyMsg = '⚠️ 接口未授权（48001）：您的公众号未通过认证，无法调用此接口。';
        }
        setStatus({ type: 'error', message: friendlyMsg });
      }
    } catch (err) {
      console.error('WeChat sync error:', err);
      setStatus({
        type: 'error',
        message: '连接同步接口失败，请检查您的网络连接或服务器日志。',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={handleSync}
        disabled={loading}
        style={{
          background: loading ? '#1e293b' : 'linear-gradient(135deg, #07c160 0%, #05a04e 100%)',
          color: loading ? '#64748b' : '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '0.6rem 1.4rem',
          borderRadius: '8px',
          fontSize: '0.88rem',
          fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: loading ? 'none' : '0 4px 12px rgba(7, 193, 96, 0.2)',
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(7, 193, 96, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(7, 193, 96, 0.2)';
          }
        }}
      >
        <span style={{
          display: 'inline-block',
          animation: loading ? 'spin 1.2s linear infinite' : 'none',
          fontSize: '1rem',
        }}>
          {loading ? '🌀' : '🔄'}
        </span>
        {loading ? '正在从公众号同步文章...' : '一键同步微信公众号文章'}
      </button>

      {/* 动画和通知浮层 */}
      {status && (
        <div style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          zIndex: 9999,
          background: status.type === 'success' ? '#091e14' : status.type === 'warn' ? '#1a160a' : '#1f1315',
          border: status.type === 'success' ? '1px solid rgba(7, 193, 96, 0.3)' : status.type === 'warn' ? '1px solid rgba(251,191,36,0.35)' : '1px solid rgba(239, 68, 68, 0.3)',
          color: status.type === 'success' ? '#34d399' : status.type === 'warn' ? '#fcd34d' : '#f87171',
          padding: '1rem 1.4rem',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          maxWidth: '420px',
          fontSize: '0.88rem',
          lineHeight: '1.5',
          animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          gap: '0.8rem',
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.2rem', marginTop: '-2px' }}>
            {status.type === 'success' ? '✅' : status.type === 'warn' ? '⚠️' : '❌'}
          </span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '0.2rem', color: status.type === 'success' ? '#10b981' : status.type === 'warn' ? '#f59e0b' : '#ef4444' }}>
              {status.type === 'success' ? '同步任务成功' : status.type === 'warn' ? '需要手动导入' : '同步任务失败'}
            </div>
            <div>{status.message}</div>
            {status.type === 'success' && (
              <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.5rem' }}>
                页面将在 2 秒内刷新以更新数据...
              </div>
            )}
          </div>
          <button 
            onClick={() => setStatus(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0',
              lineHeight: '1',
              marginLeft: 'auto',
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* 动画所需的 CSS 样式注入 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
