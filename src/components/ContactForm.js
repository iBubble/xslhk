"use client";
import { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', type: '课程咨询', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', phone: '', email: '', type: '课程咨询', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h3 style={{ color: '#222', marginBottom: '0.8rem' }}>提交成功！</h3>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>我们已收到您的信息，将在24小时内与您联系。</p>
        <button onClick={() => setStatus('idle')} className="btn-primary">继续咨询</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#555', fontWeight: 500 }}>姓名 *</label>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="请输入您的姓名" required style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
          onFocus={e => e.target.style.borderColor = '#0056b3'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#555', fontWeight: 500 }}>电话 *</label>
          <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="请输入联系电话" required style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
          onFocus={e => e.target.style.borderColor = '#0056b3'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#555', fontWeight: 500 }}>邮箱</label>
        <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="请输入邮箱（选填）" type="email" style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
        onFocus={e => e.target.style.borderColor = '#0056b3'}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#555', fontWeight: 500 }}>咨询类型</label>
        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', background: '#fff', fontFamily: 'inherit' }}>
          <option>课程咨询</option>
          <option>维修预约</option>
          <option>项目合作</option>
          <option>产教融合</option>
          <option>其他事项</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#555', fontWeight: 500 }}>留言内容</label>
        <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="请描述您的需求（选填）" rows={4} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
        onFocus={e => e.target.style.borderColor = '#0056b3'}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>
      {status === 'error' && <p style={{ color: '#e74c3c', fontSize: '0.88rem' }}>提交失败，请稍后重试或直接拨打电话联系我们。</p>}
      <button type="submit" disabled={status === 'loading'} className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem' }}>
        {status === 'loading' ? '提交中...' : '提交咨询'}
      </button>
    </form>
  );
}
