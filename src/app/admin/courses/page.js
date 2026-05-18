import prisma from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import RichEditor from '../../../components/RichEditor';
import AdminBatchTable from '../../../components/AdminBatchTable';
export default async function AdminCourses({ searchParams }) {
  const session = await getServerSession();
  if (!session) redirect('/auth/signin');

  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const editId = params?.edit;
  const editItem = (editId && !isNaN(parseInt(editId))) ? await prisma.courseItem.findUnique({ where: { id: parseInt(editId) } }) : null;

  const courses = await prisma.courseItem.findMany({ orderBy: { sortOrder: 'asc' } });

  async function saveCourse(formData) {
    'use server';
    const idVal = formData.get('id');
    const id = (idVal && !isNaN(parseInt(idVal))) ? parseInt(idVal) : null;

    const title = formData.get('title');
    const category = formData.get('category') || '维修课程';
    const description = formData.get('description');
    const content = formData.get('content') || '';
    const image = formData.get('image') || '/card_repair.png';
    const duration = formData.get('duration') || '';
    const price = formData.get('price') || '';
    const sortOrder = parseInt(formData.get('sortOrder') || '0');
    if (!title || !description) return;

    if (id) {
      await prisma.courseItem.update({
        where: { id },
        data: { title, category, description, content, image, duration, price, sortOrder }
      });
    } else {
      await prisma.courseItem.create({ data: { title, category, description, content, image, duration, price, sortOrder } });
    }

    revalidatePath('/admin/courses');
    revalidatePath('/courses');
    revalidatePath('/');
    redirect('/admin/courses');
  }

  async function deleteCourse(formData) {
    'use server';
    const idVal = formData.get('id');
    const id = (idVal && !isNaN(parseInt(idVal))) ? parseInt(idVal) : null;
    if (!id) return;
    await prisma.courseItem.delete({ where: { id } });
    revalidatePath('/admin/courses');
    revalidatePath('/courses');
    revalidatePath('/');
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '2rem', color: '#f8fafc' }}>维修课程管理</h1>

      {/* Create / Edit Form */}
      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: editItem ? '#60a5fa' : '#94a3b8' }}>
          {editItem ? `编辑维修课程 (ID: ${editItem.id})` : '添加新课程'}
        </h2>
        <form action={saveCourse}>
          <input type="hidden" name="id" value={editItem?.id || ''} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>课程名称 *</label>
              <input name="title" required placeholder="课程名称" className="admin-input" defaultValue={editItem?.title || ''} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>课程分类</label>
              <select name="category" className="admin-input" style={{ background: '#0e1017' }} defaultValue={editItem?.category || '维修课程'}>
                <option value="基础课程">基础课程</option>
                <option value="进阶课程">进阶课程</option>
                <option value="实战课程">实战课程</option>
                <option value="专项课程">专项课程</option>
                <option value="维修课程">维修课程</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>课程简介 *</label>
            <textarea name="description" required placeholder="课程简介（显示在卡片上）" className="admin-input admin-textarea" rows={3} defaultValue={editItem?.description || ''} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>详细内容</label>
            <RichEditor name="content" placeholder="课程详细内容（选填）" defaultValue={editItem?.content || ''} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>封面图片路径</label>
              <input name="image" placeholder="/card_repair.png" className="admin-input" defaultValue={editItem?.image || ''} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>课程时长</label>
              <input name="duration" placeholder="例：3天" className="admin-input" defaultValue={editItem?.duration || ''} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>价格</label>
              <input name="price" placeholder="例：面议" className="admin-input" defaultValue={editItem?.price || ''} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>排序（数字小靠前）</label>
              <input name="sortOrder" type="number" className="admin-input" defaultValue={editItem?.sortOrder !== undefined ? editItem.sortOrder : 0} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.88rem' }}>
              {editItem ? '保存修改' : '添加课程'}
            </button>
            {editItem && (
              <a href="/admin/courses" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textDecoration: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontSize: '0.88rem', transition: 'all 0.2s' }}>
                取消编辑
              </a>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#94a3b8' }}>全部课程（{courses.length}）</h2>
        <AdminBatchTable
          model="courseItem"
          items={courses}
          fields={[
            { key: 'id', label: 'ID', style: { color: '#475569' } },
            { key: 'category', label: '分类', type: 'badge' },
            { key: 'title', label: '课程名称', maxWidth: '220px' },
            { key: 'duration', label: '时长' },
            { key: 'price', label: '价格' },
            { key: 'sortOrder', label: '排序' },
          ]}
          deleteAction={deleteCourse}
          editBasePath="/admin/courses"
          emptyText="暂无课程，点击上方添加"
        />
      </div>
    </div>
  );
}
