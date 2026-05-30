import { getServerSession } from "next-auth/next";
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export default async function AdminPassword({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const result = params?.result; // 'success' | 'wrong_old' | 'mismatch' | 'weak' | 'error'

  const messages = {
    success:   { text: '✅ 密码修改成功！下次登录请使用新密码。', color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
    wrong_old: { text: '❌ 原密码不正确，请重新输入。', color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
    mismatch:  { text: '❌ 两次输入的新密码不一致。', color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
    weak:      { text: '❌ 新密码强度不足：至少需要 8 个字符，建议 12 个以上，并包含字母和数字。', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
    same:      { text: '❌ 新密码不能与原密码相同。', color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
    error:     { text: '❌ 服务器错误，请稍后重试。', color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
  };

  const msg = messages[result];

  async function changePassword(formData) {
    'use server';
    // 认证校验
    const actionSession = await getServerSession(authOptions);
    if (!actionSession) {
      redirect('/auth/signin');
    }

    const oldPassword = formData.get('oldPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    // 基本校验
    if (!oldPassword || !newPassword || !confirmPassword) {
      redirect('/admin/password?result=error');
    }

    // 新密码一致性校验
    if (newPassword !== confirmPassword) {
      redirect('/admin/password?result=mismatch');
    }

    // 密码强度校验：至少 8 个字符
    if (newPassword.length < 8) {
      redirect('/admin/password?result=weak');
    }

    // 密码复杂度校验：至少包含字母和数字
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasDigit = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasDigit) {
      redirect('/admin/password?result=weak');
    }

    try {
      // 查找当前用户
      const user = await prisma.user.findUnique({
        where: { username: actionSession.user.name }
      });

      if (!user) {
        redirect('/admin/password?result=error');
      }

      // 验证原密码
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        redirect('/admin/password?result=wrong_old');
      }

      // 检查新旧密码是否相同
      if (oldPassword === newPassword) {
        redirect('/admin/password?result=same');
      }

      // 哈希新密码并更新
      const newHash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash }
      });

      redirect('/admin/password?result=success');
    } catch (err) {
      // redirect() 在 Next.js 中会抛出特殊错误，需要重新抛出
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        throw err;
      }
      console.error('密码修改失败:', err.message);
      redirect('/admin/password?result=error');
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.5rem', color: '#f8fafc' }}>修改登录密码</h1>
      <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '2.5rem' }}>
        为保障后台安全，建议定期更换密码。新密码至少 8 个字符，且需包含字母和数字。
      </p>

      {msg && (
        <div style={{
          background: msg.bg,
          border: `1px solid ${msg.border}`,
          borderRadius: '8px',
          padding: '0.9rem 1.2rem',
          marginBottom: '1.8rem',
          color: msg.color,
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          maxWidth: '560px',
          animation: 'fadeIn 0.3s ease',
        }}>
          {msg.text}
        </div>
      )}

      <div style={{
        background: '#0e1017',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '560px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(245,158,11,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
          }}>
            🔐
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', color: '#f8fafc', margin: 0, fontWeight: 600 }}>账户安全</h2>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, marginTop: '0.15rem' }}>
              当前账户：{session.user?.name || '管理员'}
            </p>
          </div>
        </div>

        <form action={changePassword}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
              原密码 *
            </label>
            <input
              name="oldPassword"
              type="password"
              required
              placeholder="请输入当前使用的密码"
              autoComplete="current-password"
              className="admin-input"
            />
          </div>

          <div style={{
            height: '1px',
            background: 'rgba(255,255,255,0.06)',
            margin: '1.5rem 0',
          }} />

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
              新密码 *
            </label>
            <input
              name="newPassword"
              type="password"
              required
              minLength={8}
              placeholder="至少 8 个字符，包含字母和数字"
              autoComplete="new-password"
              className="admin-input"
            />
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { text: '≥ 8 字符', color: '#64748b' },
                { text: '含字母', color: '#64748b' },
                { text: '含数字', color: '#64748b' },
              ].map(tag => (
                <span key={tag.text} style={{
                  fontSize: '0.72rem',
                  background: 'rgba(255,255,255,0.04)',
                  color: tag.color,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  {tag.text}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
              确认新密码 *
            </label>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              placeholder="再次输入新密码以确认"
              autoComplete="new-password"
              className="admin-input"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '0.7rem 2rem', fontSize: '0.9rem', fontWeight: 500, width: '100%' }}
          >
            确认修改密码
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(59,130,246,0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(59,130,246,0.1)',
        }}>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
            💡 <strong style={{ color: '#94a3b8' }}>安全提示：</strong>
            密码修改成功后，当前登录会话不受影响，下次登录时需使用新密码。
            建议使用包含大小写字母、数字和特殊字符的强密码。
          </p>
        </div>
      </div>
    </div>
  );
}
