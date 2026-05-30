import prisma from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function AdminContacts() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  const contacts = await prisma.contactRequest.findMany({ orderBy: { createdAt: 'desc' } });

  async function updateStatus(formData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('未授权');
    const id = parseInt(formData.get('id'));
    const status = formData.get('status');
    await prisma.contactRequest.update({ where: { id }, data: { status } });
    revalidatePath('/admin/contacts');
  }

  async function deleteContact(formData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('未授权');
    const id = parseInt(formData.get('id'));
    await prisma.contactRequest.delete({ where: { id } });
    revalidatePath('/admin/contacts');
  }

  const pending = contacts.filter(c => c.status === 'PENDING').length;
  const processing = contacts.filter(c => c.status === 'PROCESSING').length;
  const completed = contacts.filter(c => c.status === 'COMPLETED').length;

  const statusColor = { PENDING: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: '待处理' }, PROCESSING: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', label: '处理中' }, COMPLETED: { bg: 'rgba(16,185,129,0.15)', text: '#10b981', label: '已完成' } };

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '2rem', color: '#f8fafc' }}>联络与工单管理</h1>

      {/* Summary */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        {[['⏳', '待处理', pending, '#f59e0b'], ['⚙️', '处理中', processing, '#60a5fa'], ['✅', '已完成', completed, '#10b981']].map(([icon, label, count, color]) => (
          <div key={label} style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '1.2rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{icon}</span>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color, fontFamily: 'Outfit, sans-serif' }}>{count}</div>
              <div style={{ fontSize: '0.83rem', color: '#64748b' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem', overflowX: 'auto' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#94a3b8' }}>全部工单（{contacts.length}）</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['ID','提交时间','姓名','电话','邮箱','类型','留言','状态','操作'].map(h => (
                <th key={h} style={{ padding: '0.8rem 0.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contacts.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '1rem 0.5rem', color: '#475569', fontSize: '0.83rem' }}>{item.id}</td>
                <td style={{ padding: '1rem 0.5rem', fontSize: '0.83rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{new Date(item.createdAt).toLocaleDateString('zh-CN')}</td>
                <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: '1rem 0.5rem', fontSize: '0.83rem', color: '#94a3b8' }}>{item.phone}</td>
                <td style={{ padding: '1rem 0.5rem', fontSize: '0.8rem', color: '#64748b', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.email || '-'}</td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <span style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{item.type}</span>
                </td>
                <td style={{ padding: '1rem 0.5rem', fontSize: '0.82rem', color: '#64748b', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.message}>{item.message || '-'}</td>
                <td style={{ padding: '1rem 0.5rem', whiteSpace: 'nowrap' }}>
                  <span style={{ background: statusColor[item.status]?.bg, color: statusColor[item.status]?.text, padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem' }}>
                    {statusColor[item.status]?.label}
                  </span>
                </td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'nowrap' }}>
                    {item.status !== 'COMPLETED' && (
                      <form action={updateStatus} style={{ display: 'inline' }}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="status" value={item.status === 'PENDING' ? 'PROCESSING' : 'COMPLETED'} />
                        <button type="submit" style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                          {item.status === 'PENDING' ? '→处理中' : '→已完成'}
                        </button>
                      </form>
                    )}
                    <form action={deleteContact} style={{ display: 'inline' }}>
                      <input type="hidden" name="id" value={item.id} />
                      <button type="submit" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem' }}>删除</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr><td colSpan="9" style={{ padding: '3rem 0', textAlign: 'center', color: '#475569' }}>暂无工单记录</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
