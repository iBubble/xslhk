import prisma from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import RichEditor from '../../../components/RichEditor';
import AdminBatchTable from '../../../components/AdminBatchTable';
export default async function AdminShowcase({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const editId = params?.edit;
  const editItem = (editId && !isNaN(parseInt(editId))) ? await prisma.showcaseItem.findUnique({ where: { id: parseInt(editId) } }) : null;

  const items = await prisma.showcaseItem.findMany({ orderBy: { sortOrder: 'asc' } });

  async function saveItem(formData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('未授权');
    const idVal = formData.get('id');
    const id = (idVal && !isNaN(parseInt(idVal))) ? parseInt(idVal) : null;

    const title = formData.get('title');
    const category = formData.get('category') || '风采展示';
    const image = formData.get('image');
    const content = formData.get('content') || '';
    const sortOrder = parseInt(formData.get('sortOrder') || '0');
    if (!title || !image) return;

    if (id) {
      await prisma.showcaseItem.update({
        where: { id },
        data: { title, category, image, content, sortOrder }
      });
    } else {
      await prisma.showcaseItem.create({ data: { title, category, image, content, sortOrder } });
    }

    revalidatePath('/admin/showcase');
    revalidatePath('/showcase');
    revalidatePath('/');
    redirect('/admin/showcase');
  }

  async function deleteItem(formData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('未授权');
    const idVal = formData.get('id');
    const id = (idVal && !isNaN(parseInt(idVal))) ? parseInt(idVal) : null;
    if (!id) return;
    await prisma.showcaseItem.delete({ where: { id } });
    revalidatePath('/admin/showcase');
    revalidatePath('/showcase');
    revalidatePath('/');
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '2rem', color: '#f8fafc' }}>风采展示管理</h1>

      {/* Create / Edit Form */}
      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: editItem ? '#60a5fa' : '#94a3b8' }}>
          {editItem ? `编辑展示图片 (ID: ${editItem.id})` : '添加展示图片'}
        </h2>
        <form action={saveItem}>
          <input type="hidden" name="id" value={editItem?.id || ''} />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>标题 *</label>
              <input name="title" required placeholder="图片标题" className="admin-input" defaultValue={editItem?.title || ''} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>分类</label>
              <select name="category" className="admin-input" style={{ background: '#0e1017' }} defaultValue={editItem?.category || '风采展示'}>
                <option value="团队风采">团队风采</option>
                <option value="培训实况">培训实况</option>
                <option value="飞行活动">飞行活动</option>
                <option value="合作成果">合作成果</option>
                <option value="风采展示">风采展示</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>排序</label>
              <input name="sortOrder" type="number" className="admin-input" defaultValue={editItem?.sortOrder !== undefined ? editItem.sortOrder : 0} />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>图片路径 * (相对路径如 /showcase/img1.jpg 或完整URL)</label>
            <input name="image" required placeholder="/images/showcase/photo1.jpg" className="admin-input" defaultValue={editItem?.image || ''} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>说明（选填）</label>
            <RichEditor name="content" placeholder="图片说明文字（选填）" defaultValue={editItem?.content || ''} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.88rem' }}>
              {editItem ? '保存修改' : '添加图片'}
            </button>
            {editItem && (
              <a href="/admin/showcase" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textDecoration: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontSize: '0.88rem', transition: 'all 0.2s' }}>
                取消编辑
              </a>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#94a3b8' }}>全部图片（{items.length}）</h2>
        <AdminBatchTable
          model="showcaseItem"
          items={items}
          fields={[
            { key: 'id', label: 'ID', style: { color: '#475569' } },
            { key: 'category', label: '分类', type: 'badge' },
            { key: 'image', label: '图片', type: 'image' },
            { key: 'title', label: '标题', maxWidth: '300px' },
            { key: 'sortOrder', label: '排序' },
          ]}
          deleteAction={deleteItem}
          editBasePath="/admin/showcase"
          emptyText="暂无图片，点击上方添加"
        />
      </div>
    </div>
  );
}
