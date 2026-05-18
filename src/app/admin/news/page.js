import prisma from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import RichEditor from '../../../components/RichEditor';
import WeChatSyncButton from '../../../components/WeChatSyncButton';
import AdminBatchTable from '../../../components/AdminBatchTable';

export default async function AdminNews({ searchParams }) {
  const session = await getServerSession();
  if (!session) redirect('/auth/signin');

  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const editId = params?.edit;
  const editItem = (editId && !isNaN(parseInt(editId))) ? await prisma.news.findUnique({ where: { id: parseInt(editId) } }) : null;

  const newsList = await prisma.news.findMany({ orderBy: { date: 'desc' } });

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: 0, color: '#f8fafc' }}>公司动态管理</h1>
        <WeChatSyncButton />
      </div>

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
        <AdminBatchTable
          model="news"
          items={newsList}
          fields={[
            { key: 'id', label: 'ID', style: { color: '#475569' } },
            { key: 'date', label: '日期', style: { color: '#94a3b8' } },
            { key: 'title', label: '标题', maxWidth: '300px' },
            { key: 'image', label: '缩略图', type: 'image' },
            { key: 'wxLink', label: '公众号链接', type: 'link', linkColor: '#07c160' },
          ]}
          deleteAction={deleteNews}
          editBasePath="/admin/news"
          emptyText="暂无动态，点击上方发布"
        />
      </div>
    </div>
  );
}
