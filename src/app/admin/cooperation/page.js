import prisma from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import RichEditor from '../../../components/RichEditor';
import AdminBatchTable from '../../../components/AdminBatchTable';
import ImageUploadInput from '../../../components/ImageUploadInput';
export default async function AdminCooperation({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const editId = params?.edit;
  const editItem = (editId && !isNaN(parseInt(editId))) ? await prisma.cooperationProject.findUnique({ where: { id: parseInt(editId) } }) : null;

  const projects = await prisma.cooperationProject.findMany({ orderBy: { sortOrder: 'asc' } });

  async function saveProject(formData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('未授权');
    const idVal = formData.get('id');
    const id = (idVal && !isNaN(parseInt(idVal))) ? parseInt(idVal) : null;

    const title = formData.get('title');
    const partner = formData.get('partner') || '';
    const description = formData.get('description');
    const content = formData.get('content') || '';
    const image = formData.get('image') || '/img_service.png';
    const sortOrder = parseInt(formData.get('sortOrder') || '0');
    if (!title || !description) return;

    if (id) {
      await prisma.cooperationProject.update({
        where: { id },
        data: { title, partner, description, content, image, sortOrder }
      });
    } else {
      await prisma.cooperationProject.create({
        data: { title, partner, description, content, image, sortOrder }
      });
    }

    revalidatePath('/admin/cooperation');
    revalidatePath('/cooperation');
    redirect('/admin/cooperation');
  }

  async function deleteProject(formData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('未授权');
    const idVal = formData.get('id');
    const id = (idVal && !isNaN(parseInt(idVal))) ? parseInt(idVal) : null;
    if (!id) return;
    await prisma.cooperationProject.delete({ where: { id } });
    revalidatePath('/admin/cooperation');
    revalidatePath('/cooperation');
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '2rem', color: '#f8fafc' }}>项目合作管理</h1>

      {/* Create / Edit Form */}
      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: editItem ? '#60a5fa' : '#94a3b8' }}>
          {editItem ? `编辑合作案例 (ID: ${editItem.id})` : '添加合作案例'}
        </h2>
        <form action={saveProject}>
          <input type="hidden" name="id" value={editItem?.id || ''} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>项目标题 *</label>
              <input name="title" required placeholder="合作项目名称" className="admin-input" defaultValue={editItem?.title || ''} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>合作方</label>
              <input name="partner" placeholder="合作单位/企业名称" className="admin-input" defaultValue={editItem?.partner || ''} />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>项目简介 *</label>
            <textarea name="description" required placeholder="项目概述（显示在卡片上）" className="admin-input admin-textarea" rows={3} defaultValue={editItem?.description || ''} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>详细内容</label>
            <RichEditor name="content" placeholder="项目详情（选填）" defaultValue={editItem?.content || ''} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>封面图片路径</label>
              <ImageUploadInput name="image" placeholder="/img_service.png" defaultValue={editItem?.image || ''} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>排序</label>
              <input name="sortOrder" type="number" className="admin-input" defaultValue={editItem?.sortOrder !== undefined ? editItem.sortOrder : 0} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.88rem' }}>
              {editItem ? '保存修改' : '添加合作案例'}
            </button>
            {editItem && (
              <a href="/admin/cooperation" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textDecoration: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontSize: '0.88rem', transition: 'all 0.2s' }}>
                取消编辑
              </a>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#94a3b8' }}>全部合作案例（{projects.length}）</h2>
        <AdminBatchTable
          model="cooperationProject"
          items={projects}
          fields={[
            { key: 'id', label: 'ID', style: { color: '#475569' } },
            { key: 'title', label: '项目名称', maxWidth: '220px' },
            { key: 'partner', label: '合作方' },
            { key: 'image', label: '封面', type: 'image' },
            { key: 'sortOrder', label: '排序' },
          ]}
          deleteAction={deleteProject}
          editBasePath="/admin/cooperation"
          emptyText="暂无合作案例，点击上方添加"
        />
      </div>
    </div>
  );
}
