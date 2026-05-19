import prisma from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import { getSystemConfigs, setSystemConfig } from '../../../lib/config';

export default async function AdminConfig({ searchParams }) {
  const session = await getServerSession();
  if (!session) redirect('/auth/signin');

  const configs = await getSystemConfigs();
  
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const isSuccess = params?.success === '1';

  async function updateConfigs(formData) {
    'use server';
    
    const fields = [
      'company_name',
      'logo_url',
      'contact_address',
      'contact_phone',
      'contact_email',
      'contact_hours',
      'contact_qrcode',
      'icp_record',
      'wechat_mp_appid',
      'wechat_mp_appsecret',
      'wechat_mp_token',
      'wechat_mp_aeskey',
      'wechat_mp_auto_sync',
      // 首页数据统计字段
      'home_stat1_num', 'home_stat1_label',
      'home_stat2_num', 'home_stat2_label',
      'home_stat3_num', 'home_stat3_label',
      'home_stat4_num', 'home_stat4_label',
      // 关于页数据统计字段
      'about_stat1_num', 'about_stat1_label',
      'about_stat2_num', 'about_stat2_label',
      'about_stat3_num', 'about_stat3_label',
      'about_stat4_num', 'about_stat4_label',
    ];

    for (const field of fields) {
      const val = formData.get(field);
      if (val !== null) {
        await setSystemConfig(field, val);
      }
    }

    revalidatePath('/');
    revalidatePath('/contact');
    revalidatePath('/about');
    revalidatePath('/admin/config');
    
    redirect('/admin/config?success=1');
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.5rem', color: '#f8fafc' }}>系统基本信息管理</h1>
      <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '2.5rem' }}>在这里设置全站通用的联系电话、公司地址、LOGO、二维码以及备案号等信息</p>

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
          <span>✅</span> 保存成功！全站系统基本信息及联系方式已在全网实时更新生效。
        </div>
      )}

      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem', maxWidth: '800px' }}>
        <form action={updateConfigs}>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>公司名称</label>
            <input name="company_name" defaultValue={configs.company_name} className="admin-input" required />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>公司 LOGO 图片路径</label>
            <input name="logo_url" defaultValue={configs.logo_url} className="admin-input" required />
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>彩色 LOGO 推荐使用默认：`/demo/logo.png`</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>公司地址</label>
            <textarea name="contact_address" defaultValue={configs.contact_address} className="admin-input admin-textarea" rows={3} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>联系电话</label>
              <input name="contact_phone" defaultValue={configs.contact_phone} className="admin-input" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>电子邮箱</label>
              <input name="contact_email" defaultValue={configs.contact_email} className="admin-input" required />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>服务时间</label>
            <input name="contact_hours" defaultValue={configs.contact_hours} className="admin-input" required />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>公众号二维码图片路径</label>
            <input name="contact_qrcode" defaultValue={configs.contact_qrcode} className="admin-input" required />
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>可以上传并在此填写，如：`/images/fav.png`</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>ICP 备案号</label>
            <input name="icp_record" defaultValue={configs.icp_record} className="admin-input" required />
          </div>

          {/* ===== 🌟 数据统计展示配置 🌟 ===== */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.02)',
            border: '1px solid rgba(59, 130, 246, 0.15)',
            borderRadius: '12px',
            padding: '1.8rem',
            marginBottom: '2rem',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: '1.2rem',
              right: '1.5rem',
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#60a5fa',
              fontSize: '0.72rem',
              padding: '2px 8px',
              borderRadius: '99px',
              fontWeight: 500,
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}>
              📊 运营数据配置
            </div>

            <h3 style={{ fontSize: '1rem', color: '#60a5fa', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              前台运营数据统计修改
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.6, marginBottom: '1.8rem' }}>
              在此修改首页与关于页的数字统计展示，吸引更多学员与合作伙伴，即时更新。
            </p>

            {/* 首页数据统计 */}
            <h4 style={{ fontSize: '0.88rem', color: '#e2e8f0', fontWeight: 600, marginBottom: '1rem', borderLeft: '3px solid #60a5fa', paddingLeft: '0.5rem' }}>
              首页数据统计条 (Data Strip)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.8rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>统计项 1 - 数字 (如：500+)</label>
                <input name="home_stat1_num" defaultValue={configs.home_stat1_num || '500+'} className="admin-input" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>统计项 1 - 文字标签 (如：培训学员)</label>
                <input name="home_stat1_label" defaultValue={configs.home_stat1_label || '培训学员'} className="admin-input" required />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>统计项 2 - 数字 (如：10+)</label>
                <input name="home_stat2_num" defaultValue={configs.home_stat2_num || '10+'} className="admin-input" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>统计项 2 - 文字标签 (如：维修课程)</label>
                <input name="home_stat2_label" defaultValue={configs.home_stat2_label || '维修课程'} className="admin-input" required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>统计项 3 - 数字 (如：5年+)</label>
                <input name="home_stat3_num" defaultValue={configs.home_stat3_num || '5年+'} className="admin-input" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>统计项 3 - 文字标签 (如：行业经验)</label>
                <input name="home_stat3_label" defaultValue={configs.home_stat3_label || '行业经验'} className="admin-input" required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>统计项 4 - 数字 (如：100%)</label>
                <input name="home_stat4_num" defaultValue={configs.home_stat4_num || '100%'} className="admin-input" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>统计项 4 - 文字标签 (如：客户满意度)</label>
                <input name="home_stat4_label" defaultValue={configs.home_stat4_label || '客户满意度'} className="admin-input" required />
              </div>
            </div>

            {/* 关于页数据统计 */}
            <h4 style={{ fontSize: '0.88rem', color: '#e2e8f0', fontWeight: 600, marginBottom: '1rem', borderLeft: '3px solid #60a5fa', paddingLeft: '0.5rem' }}>
              关于我们页面数据统计条
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>统计项 1 - 数字 (如：500+)</label>
                <input name="about_stat1_num" defaultValue={configs.about_stat1_num || '500+'} className="admin-input" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>统计项 1 - 文字标签 (如：培训学员)</label>
                <input name="about_stat1_label" defaultValue={configs.about_stat1_label || '培训学员'} className="admin-input" required />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>统计项 2 - 数字 (如：10+)</label>
                <input name="about_stat2_num" defaultValue={configs.about_stat2_num || '10+'} className="admin-input" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>统计项 2 - 文字标签 (如：专业课程)</label>
                <input name="about_stat2_label" defaultValue={configs.about_stat2_label || '专业课程'} className="admin-input" required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>统计项 3 - 数字 (如：5年+)</label>
                <input name="about_stat3_num" defaultValue={configs.about_stat3_num || '5年+'} className="admin-input" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>统计项 3 - 文字标签 (如：行业经验)</label>
                <input name="about_stat3_label" defaultValue={configs.about_stat3_label || '行业经验'} className="admin-input" required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>统计项 4 - 数字 (如：50+)</label>
                <input name="about_stat4_num" defaultValue={configs.about_stat4_num || '50+'} className="admin-input" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>统计项 4 - 文字标签 (如：合作企业)</label>
                <input name="about_stat4_label" defaultValue={configs.about_stat4_label || '合作企业'} className="admin-input" required />
              </div>
            </div>
          </div>

          {/* ===== 🌟 微信公众号自动同步接口预留配置 🌟 ===== */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.02)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            borderRadius: '12px',
            padding: '1.8rem',
            marginBottom: '2rem',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: '1.2rem',
              right: '1.5rem',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              fontSize: '0.72rem',
              padding: '2px 8px',
              borderRadius: '99px',
              fontWeight: 500,
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}>
              🔗 微信公众号接口预留
            </div>

            <h3 style={{ fontSize: '1rem', color: '#34d399', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              微信公众号文章导入设置
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              配置微信公众平台开发者凭证，为后期自动或定时同步导入微信公众号群发图文文章预留接口通道。
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>微信开发者 AppID</label>
                <input name="wechat_mp_appid" defaultValue={configs.wechat_mp_appid || ''} placeholder="wx..." className="admin-input" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>微信开发者 AppSecret</label>
                <input type="password" name="wechat_mp_appsecret" defaultValue={configs.wechat_mp_appsecret || ''} placeholder="••••••••••••••••••••••••••••••••" className="admin-input" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>接口 Token (验证令牌)</label>
                <input name="wechat_mp_token" defaultValue={configs.wechat_mp_token || ''} placeholder="自定义 Token 字符串" className="admin-input" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>消息加解密密钥 (AESKey)</label>
                <input name="wechat_mp_aeskey" defaultValue={configs.wechat_mp_aeskey || ''} placeholder="43位 EncodingAESKey" className="admin-input" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>是否启用微信文章定期同步</label>
              <select name="wechat_mp_auto_sync" defaultValue={configs.wechat_mp_auto_sync || 'false'} className="admin-input" style={{ width: '100%', cursor: 'pointer' }}>
                <option value="false">关闭自动同步 (仅保留手动按需导入通道)</option>
                <option value="true">开启全自动同步 (每 24 小时自动拉取并导入最新微信群发文章)</option>
              </select>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', lineHeight: 1.5 }}>
                💡 接口提示：本站已预置了微信群发事件监听（WeChat Event Webhook）底层协议结构，同步开启后，系统将在后台与微信服务器握手，并自动把匹配的图文信息无缝解析写入“公司动态”列表。
              </p>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '0.7rem 2rem', fontSize: '0.9rem', fontWeight: 500 }}>
            保存配置信息
          </button>
        </form>
      </div>
    </div>
  );
}
