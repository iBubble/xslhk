import prisma from './prisma';

const DEFAULT_CONFIGS = {
  logo_url: '/demo/logo.png', // Changed default logo to colored /demo/logo.png so it shows beautifully on light bg
  contact_address: '云南省昆明市盘龙区联盟街道办事处北京路924号财智心景大厦1701-1702',
  contact_phone: '400-XXX-XXXX',
  contact_email: 'contact@ynxslhk.com',
  contact_hours: '周一至周六 09:00 - 18:00',
  contact_qrcode: '/images/fav.png', // Fallback to icon or custom qr
  icp_record: '滇ICP备2026007307号',
  company_name: '云南星势力航空科技有限公司',
  company_intro: '云南星势力航空科技有限公司，位于云南省昆明市盘龙区，是一家专注于无人机专业培训、技术维修及行业应用解决方案的科技企业。公司拥有经验丰富的技术研发与培训团队，承接各类多旋翼、固定翼、复合翼无人机的维修、改装与飞控调参业务，同时开展无人机维修技术培训课程，助力更多从业者掌握核心技术。我们与云南省多所高校、职业院校及行业单位建立了深度合作关系，致力于推动低空经济人才培养与产业生态建设。',
  wechat_mp_appid: '',
  wechat_mp_appsecret: '',
  wechat_mp_token: '',
  wechat_mp_aeskey: '',
  wechat_mp_auto_sync: 'false',
  
  // 首页数据统计配置
  home_stat1_num: '500+',
  home_stat1_label: '培训学员',
  home_stat2_num: '10+',
  home_stat2_label: '维修课程',
  home_stat3_num: '5年+',
  home_stat3_label: '行业经验',
  home_stat4_num: '100%',
  home_stat4_label: '客户满意度',

  // 关于页数据统计配置
  about_stat1_num: '500+',
  about_stat1_label: '培训学员',
  about_stat2_num: '10+',
  about_stat2_label: '专业课程',
  about_stat3_num: '5年+',
  about_stat3_label: '行业经验',
  about_stat4_num: '50+',
  about_stat4_label: '合作企业',
};

async function ensureInitialized() {
  try {
    // 1. Initialize configs safely using upsert to avoid race conditions during build
    for (const [key, value] of Object.entries(DEFAULT_CONFIGS)) {
      try {
        await prisma.systemConfig.upsert({
          where: { key },
          update: {},
          create: { key, value }
        });
      } catch (err) {
        // Suppress concurrent write errors
      }
    }

    // 2. Initialize about content safely
    const aboutSections = [
      {
        section: 'intro',
        title: '公司简介',
        content: DEFAULT_CONFIGS.company_intro,
        image: '/img_about.png',
      },
      {
        section: 'mission',
        title: '企业使命',
        content: '为无人机行业培养高素质技术人才，提供专业可靠的维修与应用服务，推动西南地区低空经济持续发展。',
        image: '',
      },
      {
        section: 'vision',
        title: '企业愿景',
        content: '成为西南地区最具影响力的无人机培训与技术服务企业，让每一位学员都能掌握过硬的专业技能。',
        image: '',
      },
      {
        section: 'values',
        title: '核心价值观',
        content: '专业严谨、诚信服务、持续创新、客户至上。用技术说话，用结果证明价值。',
        image: '',
      },
    ];

    for (const item of aboutSections) {
      try {
        await prisma.aboutContent.upsert({
          where: { section: item.section },
          update: {},
          create: item
        });
      } catch (err) {
        // Suppress concurrent write errors
      }
    }

    // 3. Initialize course items
    const courseCount = await prisma.courseItem.count();
    if (courseCount === 0) {
      try {
        await prisma.courseItem.createMany({
          data: [
            {
              title: '多旋翼无人机维修基础',
              category: '基础课程',
              description: '掌握多旋翼无人机的基本结构原理，学习电机、电调、电池、飞控等核心部件的常见故障诊断与维修技能。',
              content: '本课程面向零基础学员，系统化讲解多旋翼飞行器的空气动力学原理、动力搭配计算以及基础焊接工艺。大比例真机动手实操，让学员独立完成飞行器的拆装与基础飞控调参。',
              image: '/card_repair.png',
              duration: '3天',
              price: '面议',
              sortOrder: 1,
            },
            {
              title: '固定翼无人机维修进阶',
              category: '进阶课程',
              description: '深入学习固定翼无人机的伺服系统、电调、动力总成及通讯链路的综合维修与调试技术，适合有一定基础的学员。',
              content: '专为具有一定行业基础的学员打造。深入解析固定翼飞机的气动布局、舵面舵机连杆安装规范以及发动机/电调故障检测。含燃油动力及重载固定翼的专项讲解。',
              image: '/card_training.png',
              duration: '5天',
              price: '面议',
              sortOrder: 2,
            },
            {
              title: '无人机飞控调参实战',
              category: '实战课程',
              description: '掌握主流飞控系统（ArduPilot、PX4、DJI）的参数调试与PID整定核心技术，实操比例占比80%以上。',
              content: '行业核心飞控调试专项实训。掌握开原飞控固件编译升级、传感器校准流程、航线规划以及黑匣子日志分析，针对飞行抖动等故障进行参数微调。',
              image: '/card_industry.png',
              duration: '3天',
              price: '面议',
              sortOrder: 3,
            },
            {
              title: '无人机图传与数链维修',
              category: '专项课程',
              description: '专项讲解图像传输系统、遥控数链模块的工作原理、常见干扰排查及硬件级维修方法，含天线焊接实操。',
              content: '无线电射频调试与芯片级焊接课程。针对模拟/数字高清图传系统、遥控射频模块进行硬件故障定位，教授精细BGA焊接以及频谱仪设备使用规范。',
              image: '/card_repair.png',
              duration: '2天',
              price: '面议',
              sortOrder: 4,
            },
          ]
        });
      } catch (error) {
        // Suppress concurrent write errors
      }
    }
  } catch (error) {
    console.error('Auto initialization failed:', error);
  }
}

export async function getSystemConfigs() {
  await ensureInitialized();
  try {
    const dbConfigs = await prisma.systemConfig.findMany();
    const configMap = {};
    
    // Populate defaults
    Object.keys(DEFAULT_CONFIGS).forEach(key => {
      configMap[key] = DEFAULT_CONFIGS[key];
    });

    // Overwrite with DB configs
    dbConfigs.forEach(item => {
      configMap[item.key] = item.value;
    });

    return configMap;
  } catch (error) {
    console.error('Error fetching system configs:', error);
    return DEFAULT_CONFIGS;
  }
}

export async function getSystemConfig(key) {
  await ensureInitialized();
  try {
    const item = await prisma.systemConfig.findUnique({ where: { key } });
    return item ? item.value : DEFAULT_CONFIGS[key] || '';
  } catch (error) {
    console.error(`Error fetching system config key "${key}":`, error);
    return DEFAULT_CONFIGS[key] || '';
  }
}

export async function setSystemConfig(key, value) {
  return await prisma.systemConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
}
