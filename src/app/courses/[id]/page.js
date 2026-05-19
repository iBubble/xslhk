import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '../../../lib/prisma';

const defaultCourses = {
  'a': { id: 'a', title: '多旋翼无人机维修基础', category: '基础课程', description: '掌握多旋翼无人机的基本结构原理，学习电机、电调、电池、飞控等核心部件的常见故障诊断与维修技能。', content: '<p>掌握多旋翼无人机的基本结构原理，学习电机、电调、电池、飞控等核心部件的常见故障诊断与维修技能。本课程以实操为主，包含真机拆装、电路排查以及常见故障件替换。</p><p>本课程专为零基础学员或无人机爱好者设计，通过对主流多旋翼无人机（如植保无人机、行业巡检无人机）的全面拆解与组装，帮助学员熟练掌握电子调速器（ESC）、无刷电机、动力电池安全与电池管理器、以及飞行控制系统的核心接线与排故技术。</p>', duration: '3天', price: '面议', image: '/card_repair.png' },
  'b': { id: 'b', title: '固定翼无人机维修进阶', category: '进阶课程', description: '深入学习固定翼无人机的伺服系统、电调、动力总成及通讯链路 of 综合维修与调试技术，适合有一定基础的学员。', content: '<p>深入学习固定翼无人机的伺服系统、电调、动力总成及通讯链路 of 综合维修与调试技术，适合有一定基础的学员。课程包含起降架维修、舵机调零、动力拉力测试等。</p><p>本进阶课程专注于固定翼无人机（包括垂起固定翼 VTOL）的机体结构、动力匹配以及复杂传感器校验。学员将深入学习舵机与连杆的几何关系调试、副翼/升降舵/方向舵的零偏校正、机载数传/图传天线的架设与电磁兼容防干扰处理、以及多传感器冗余备份的标定技巧。</p>', duration: '5天', price: '面议', image: '/card_training.png' },
  'c': { id: 'c', title: '无人机飞控调参实战', category: '实战课程', description: '掌握主流飞控系统（ArduPilot、PX4、DJI）的参数调试与PID整定核心技术，实操比例占比80%以上。', content: '<p>掌握主流飞控系统（ArduPilot、PX4、DJI）的参数调试与PID整定核心技术，实操比例占比80%以上。深入讲解位置环、速度环调参，排除空中震颤及失控风险。</p><p>飞控是无人机的大脑。本实战课程重点剖析开源飞控系统（APM/Pixhawk）的传感器校准（加速度计、陀螺仪、罗盘与GPS）、姿态控制PID闭环增益调节方法、扩展卡尔曼滤波器（EKF）状态估算调试、以及常见飞行日志分析技术，使学员能够独立诊断和消除空中异常抖动或航向漂移现象。</p>', duration: '3天', price: '面议', image: '/card_industry.png' },
  'd': { id: 'd', title: '无人机图传与数链维修', category: '专项课程', description: '专项讲解图像传输系统、遥控数链模块的工作原理、常见干扰排查及硬件级维修方法，含天线焊接实操。', content: '<p>专项讲解图像传输系统、遥控数链模块的工作原理、常见干扰排查及硬件级维修方法，含天线焊接实操。主要涵盖5.8G模拟图传、高带宽数字图传的硬件结构与维修。</p><p>无人机在野外恶劣环境下的数据和图像传输稳定性至关重要。本专项课程深度剖析OFDM数字无线宽带传输链路与主流模拟射频链路的工作原理，教授学员使用频谱仪、示波器等专业仪器测量图传发射功率与信噪比，系统传授天线高频馈线焊接、巴伦阻抗匹配调整、以及受潮短路机载射频芯片的更换方法。</p>', duration: '2天', price: '面议', image: '/card_repair.png' },
};

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  let item = null;
  if (defaultCourses[id]) {
    item = defaultCourses[id];
  } else if (!isNaN(parseInt(id))) {
    item = await prisma.courseItem.findUnique({ where: { id: parseInt(id) } });
  }
  
  if (!item) return { title: '未找到课程' };
  return { title: `${item.title} - 无人机维修课程 - 云南星势力航空科技` };
}

export default async function CourseDetail({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  let item = null;
  if (defaultCourses[id]) {
    item = defaultCourses[id];
  } else if (!isNaN(parseInt(id))) {
    item = await prisma.courseItem.findUnique({ where: { id: parseInt(id) } });
  }
  
  if (!item) notFound();

  // Get more courses
  const others = await prisma.courseItem.findMany({
    where: { id: { not: !isNaN(parseInt(id)) ? parseInt(id) : 0 } },
    take: 3,
    orderBy: { sortOrder: 'asc' }
  });

  const displayOthers = others.length > 0 ? others : Object.values(defaultCourses).filter(c => c.id !== id).slice(0, 3);

  return (
    <>
      <div className="page-hero" style={{ backgroundImage: `url("${item.image || '/card_repair.png'}")`, height: '320px' }}>
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <div className="breadcrumb">
            <Link href="/">首页</Link><span>/</span>
            <Link href="/courses">维修课程</Link><span>/</span>
            <span>课程详情</span>
          </div>
        </div>
      </div>

      <section style={{ background: '#f8f9fa', padding: '50px 5vw' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Article */}
          <article style={{ flex: '1 1 600px', background: '#fff', borderRadius: '10px', padding: '2.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <span style={{ background: '#e8f0fb', color: '#0056b3', padding: '3px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 500 }}>
              {item.category || '维修课程'}
            </span>
            <h1 style={{ fontSize: '1.7rem', color: '#222', margin: '1rem 0 1.5rem', lineHeight: 1.4, fontWeight: 700 }}>{item.title}</h1>
            
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #0056b3', flexWrap: 'wrap' }}>
              <div>⏱ <strong>课程学时：</strong>{item.duration || '面议'}</div>
              <div>💰 <strong>培训费用：</strong>{item.price || '面议'}</div>
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem', color: '#555', lineHeight: 1.9, fontSize: '0.97rem' }}>
              {item.content ? (
                <div dangerouslySetInnerHTML={{ __html: item.content }} className="rich-content" />
              ) : (
                <div style={{ whiteSpace: 'pre-wrap' }}>{item.description}</div>
              )}
            </div>

            <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link href="/contact" className="btn-primary" style={{ padding: '0.6rem 1.8rem', fontSize: '0.9rem', textDecoration: 'none' }}>
                立即咨询报名
              </Link>
              <Link href="/courses" style={{ color: '#0056b3', fontSize: '0.9rem', marginLeft: '1rem' }}>← 返回课程列表</Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside style={{ flex: '0 0 280px', minWidth: '240px' }}>
            <div style={{ background: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '1rem', color: '#222', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '2px solid #0056b3' }}>推荐课程</h3>
              {displayOthers.map(c => (
                <Link key={c.id} href={`/courses/${c.id}`} style={{ display: 'block', marginBottom: '1.2rem', paddingBottom: '1.2rem', borderBottom: '1px solid #f0f0f0', textDecoration: 'none' }}>
                  <span style={{ fontSize: '0.78rem', color: '#999', display: 'block', marginBottom: '0.3rem' }}>{c.category}</span>
                  <span style={{ fontSize: '0.9rem', color: '#333', fontWeight: 500, lineHeight: 1.5, display: '-webkit-box', overflow: 'hidden', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{c.title}</span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
