import prisma from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import RichEditor from '../../../components/RichEditor';

export default async function AdminAbout({ searchParams }) {
  const session = await getServerSession();
  if (!session) redirect('/auth/signin');

  const contents = await prisma.aboutContent.findMany();
  const cm = {};
  contents.forEach(c => { cm[c.section] = c; });

  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const isSuccess = params?.success === '1';

  const sections = [
    { key: 'intro', label: '公司简介', placeholder: '公司介绍正文...' },
    { key: 'mission', label: '企业使命', placeholder: '企业使命描述...' },
    { key: 'vision', label: '企业愿景', placeholder: '企业愿景描述...' },
    { key: 'values', label: '核心价值观', placeholder: '核心价值观描述...' },
  ];

  async function upsertSection(formData) {
    'use server';
    const section = formData.get('section');
    const title = formData.get('title');
    const content = formData.get('content');
    const image = formData.get('image') || '';
    if (!section || !title || !content) return;
    await prisma.aboutContent.upsert({
      where: { section },
      update: { title, content, image },
      create: { section, title, content, image },
    });
    revalidatePath('/admin/about');
    revalidatePath('/about');
    redirect('/admin/about?success=1');
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.5rem', color: '#f8fafc' }}>关于页面内容管理</h1>
      <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '2.5rem' }}>修改保存后实时更新前台"关于星势力"页面</p>

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
          <span>✅</span> 保存成功！所选栏目内容已在全网实时更新生效。
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {sections.map(sec => (
          <div key={sec.key} style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.05rem', color: '#94a3b8', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '2px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>{sec.key}</span>
              {sec.label}
            </h2>
            <form action={upsertSection}>
              <input type="hidden" name="section" value={sec.key} />
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>标题 *</label>
                <input name="title" required defaultValue={cm[sec.key]?.title || sec.label} className="admin-input" />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>内容 *</label>
                <RichEditor name="content" placeholder={sec.placeholder} defaultValue={cm[sec.key]?.content || ''} />
              </div>
              {sec.key === 'intro' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>配图路径（选填，仅简介模块使用）</label>
                  <input name="image" defaultValue={cm[sec.key]?.image || ''} placeholder="/img_about.png" className="admin-input" />
                </div>
              )}
              {sec.key !== 'intro' && <input type="hidden" name="image" value="" />}
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>保存{sec.label}</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
