const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const newsData = [
  { date: '2024-05-12', title: '星势力成功交付千亩果林全自动化测绘与植保方案', excerpt: '通过自主研发的高性能飞行平台与调度系统，星势力完成了位于红河州的千亩山地果林自动化管理部署...', content: '该项目中，我们采用了自研的重型多旋翼平台，结合RTK厘米级定位系统，完成了针对千亩山地果林的自动化三维建模与病虫害智能分析。随后通过自动化的作业网格划分，让植保无人机群实现了不间断的自动化换药与续航逻辑，使喷洒效率提升了400%，真正做到了全自动飞行与无人工干预。', image: '/card_industry.png' },
  { date: '2024-04-28', title: '热烈祝贺第24期无人机执照教员培训班圆满结业', excerpt: '经过30天的紧张集训，本期学员全员通过CAAC理论与实操考核，顺利取得教员资质证书...', content: '本次集训班针对国家民航总局(CAAC)最新发布的考评大纲进行了封闭式训练。为了保证考核的通过率，星势力的金牌教员团队利用全真机型、全尺寸模拟考场以及严苛的面授纪律，为这批未来即将走向通航教育前线的学员们打下了坚实的技术与安全意识基础。所有学员目前皆已获得了多旋翼超视距驾驶员及教员等级签注。', image: '/card_training.png' },
  { date: '2024-03-15', title: '全面升级！大疆行业级无人机维修中心正式落户星势力', excerpt: '为了更好地服务西南地区行业应用客户，星势力斥资引入全套顶级原厂级检测与校准设备...', content: '经过多轮严苛的实地查勘与维修资质审核，大疆创新行业级飞行器授权维修站正式在星势力航空科技挂牌营业。我们引进了原厂视觉标定舱、抗风负载测试仪以及全链路下行信号检测设备，承接包括 M300RTK、M350、T50在内的全部工业级机型的售后保养、固件调试与损坏快修服务，响应速度与维修精度达到行业一流水准。', image: '/card_repair.png' },
];

const caseData = [
  { title: '大理苍山高海拔生态林航拍监控平台', tag: '农林生态', content: '在高海拔、高风速环境下实现30公里的超视距高清图传，并且接入了AI边缘计算模块自动识别山林火灾隐患，从发现到上报终端延迟低于2秒。', image: '/img_cases.png' },
  { title: '昆明某跨海大桥三维建模测绘项目', tag: '航测建模', content: '通过搭载四镜头倾斜摄影相机并结合激光雷达，仅仅用时三个工作日便输出了总计 20GB 的高精度 (2毫米级别) 的全数字化实景点云模型。', image: '/card_industry.png' },
  { title: '西双版纳热带雨林夜间应急搜救演练', tag: '应急救援', content: '由于热带雨林植被茂密，传统人员搜救如同大海捞针。星势力团队采用带红外热成像云台及夜视激光测距仪的矩阵编队，在凌晨3点的浓雾环境下成功锁定了模拟的求生人员热源。', image: '/home_hero.png' },
  { title: '怒江特高压输电线路精细化无人巡检', tag: '电力巡检', content: '自动飞行航线紧贴特高压线路平飞，利用高倍光学变焦镜头对绝缘子裂纹和挂点松动进行自动拍照定格。全程免去了蜘蛛人攀爬作业，降低了巨大的人员安全隐患。', image: '/img_service.png' },
  { title: '某警用特型抗风阻重载无人机研发测试', tag: '研发定制', content: '为了应对反恐防暴与物资空投需求，星势力独立设计开发了该款采用碳纤维六轴共面双桨折叠架构的特种飞行器。最大载荷突破 50公斤 并可连续飞行 45 分钟，在 7级 大风下依旧能悬停不偏离航向。', image: '/img_about.png' },
  { title: '千亩梯田无人机大面积自动化施药作业', tag: '农业植保', content: '在地形极为复杂的梯田上空，星势力使用RTK技术记录梯田落差，自动生成随着地形高低起伏进行仿地飞行的三维航线，让喷洒农药如同在大平原一样轻松均匀，彻底告别了传统农业低效的人力劳作。', image: '/card_training.png' },
];

async function main() {
  console.log('Seeding database...');
  
  // Clean existing data for idempotency
  await prisma.user.deleteMany();
  await prisma.news.deleteMany();
  await prisma.caseModel.deleteMany();
  await prisma.contactRequest.deleteMany();

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('错误: 请通过环境变量 ADMIN_PASSWORD 设置管理员初始密码。');
    console.error('示例: ADMIN_PASSWORD=您的强密码 node seed.js');
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  
  const user = await prisma.user.create({
    data: {
      username: 'admin',
      password: passwordHash,
      role: 'ADMIN'
    }
  });
  console.log(`Created user: ${user.username}`);

  for (const item of newsData) {
    await prisma.news.create({ data: item });
  }
  console.log(`Created ${newsData.length} news items`);

  for (const item of caseData) {
    await prisma.caseModel.create({ data: item });
  }
  console.log(`Created ${caseData.length} case items`);

  // Add dummy contact requests for admin panel visualization
  await prisma.contactRequest.createMany({
    data: [
      { name: '张先生', phone: '138xxxx4321', type: '无人机执照培训', status: 'PENDING', createdAt: new Date('2024-04-18T14:30:00Z') },
      { name: '李女士', phone: '139xxxx8888', type: '无人机维修保养', status: 'PROCESSING', createdAt: new Date('2024-04-17T09:15:00Z') },
      { name: '王总 (某测绘公司)', phone: '135xxxx0000', type: '行业定制解决方案', status: 'COMPLETED', createdAt: new Date('2024-04-15T16:40:00Z') },
    ]
  });
  console.log(`Created mock contact requests for admin dashboard.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
