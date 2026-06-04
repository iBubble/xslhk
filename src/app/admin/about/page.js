import prisma from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import RichEditor from '../../../components/RichEditor';
import { getSystemConfigs, setSystemConfig } from '../../../lib/config';
import ImageUploadInput from '../../../components/ImageUploadInput';
import Link from 'next/link';

export default async function AdminAbout({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  const contents = await prisma.aboutContent.findMany();
  const cm = {};
  contents.forEach(c => { cm[c.section] = c; });

  const configs = await getSystemConfigs();

  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const isSuccess = params?.success === '1';
  const currentTab = params?.tab || 'content';

  const sections = [
    { key: 'intro', label: '公司简介', placeholder: '公司介绍正文...' },
    { key: 'mission', label: '企业使命', placeholder: '企业使命描述...' },
    { key: 'vision', label: '企业愿景', placeholder: '企业愿景描述...' },
    { key: 'values', label: '核心价值观', placeholder: '核心价值观描述...' },
  ];

  // 解析“我们的优势”卡片数据
  let advantagesItems = [];
  try {
    advantagesItems = JSON.parse(configs.about_advantages_items);
  } catch (e) {
    advantagesItems = [
      { icon: '🏆', title: 'CAAC认证', desc: '持有民航局认证资质，课程体系符合国家标准' },
      { icon: '👨‍🔧', title: '专业团队', desc: '核心成员均具备多年无人机维修与培训经验' },
      { icon: '🔩', title: '设备齐全', desc: '配备先进的检测与维修设备，支持各主流机型' },
      { icon: '📋', title: '完善体系', desc: '系统化课程设计，理论与实操全面覆盖' }
    ];
  }

  async function upsertSection(formData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('未授权');
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
    redirect('/admin/about?tab=content&success=1');
  }

  async function updateQrCode(formData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('未授权');
    const qrCode = formData.get('contact_qrcode');
    if (qrCode !== null) {
      await setSystemConfig('contact_qrcode', qrCode);
    }
    revalidatePath('/admin/about');
    revalidatePath('/contact');
    redirect('/admin/about?tab=content&success=1');
  }

  async function saveAdvantagesConfigs(formData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('未授权');

    await setSystemConfig('about_advantages_title', formData.get('about_advantages_title'));
    await setSystemConfig('about_advantages_subtitle', formData.get('about_advantages_subtitle'));

    const items = [];
    for (let i = 0; i < 4; i++) {
      items.push({
        icon: formData.get(`about_advantages_item_${i}_icon`),
        title: formData.get(`about_advantages_item_${i}_title`),
        desc: formData.get(`about_advantages_item_${i}_desc`),
      });
    }
    await setSystemConfig('about_advantages_items', JSON.stringify(items));

    revalidatePath('/admin/about');
    revalidatePath('/about');
    redirect('/admin/about?tab=advantages&success=1');
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '1.5rem', color: '#f8fafc' }}>关于页面内容管理</h1>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.2rem' }}>
        <Link href="/admin/about?tab=content" style={{
          color: currentTab === 'content' ? '#60a5fa' : '#94a3b8',
          textDecoration: 'none',
          fontSize: '1rem',
          fontWeight: currentTab === 'content' ? 600 : 400,
          borderBottom: currentTab === 'content' ? '2px solid #3b82f6' : '2px solid transparent',
          paddingBottom: '0.8rem',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}>
          🏢 基础图文内容
        </Link>
        <Link href="/admin/about?tab=advantages" style={{
          color: currentTab === 'advantages' ? '#60a5fa' : '#94a3b8',
          textDecoration: 'none',
          fontSize: '1rem',
          fontWeight: currentTab === 'advantages' ? 600 : 400,
          borderBottom: currentTab === 'advantages' ? '2px solid #3b82f6' : '2px solid transparent',
          paddingBottom: '0.8rem',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}>
          🏆 我们的优势配置
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
          <span>✅</span> 保存成功！关于页面板块配置已在全网实时更新生效。
        </div>
      )}

      {currentTab === 'content' ? (
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
                    <ImageUploadInput name="image" defaultValue={cm[sec.key]?.image || ''} placeholder="/img_about.png" />
                  </div>
                )}
                {sec.key !== 'intro' && <input type="hidden" name="image" value="" />}
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>保存{sec.label}</button>
              </form>
            </div>
          ))}

          <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.05rem', color: '#94a3b8', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '2px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>qrcode</span>
              公众号二维码
            </h2>
            <form action={updateQrCode}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>二维码图片路径 *</label>
                <ImageUploadInput name="contact_qrcode" defaultValue={configs.contact_qrcode || ''} placeholder="/images/fav.png" />
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>前台联系页面展示的二维码，请填入相对路径或完整 URL</p>
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>保存公众号二维码</button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem' }}>
          <form action={saveAdvantagesConfigs}>
            <h3 style={{ fontSize: '1.1rem', color: '#60a5fa', fontWeight: 600, marginBottom: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(96,165,250,0.1)' }}>
              我们的优势板块配置
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>板块主标题</label>
                <input name="about_advantages_title" defaultValue={configs.about_advantages_title || '我们的优势'} className="admin-input" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>板块副标题</label>
                <input name="about_advantages_subtitle" defaultValue={configs.about_advantages_subtitle || '专业资质认证、丰富实战经验、全方位服务保障'} className="admin-input" required />
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.88rem', color: '#e2e8f0', fontWeight: 500 }}>优势项卡片列表 (共4个)</label>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.2rem', background: 'rgba(255,255,255,0.01)', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.83rem', marginBottom: '0.8rem' }}>优势卡片 {i + 1}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}>卡片名称 *</label>
                      <input name={`about_advantages_item_${i}_title`} defaultValue={advantagesItems[i]?.title || ''} className="admin-input" required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}>描述信息 *</label>
                      <input name={`about_advantages_item_${i}_desc`} defaultValue={advantagesItems[i]?.desc || ''} className="admin-input" required />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}>图标 / 图片上传 * (支持直接输入 Emoji 或点击上传图片)</label>
                    <ImageUploadInput name={`about_advantages_item_${i}_icon`} defaultValue={advantagesItems[i]?.icon || ''} placeholder="💡 可输入 Emoji，或点击上传图片" required />
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '0.7rem 2.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
              保存优势配置
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
