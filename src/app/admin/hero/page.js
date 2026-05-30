import prisma from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ImageUploadInput from '../../../components/ImageUploadInput';

export default async function AdminHeroSlides({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const editId = params?.edit;
  const editItem = (editId && !isNaN(parseInt(editId))) ? await prisma.heroSlide.findUnique({ where: { id: parseInt(editId) } }) : null;

  const rawSlides = await prisma.heroSlide.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => []);
  const slides = rawSlides.map(slide => {
    let img = slide.image;
    if (slide.id === 2 || (slide.title && (slide.title.includes("维保") || slide.title.includes("维修")))) {
      img = "/img_repair.png";
    }
    return { ...slide, image: img };
  });

  async function saveItem(formData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('未授权');
    const idVal = formData.get('id');
    const id = (idVal && !isNaN(parseInt(idVal))) ? parseInt(idVal) : null;

    const title_tag = formData.get('title_tag') || '云南星势力航空科技有限公司';
    const title = formData.get('title');
    const subtitle = formData.get('subtitle') || '';
    const image = formData.get('image');
    const btnText = formData.get('btnText') || '了解更多';
    const btnLink = formData.get('btnLink') || '/about';
    const sortOrder = parseInt(formData.get('sortOrder') || '0');

    if (!title || !image) return;

    if (id) {
      await prisma.heroSlide.update({
        where: { id },
        data: { title_tag, title, subtitle, image, btnText, btnLink, sortOrder }
      });
    } else {
      await prisma.heroSlide.create({
        data: { title_tag, title, subtitle, image, btnText, btnLink, sortOrder }
      });
    }

    revalidatePath('/');
    revalidatePath('/admin/hero');
    redirect('/admin/hero');
  }

  async function deleteItem(formData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('未授权');
    const idVal = formData.get('id');
    const id = (idVal && !isNaN(parseInt(idVal))) ? parseInt(idVal) : null;
    if (!id) return;

    await prisma.heroSlide.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin/hero');
  }

  return (
    <div>
      <style>{`
        .btn-delete {
          background: #ff4d4d;
          color: #fff;
          border: none;
          padding: 0.4rem 0.8rem;
          font-size: 0.78rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
          display: inline-block;
        }
        .btn-delete:hover {
          background: #ff3333 !important;
        }
      `}</style>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '2rem', color: '#f8fafc' }}>首页轮播图管理</h1>

      {/* Create / Edit Form */}
      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: editItem ? '#60a5fa' : '#94a3b8' }}>
          {editItem ? `编辑轮播广告图 (ID: ${editItem.id})` : '添加轮播广告图'}
        </h2>
        <form action={saveItem}>
          <input type="hidden" name="id" value={editItem?.id || ''} />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>一级文字（小字标签，默认“云南星势力航空科技有限公司”）</label>
              <input name="title_tag" required placeholder="一级标题小字" className="admin-input" defaultValue={editItem?.title_tag || '云南星势力航空科技有限公司'} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>排序号（数字越小越靠前）</label>
              <input name="sortOrder" type="number" className="admin-input" defaultValue={editItem?.sortOrder !== undefined ? editItem.sortOrder : 0} />
            </div>
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>二级文字（主口号标题 *）</label>
            <input name="title" required placeholder="例如：星势力航空 创造天空生产力" className="admin-input" defaultValue={editItem?.title || ''} />
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>三级文字（说明段落文字）</label>
            <textarea name="subtitle" placeholder="例如：致力于成为西南领先的无人机培训、维修与行业应用解决方案提供商，赋能通用航空与低空经济新纪元。" className="admin-input" style={{ minHeight: '80px', resize: 'vertical' }} defaultValue={editItem?.subtitle || ''} />
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>广告大图 *</label>
            <ImageUploadInput name="image" defaultValue={editItem?.image || ''} required={true} placeholder="/img_repair.png" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>按钮文字（默认“了解更多”）</label>
              <input name="btnText" placeholder="了解更多" className="admin-input" defaultValue={editItem?.btnText || '了解更多'} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>按钮链接（默认“/about”）</label>
              <input name="btnLink" placeholder="/about" className="admin-input" defaultValue={editItem?.btnLink || '/about'} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.88rem' }}>
              {editItem ? '保存修改' : '添加轮播图'}
            </button>
            {editItem && (
              <a href="/admin/hero" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textDecoration: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontSize: '0.88rem', transition: 'all 0.2s' }}>
                取消编辑
              </a>
            )}
          </div>
        </form>
      </div>

      {/* Slides List Table */}
      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#f8fafc' }}>当前已配置轮播列表 ({slides.length})</h2>
        {slides.length === 0 ? (
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>暂无轮播图数据，系统将回退显示默认轮播。</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: '#94a3b8' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>缩略图</th>
                  <th style={{ padding: '1rem' }}>一二三级文字内容</th>
                  <th style={{ padding: '1rem' }}>按钮文字/链接</th>
                  <th style={{ padding: '1rem', width: '80px' }}>排序</th>
                  <th style={{ padding: '1rem', width: '140px', textAlign: 'center' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {slides.map(slide => (
                  <tr key={slide.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '1rem' }}>
                      <img src={slide.image} alt={slide.title} style={{ width: '120px', height: '68px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.72rem', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', display: 'inline-block', padding: '2px 8px', borderRadius: '4px', marginBottom: '0.3rem' }}>
                        {slide.title_tag}
                      </div>
                      <h4 style={{ color: '#f8fafc', fontSize: '0.95rem', margin: '0 0 0.3rem 0', fontWeight: 600 }}>
                        {slide.title}
                      </h4>
                      <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0, lineHeight: 1.4, maxWidth: '400px' }}>
                        {slide.subtitle}
                      </p>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', display: 'block', width: 'fit-content', marginBottom: '0.3rem' }}>
                        {slide.btnText}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontFamily: 'monospace' }}>
                        {slide.btnLink}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#60a5fa' }}>
                      {slide.sortOrder}
                    </td>
                    <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <a href={`/admin/hero?edit=${slide.id}`} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', textDecoration: 'none', display: 'inline-block', borderRadius: '4px' }}>
                          编辑
                        </a>
                        <form action={deleteItem} style={{ display: 'inline' }}>
                          <input type="hidden" name="id" value={slide.id} />
                          <button type="submit" className="btn-delete">
                            删除
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
