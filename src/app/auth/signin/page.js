'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (res?.error) {
      setError('登录失败：账号或密码错误。');
    } else {
      router.push('/admin');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div className="premium-card" style={{ width: '100%', maxWidth: '400px', margin: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '2rem' }}>星势力管理系统</h1>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(255,0,0,0.1)', color: '#ff4444', padding: '0.8rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>管理员用户名</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              style={{
                width: '100%',
                padding: '0.8rem',
                backgroundColor: 'var(--bg-glass)',
                border: '1px solid var(--border-glass)',
                borderRadius: '6px',
                color: 'white'
              }}
            />
          </div>
          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>密码</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '0.8rem',
                backgroundColor: 'var(--bg-glass)',
                border: '1px solid var(--border-glass)',
                borderRadius: '6px',
                color: 'white'
              }}
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
            登录 Dashboard
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>&larr; 返回官网首页</Link>
        </div>
      </div>
    </div>
  );
}
