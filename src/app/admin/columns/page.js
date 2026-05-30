import prisma from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { getSystemConfigs, setSystemConfig } from '../../../lib/config';
import ImageUploadInput from '../../../components/ImageUploadInput';

export default async function AdminColumns({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  const configs = await getSystemConfigs();
  
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const isSuccess = params?.success === '1';

  async function updateColumns(formData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('未授权');
    
    const fields = [
      'banner_about', 'banner_about_title', 'banner_about_desc',
      'banner_news', 'banner_news_title', 'banner_news_desc',
      'banner_courses', 'banner_courses_title', 'banner_courses_desc',
      'banner_showcase', 'banner_showcase_title', 'banner_showcase_desc',
      'banner_cooperation', 'banner_cooperation_title', 'banner_cooperation_desc',
      'banner_contact', 'banner_contact_title', 'banner_contact_desc',
    ];

    for (const field of fields) {
      const val = formData.get(field);
      if (val !== null) {
        await setSystemConfig(field, val);
      }
    }

    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/news');
    revalidatePath('/courses');
    revalidatePath('/showcase');
    revalidatePath('/cooperation');
    revalidatePath('/contact');
    revalidatePath('/admin/columns');
    
    redirect('/admin/columns?success=1');
  }

  const columnsList = [
    {
      id: 'about',
      name: '关于我们 (About)',
      bannerKey: 'banner_about',
      titleKey: 'banner_about_title',
      descKey: 'banner_about_desc',
      placeholder: '/img_about.png',
      defaultTitle: '关于星势力',
      defaultDesc: '深耕航空科技，引领低空经济新纪元'
    },
    {
      id: 'news',
      name: '公司动态 (News)',
      bannerKey: 'banner_news',
      titleKey: 'banner_news_title',
      descKey: 'banner_news_desc',
      placeholder: '/img_news.png',
      defaultTitle: '公司动态',
      defaultDesc: '同步"云南星势力航空科技有限公司"公众号最新内容'
    },
    {
      id: 'courses',
      name: '维修课程 (Courses)',
      bannerKey: 'banner_courses',
      titleKey: 'banner_courses_title',
      descKey: 'banner_courses_desc',
      placeholder: '/img_repair.png',
      defaultTitle: '无人机维修课程',
      defaultDesc: '系统学习，实操为主，掌握无人机维修核心技能'
    },
    {
      id: 'showcase',
      name: '风采展示 (Showcase)',
      bannerKey: 'banner_showcase',
      titleKey: 'banner_showcase_title',
      descKey: 'banner_showcase_desc',
      placeholder: '/img_cases.png',
      defaultTitle: '风采展示',
      defaultDesc: '记录每一次飞翔，展示我们的专业与热情'
    },
    {
      id: 'cooperation',
      name: '项目合作 (Cooperation)',
      bannerKey: 'banner_cooperation',
      titleKey: 'banner_cooperation_title',
      descKey: 'banner_cooperation_desc',
      placeholder: '/img_service.png',
      defaultTitle: '项目合作',
      defaultDesc: '携手共赢，共同推动低空经济与无人机产业发展'
    },
    {
      id: 'contact',
      name: '联系我们 (Contact)',
      bannerKey: 'banner_contact',
      titleKey: 'banner_contact_title',
      descKey: 'banner_contact_desc',
      placeholder: '/img_service.png',
      defaultTitle: '联系我们',
      defaultDesc: '期待与您的每一次沟通，欢迎随时咨询'
    }
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.5rem', color: '#f8fafc' }}>全站栏目管理</h1>
      <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '2.5rem' }}>
        在此统一上传和管理前台各个业务栏目的顶部背景大图（Banner）、主标题和副标题描述文字。
      </p>

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
          maxWidth: '1200px',
          animation: 'fadeIn 0.3s ease',
        }}>
          <span>✅</span> 保存成功！全站各栏目 Banner 背景图与标题信息已在全网实时生效。
        </div>
      )}

      <form action={updateColumns}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
          maxWidth: '1200px'
        }}>
          {columnsList.map((col) => (
            <div key={col.id} style={{
              background: '#0e1017',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <h3 style={{ fontSize: '1rem', color: '#60a5fa', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.6rem', margin: 0 }}>
                {col.name}
              </h3>
              
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>Banner 背景图</span>
                <ImageUploadInput
                  name={col.bannerKey}
                  defaultValue={configs[col.bannerKey] || ''}
                  placeholder={col.placeholder}
                />
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>栏目标题</span>
                <input
                  name={col.titleKey}
                  defaultValue={configs[col.titleKey] || col.defaultTitle}
                  className="admin-input"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                />
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>副标题/描述文字</span>
                <textarea
                  name={col.descKey}
                  defaultValue={configs[col.descKey] || col.defaultDesc}
                  className="admin-input"
                  rows={2}
                  style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', resize: 'vertical' }}
                />
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="btn-primary" style={{ padding: '0.7rem 2.5rem', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
          保存配置信息
        </button>
      </form>
    </div>
  );
}
