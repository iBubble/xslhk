import prisma from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import RichEditor from '../../../components/RichEditor';
import AdminBatchTable from '../../../components/AdminBatchTable';
import ImageUploadInput from '../../../components/ImageUploadInput';
import { getSystemConfigs, setSystemConfig } from '../../../lib/config';
import Link from 'next/link';

export default async function AdminCourses({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const editId = params?.edit;
  const currentTab = params?.tab || 'courses';
  const isSuccess = params?.success === '1';

  const configs = await getSystemConfigs();
  const courses = await prisma.courseItem.findMany({ orderBy: { sortOrder: 'asc' } });
  const editItem = (editId && !isNaN(parseInt(editId))) ? await prisma.courseItem.findUnique({ where: { id: parseInt(editId) } }) : null;

  async function saveCourse(formData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('未授权');
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
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('未授权');
    const idVal = formData.get('id');
    const id = (idVal && !isNaN(parseInt(idVal))) ? parseInt(idVal) : null;
    if (!id) return;
    await prisma.courseItem.delete({ where: { id } });
    revalidatePath('/admin/courses');
    revalidatePath('/courses');
    revalidatePath('/');
  }

  async function updateIntroConfigs(formData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('未授权');

    const fields = [
      'course_intro_title',
      'course_intro_desc',
      'course_intro_points',
      'course_intro_image'
    ];

    for (const field of fields) {
      const val = formData.get(field);
      if (val !== null) {
        await setSystemConfig(field, val);
      }
    }

    revalidatePath('/');
    revalidatePath('/courses');
    revalidatePath('/admin/courses');

    redirect('/admin/courses?tab=intro&success=1');
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '1.5rem', color: '#f8fafc' }}>维修课程管理</h1>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.2rem' }}>
        <Link href="/admin/courses?tab=courses" style={{
          color: currentTab === 'courses' ? '#60a5fa' : '#94a3b8',
          textDecoration: 'none',
          fontSize: '1rem',
          fontWeight: currentTab === 'courses' ? 600 : 400,
          borderBottom: currentTab === 'courses' ? '2px solid #3b82f6' : '2px solid transparent',
          paddingBottom: '0.8rem',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}>
          🔧 课程列表管理
        </Link>
        <Link href="/admin/courses?tab=intro" style={{
          color: currentTab === 'intro' ? '#60a5fa' : '#94a3b8',
          textDecoration: 'none',
          fontSize: '1rem',
          fontWeight: currentTab === 'intro' ? 600 : 400,
          borderBottom: currentTab === 'intro' ? '2px solid #3b82f6' : '2px solid transparent',
          paddingBottom: '0.8rem',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}>
          ✨ 课程特色配置
        </Link>
      </div>

      {isSuccess && (
        <div style={{
          background: 'rgba(16,185,129,0.12)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '8px',
          padding: '0.9rem 1.2rem',
          marginBottom: '1.8rem',
          color: '#34d399',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          animation: 'fadeIn 0.3s ease',
        }}>
          <span>✅</span> 保存成功！课程配置已实时更新生效。
        </div>
      )}

      {currentTab === 'courses' ? (
        <>
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
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>封面图片</label>
                  <ImageUploadInput name="image" defaultValue={editItem?.image || ''} placeholder="/card_repair.png" />
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
                  <Link href="/admin/courses" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textDecoration: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontSize: '0.88rem', transition: 'all 0.2s' }}>
                    取消编辑
                  </Link>
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
        </>
      ) : (
        <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem' }}>
          <form action={updateIntroConfigs}>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
                板块主标题
              </label>
              <input 
                name="course_intro_title" 
                defaultValue={configs.course_intro_title || '为什么选择我们的课程？'} 
                className="admin-input" 
                required 
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
                文字简介描述
              </label>
              <textarea 
                name="course_intro_desc" 
                defaultValue={configs.course_intro_desc || ''} 
                className="admin-input admin-textarea" 
                rows={4} 
                required 
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
                课程特色要点 (每行一个要点)
              </label>
              <textarea 
                name="course_intro_points" 
                defaultValue={configs.course_intro_points || ''} 
                className="admin-input admin-textarea" 
                rows={6} 
                placeholder="例如：&#10;80%实操比例，真机拆装练习&#10;资深工程师全程授课指导&#10;小班制教学，一对一答疑"
                required 
              />
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem', lineHeight: '1.4' }}>
                💡 请在此输入要点内容，<strong>每行代表一条特色要点</strong>（即在前台以 ✓ 列表形式分行展示）。
              </p>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
                特色展示图片
              </label>
              <ImageUploadInput 
                name="course_intro_image" 
                defaultValue={configs.course_intro_image || '/img_repair.png'} 
                placeholder="/img_repair.png" 
              />
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>
                推荐使用宽高比接近的方形或横向精美实操图片，以获得最佳渲染效果。
              </p>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '0.7rem 2rem', fontSize: '0.9rem', fontWeight: 500 }}>
              保存板块配置
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
