import prisma from '../../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { getSystemConfigs, setSystemConfig } from '../../../../lib/config';
import ImageUploadInput from '../../../../components/ImageUploadInput';

export default async function CourseIntroAdminPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  const configs = await getSystemConfigs();
  
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const isSuccess = params?.success === '1';

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
    revalidatePath('/admin/courses/intro');

    redirect('/admin/courses/intro?success=1');
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.5rem', color: '#f8fafc' }}>课程特色与图文介绍管理</h1>
      <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '2.5rem' }}>在此管理维修课程前台页面（为什么选择我们的课程）图文模块，支持自定义标题、文字简介、多行特色要点及特色展示图。</p>

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
          maxWidth: '800px',
          animation: 'fadeIn 0.3s ease',
        }}>
          <span>✅</span> 保存成功！课程特色及图文介绍内容已实时更新生效。
        </div>
      )}

      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem', maxWidth: '800px' }}>
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
    </div>
  );
}
