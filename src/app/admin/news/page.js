import prisma from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import RichEditor from '../../../components/RichEditor';

export default async function AdminNews({ searchParams }) {
  const session = await getServerSession();
  if (!session) redirect('/auth/signin');

  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const editId = params?.edit;
  const editItem = (editId && !isNaN(parseInt(editId))) ? await prisma.news.findUnique({ where: { id: parseInt(editId) } }) : null;

  const newsList = await prisma.news.findMany({ orderBy: { id: 'desc' } });

  async function deleteNews(formData) {
    'use server';
    const idVal = formData.get('id');
    const id = (idVal && !isNaN(parseInt(idVal))) ? parseInt(idVal) : null;
    if (!id) return;
    await prisma.news.delete({ where: { id } });
    revalidatePath('/admin/news');
    revalidatePath('/news');
    revalidatePath('/');
  }

  async function saveNews(formData) {
    'use server';
    const idVal = formData.get('id');
    const id = (idVal && !isNaN(parseInt(idVal))) ? parseInt(idVal) : null;

    const title = formData.get('title');
    const date = formData.get('date');
    const excerpt = formData.get('excerpt');
    const content = formData.get('content') || '';
    const image = formData.get('image') || '/img_news.png';
    const wxLink = formData.get('wxLink') || '';
    if (!title || !date || !excerpt) return;

    if (id) {
      await prisma.news.update({
        where: { id },
        data: { title, date, excerpt, content, image, wxLink }
      });
    } else {
      await prisma.news.create({
        data: { title, date, excerpt, content, image, wxLink }
      });
    }

    revalidatePath('/admin/news');
    revalidatePath('/news');
    revalidatePath('/');
    redirect('/admin/news');
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '2rem', color: '#f8fafc' }}>公司动态管理</h1>

      {/* Create / Edit Form */}
      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: editItem ? '#60a5fa' : '#94a3b8' }}>
          {editItem ? `编辑公司动态 (ID: ${editItem.id})` : '发布新动态'}
        </h2>
        <form action={saveNews}>
          <input type="hidden" name="id" value={editItem?.id || ''} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>标题 *</label>
              <input name="title" required placeholder="文章标题" className="admin-input" defaultValue={editItem?.title || ''} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>发布日期 *</label>
              <input name="date" type="date" required className="admin-input" defaultValue={editItem?.date || new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>摘要 *</label>
            <input name="excerpt" required placeholder="文章摘要（显示在列表）" className="admin-input" defaultValue={editItem?.excerpt || ''} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>正文内容</label>
            <RichEditor name="content" placeholder="文章正文（可留空，仅显示摘要）" defaultValue={editItem?.content || ''} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>封面图片路径</label>
              <input name="image" placeholder="/img_news.png" className="admin-input" defaultValue={editItem?.image || ''} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>公众号原文链接</label>
              <input name="wxLink" placeholder="https://mp.weixin.qq.com/..." className="admin-input" defaultValue={editItem?.wxLink || ''} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.88rem' }}>
              {editItem ? '保存修改' : '发布动态'}
            </button>
            {editItem && (
              <a href="/admin/news" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textDecoration: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontSize: '0.88rem', transition: 'all 0.2s' }}>
                取消编辑
              </a>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#94a3b8' }}>全部动态（{newsList.length}）</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['ID','日期','标题','缩略图','公众号链接','操作'].map(h => (
                <th key={h} style={{ padding: '0.8rem 0.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.83rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {newsList.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '1rem 0.5rem', color: '#475569', fontSize: '0.85rem' }}>{item.id}</td>
                <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>{item.date}</td>
                <td style={{ padding: '1rem 0.5rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem' }}>{item.title}</td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <img src={item.image} alt="thumb" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                </td>
                <td style={{ padding: '1rem 0.5rem', fontSize: '0.82rem', color: '#64748b', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.wxLink ? <a href={item.wxLink} target="_blank" rel="noreferrer" style={{ color: '#07c160' }}>查看</a> : '-'}
                </td>
                <td style={{ padding: '1rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <a href={`/admin/news?edit=${item.id}`} style={{
                    display: 'inline-block',
                    background: 'rgba(59,130,246,0.1)',
                    color: '#60a5fa',
                    textDecoration: 'none',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                  }}>
                    编辑
                  </a>
                  <form action={deleteNews} style={{ display: 'inline' }}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82rem' }}>删除</button>
                  </form>
                </td>
              </tr>
            ))}
            {newsList.length === 0 && (
              <tr><td colSpan="6" style={{ padding: '2rem 0', textAlign: 'center', color: '#475569' }}>暂无动态，点击上方发布</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
