import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import prisma from '../../lib/prisma';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await getServerSession();
  if (!session) redirect('/auth/signin');

  const [newsCount, courseCount, showcaseCount, cooperationCount, pendingContacts] = await Promise.all([
    prisma.news.count(),
    prisma.courseItem.count(),
    prisma.showcaseItem.count(),
    prisma.cooperationProject.count(),
    prisma.contactRequest.count({ where: { status: 'PENDING' } }),
  ]);

  const recentContacts = await prisma.contactRequest.findMany({ take: 5, orderBy: { createdAt: 'desc' } });

  const stats = [
    { label: '公司动态', value: newsCount, color: '#3b82f6', icon: '📰', link: '/admin/news' },
    { label: '维修课程', value: courseCount, color: '#10b981', icon: '🔧', link: '/admin/courses' },
    { label: '风采展示', value: showcaseCount, color: '#f59e0b', icon: '🖼️', link: '/admin/showcase' },
    { label: '项目合作', value: cooperationCount, color: '#8b5cf6', icon: '🤝', link: '/admin/cooperation' },
    { label: '待处理工单', value: pendingContacts, color: '#ef4444', icon: '📞', link: '/admin/contacts' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.3rem' }}>控制台大盘</h1>
        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>欢迎回来，管理员</p>
      </div>

      <style>{`
        .admin-stat-card { transition: all 0.2s; }
        .admin-stat-card:hover { transform: translateY(-2px); border-color: var(--hover-color) !important; }
      `}</style>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {stats.map(stat => (
          <Link key={stat.label} href={stat.link} className="admin-stat-card" style={{
            display: 'block',
            background: '#0e1017',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '1.5rem',
            '--hover-color': stat.color + '80',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: stat.color, fontFamily: 'Outfit, sans-serif' }}>{stat.value}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
        {[
          { label: '发布动态', href: '/admin/news', icon: '➕' },
          { label: '添加课程', href: '/admin/courses', icon: '➕' },
          { label: '上传展示', href: '/admin/showcase', icon: '➕' },
          { label: '添加合作', href: '/admin/cooperation', icon: '➕' },
        ].map(action => (
          <Link key={action.href} href={action.href} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            background: 'rgba(59,130,246,0.15)',
            color: '#60a5fa',
            borderRadius: '8px',
            fontSize: '0.88rem',
            border: '1px solid rgba(59,130,246,0.2)',
            transition: 'all 0.2s',
          }}>
            {action.icon} {action.label}
          </Link>
        ))}
      </div>

      {/* Recent Contacts */}
      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: 0 }}>近期咨询工单</h2>
          <Link href="/admin/contacts" style={{ color: '#60a5fa', fontSize: '0.85rem' }}>查看全部 →</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['提交时间','姓名','电话','类型','状态'].map(h => (
                  <th key={h} style={{ padding: '0.8rem 0', color: '#64748b', fontWeight: 500, fontSize: '0.83rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentContacts.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.9rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>{new Date(req.createdAt).toLocaleDateString('zh-CN')}</td>
                  <td style={{ padding: '0.9rem 0', fontSize: '0.85rem' }}>{req.name}</td>
                  <td style={{ padding: '0.9rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>{req.phone}</td>
                  <td style={{ padding: '0.9rem 0', fontSize: '0.85rem' }}>
                    <span style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem' }}>{req.type}</span>
                  </td>
                  <td style={{ padding: '0.9rem 0' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem',
                      background: req.status === 'PENDING' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                      color: req.status === 'PENDING' ? '#f59e0b' : '#10b981',
                    }}>
                      {req.status === 'PENDING' ? '待处理' : req.status === 'PROCESSING' ? '处理中' : '已完成'}
                    </span>
                  </td>
                </tr>
              ))}
              {recentContacts.length === 0 && (
                <tr><td colSpan="5" style={{ padding: '2rem 0', textAlign: 'center', color: '#475569' }}>暂无工单记录</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
