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

export default async function AdminCooperation({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const editId = params?.edit;
  const currentTab = params?.tab || 'cases';
  const isSuccess = params?.success === '1';

  const configs = await getSystemConfigs();
  const projects = await prisma.cooperationProject.findMany({ orderBy: { sortOrder: 'asc' } });

  const editItem = (editId && !isNaN(parseInt(editId))) ? await prisma.cooperationProject.findUnique({ where: { id: parseInt(editId) } }) : null;

  // 解析合作模式（图一）
  let modesItems = [];
  try {
    modesItems = JSON.parse(configs.cooperation_modes_items);
  } catch (e) {
    modesItems = [
      { icon: '🎓', title: '产教融合合作', desc: '与高校、职业院校共建无人机专业实训基地，提供课程资源、教具设备及师资培训，联合培养专业人才。' },
      { icon: '🔧', title: '技术服务合作', desc: '承接企业级无人机维修、改装、飞控调参及技术咨询服务，提供长期技术支持与保障协议。' },
      { icon: '✈️', title: '飞行作业合作', desc: '为农林、电力、测绘、应急等行业提供无人机飞行作业外包服务，配备持证飞手与专业设备。' },
      { icon: '🤝', title: '品牌代理合作', desc: '欢迎有资源、有渠道的合作伙伴加入，共同推广星势力航空科技培训课程与技术服务品牌。' }
    ];
  }

  // 解析为何选择我们（图二）
  let whyItems = [];
  try {
    whyItems = JSON.parse(configs.cooperation_why_items);
  } catch (e) {
    whyItems = [
      { icon: '🏅', title: '专业资质', desc: 'CAAC认证，规范运营' },
      { icon: '💪', title: '实力团队', desc: '技术过硬，经验丰富' },
      { icon: '⚡', title: '高效执行', desc: '快速响应，按时交付' },
      { icon: '🔒', title: '诚信合作', desc: '合同规范，长期共赢' },
      { icon: '📈', title: '持续创新', desc: '紧跟行业趋势，技术持续升级' }
    ];
  }

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

  async function saveCooperationConfigs(formData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('未授权');

    // 保存合作模式（图一）标题与副标题
    await setSystemConfig('cooperation_modes_title', formData.get('cooperation_modes_title'));
    await setSystemConfig('cooperation_modes_subtitle', formData.get('cooperation_modes_subtitle'));

    // 保存合作模式四个卡片
    const modesList = [];
    for (let i = 0; i < 4; i++) {
      modesList.push({
        icon: formData.get(`cooperation_modes_item_${i}_icon`),
        title: formData.get(`cooperation_modes_item_${i}_title`),
        desc: formData.get(`cooperation_modes_item_${i}_desc`),
      });
    }
    await setSystemConfig('cooperation_modes_items', JSON.stringify(modesList));

    // 保存为何选择我们（图二上方）标题与副标题
    await setSystemConfig('cooperation_why_title', formData.get('cooperation_why_title'));
    await setSystemConfig('cooperation_why_subtitle', formData.get('cooperation_why_subtitle'));

    // 保存为何选择我们五个优势项
    const whyList = [];
    for (let i = 0; i < 5; i++) {
      whyList.push({
        icon: formData.get(`cooperation_why_item_${i}_icon`),
        title: formData.get(`cooperation_why_item_${i}_title`),
        desc: formData.get(`cooperation_why_item_${i}_desc`),
      });
    }
    await setSystemConfig('cooperation_why_items', JSON.stringify(whyList));

    // 保存底部CTA（图二下方）
    await setSystemConfig('cooperation_cta_title', formData.get('cooperation_cta_title'));
    await setSystemConfig('cooperation_cta_subtitle', formData.get('cooperation_cta_subtitle'));
    await setSystemConfig('cooperation_cta_btn_text', formData.get('cooperation_cta_btn_text'));
    await setSystemConfig('cooperation_cta_btn_link', formData.get('cooperation_cta_btn_link'));

    revalidatePath('/admin/cooperation');
    revalidatePath('/cooperation');
    redirect('/admin/cooperation?tab=config&success=1');
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '1.5rem', color: '#f8fafc' }}>项目合作管理</h1>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.2rem' }}>
        <Link href="/admin/cooperation?tab=cases" style={{
          color: currentTab === 'cases' ? '#60a5fa' : '#94a3b8',
          textDecoration: 'none',
          fontSize: '1rem',
          fontWeight: currentTab === 'cases' ? 600 : 400,
          borderBottom: currentTab === 'cases' ? '2px solid #3b82f6' : '2px solid transparent',
          paddingBottom: '0.8rem',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}>
          💼 合作案例管理
        </Link>
        <Link href="/admin/cooperation?tab=config" style={{
          color: currentTab === 'config' ? '#60a5fa' : '#94a3b8',
          textDecoration: 'none',
          fontSize: '1rem',
          fontWeight: currentTab === 'config' ? 600 : 400,
          borderBottom: currentTab === 'config' ? '2px solid #3b82f6' : '2px solid transparent',
          paddingBottom: '0.8rem',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}>
          ⚙️ 页面区块配置
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
          <span>✅</span> 保存成功！项目合作页面区块配置已实时更新生效。
        </div>
      )}

      {currentTab === 'cases' ? (
        <>
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
                  <Link href="/admin/cooperation" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textDecoration: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontSize: '0.88rem', transition: 'all 0.2s' }}>
                    取消编辑
                  </Link>
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
        </>
      ) : (
        <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem' }}>
          <form action={saveCooperationConfigs}>
            {/* Block 1: Cooperation Modes (Fig 1) */}
            <h3 style={{ fontSize: '1.1rem', color: '#60a5fa', fontWeight: 600, marginBottom: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(96,165,250,0.1)' }}>
              1. 合作模式板块配置（图一上方）
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>板块主标题</label>
                <input name="cooperation_modes_title" defaultValue={configs.cooperation_modes_title || '合作模式'} className="admin-input" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>板块副标题</label>
                <input name="cooperation_modes_subtitle" defaultValue={configs.cooperation_modes_subtitle || '多种合作方式，灵活匹配您的业务需求'} className="admin-input" required />
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.88rem', color: '#e2e8f0', fontWeight: 500 }}>合作模式卡片列表 (共4个)</label>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.2rem', background: 'rgba(255,255,255,0.01)', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.83rem', marginBottom: '0.8rem' }}>合作模式卡片 {i + 1}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 220px 1fr', gap: '1.2rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}>图标 (Emoji)</label>
                      <input name={`cooperation_modes_item_${i}_icon`} defaultValue={modesItems[i]?.icon || ''} className="admin-input" required style={{ textAlign: 'center' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}>卡片标题</label>
                      <input name={`cooperation_modes_item_${i}_title`} defaultValue={modesItems[i]?.title || ''} className="admin-input" required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}>卡片描述</label>
                      <input name={`cooperation_modes_item_${i}_desc`} defaultValue={modesItems[i]?.desc || ''} className="admin-input" required />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Block 2: Why Choose Us (Fig 2 top) */}
            <h3 style={{ fontSize: '1.1rem', color: '#60a5fa', fontWeight: 600, marginBottom: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(96,165,250,0.1)', marginTop: '2rem' }}>
              2. 为何选择我们配置（图二上方）
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>板块主标题</label>
                <input name="cooperation_why_title" defaultValue={configs.cooperation_why_title || '为何选择我们'} className="admin-input" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>板块副标题</label>
                <input name="cooperation_why_subtitle" defaultValue={configs.cooperation_why_subtitle || '专业实力与诚信服务，是合作的最好基础'} className="admin-input" required />
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.88rem', color: '#e2e8f0', fontWeight: 500 }}>特色优势项列表 (共5个)</label>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.2rem', background: 'rgba(255,255,255,0.01)', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.83rem', marginBottom: '0.8rem' }}>优势卡片 {i + 1}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 220px 1fr', gap: '1.2rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}>图标 (Emoji)</label>
                      <input name={`cooperation_why_item_${i}_icon`} defaultValue={whyItems[i]?.icon || ''} className="admin-input" required style={{ textAlign: 'center' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}>优势标题</label>
                      <input name={`cooperation_why_item_${i}_title`} defaultValue={whyItems[i]?.title || ''} className="admin-input" required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}>优势描述</label>
                      <input name={`cooperation_why_item_${i}_desc`} defaultValue={whyItems[i]?.desc || ''} className="admin-input" required />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Block 3: CTA Banner (Fig 2 bottom) */}
            <h3 style={{ fontSize: '1.1rem', color: '#60a5fa', fontWeight: 600, marginBottom: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(96,165,250,0.1)', marginTop: '2rem' }}>
              3. 底部合作引流条配置（图二下方）
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>横幅主标题</label>
                <input name="cooperation_cta_title" defaultValue={configs.cooperation_cta_title || '期待与您携手合作'} className="admin-input" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>横幅描述文本</label>
                <input name="cooperation_cta_subtitle" defaultValue={configs.cooperation_cta_subtitle || '请填写您的联系方式，我们将在24小时内与您取得联系'} className="admin-input" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>按钮文本</label>
                <input name="cooperation_cta_btn_text" defaultValue={configs.cooperation_cta_btn_text || '立即洽谈合作'} className="admin-input" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>按钮链接地址</label>
                <input name="cooperation_cta_btn_link" defaultValue={configs.cooperation_cta_btn_link || '/contact'} className="admin-input" required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn-primary" style={{ padding: '0.7rem 2.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                保存区块配置
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
