"use client";
import React from 'react';
import styles from './page.module.css';

export default function Demo5() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <a href="#" className={styles.logo}><img src="/images/LOGO.png" alt="Logo" className={styles.logoImg} /></a>
        <nav className={styles.nav}>
          <a href="#" className={styles.navItem}>首页</a>
          <a href="#" className={styles.navItem}>无人机零售</a>
          <a href="#" className={styles.navItem}>科创教育</a>
          <a href="#" className={styles.navItem}>行业应用</a>
          <a href="#" className={styles.navItem}>无人机考证</a>
          <a href="#" className={styles.navItem}>关于我们</a>
        </nav>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>致力于成为一站式无人机服务商</h1>
            <p className={styles.heroDesc}>无人机CAAC培训 · 大疆行业应用 · 科创教育研学 · 无人机编队表演</p>
          </div>
        </section>

        <section className={styles.menuGrid}>
          <div className={styles.menuItem}>
            <h3>无人机零售</h3>
            <p>大疆全系航拍及行业机型代理</p>
          </div>
          <div className={styles.menuItem}>
            <h3>无人机考证</h3>
            <p>CAAC 民航局执照授权培训机构</p>
          </div>
          <div className={styles.menuItem}>
            <h3>行业应用</h3>
            <p>安防、巡检、测绘及应急救援</p>
          </div>
          <div className={styles.menuItem}>
            <h3>科创教育</h3>
            <p>青少年无人机赛事与研学基地</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>无人机 CAAC 执照培训中心</h2>
          <div className={styles.courseGrid}>
            <div className={styles.courseCard}>
              <img src="/demo/demo5_hero.png" className={styles.courseImg} alt="多旋翼培训" />
              <div className={styles.courseInfo}>
                <h4>多旋翼视距内/超视距驾驶员</h4>
                <p>全面掌握多旋翼无人机的结构、原理及组装，熟练进行飞行操作及应急处置。全实景授课，资深教官一对一指导，考取民航局 CAAC 官方执照。</p>
                <a href="#" className={styles.courseBtn}>获取培训大纲</a>
              </div>
            </div>
            <div className={styles.courseCard}>
              <img src="/demo/demo4_hero.png" className={styles.courseImg} alt="垂直起降固定翼" />
              <div className={styles.courseInfo}>
                <h4>垂直起降固定翼驾驶员</h4>
                <p>针对大面积测绘与长距离巡检需求，学习固定翼航线规划、地面站使用与航空气象知识。理论结合实际飞行，提升行业应用能力。</p>
                <a href="#" className={styles.courseBtn}>获取培训大纲</a>
              </div>
            </div>
            <div className={styles.courseCard}>
              <img src="/demo/demo1_bg.png" className={styles.courseImg} alt="青少年研学" />
              <div className={styles.courseInfo}>
                <h4>青少年科普与赛事营地</h4>
                <p>面向全国中小学生开展无人机科创教育一日营、机甲大师编程课，输送选手参与全国青少年无人机大赛，启蒙科技梦想。</p>
                <a href="#" className={styles.courseBtn}>查看研学排期</a>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.entSection}>
          <h2 className={styles.sectionTitle}>大疆行业应用及解决方案</h2>
          <div className={styles.entGrid}>
            <img src="/demo/demo2_img1.png" className={styles.entImg} alt="大疆机场" />
            <div className={styles.entText}>
              <h3>大疆机场 2 (DJI Dock 2)</h3>
              <p>全新一代高性能小型无人值守平台。配备专有 Matrice 3D/3TD 无人机，轻量化易部署，大幅降低无人值守作业门槛。</p>
              <p>广泛应用于：<strong>电力巡检、环保监测、交通管理、智慧园区自动巡查。</strong></p>
              <a href="#" className={styles.courseBtn} style={{marginTop: '20px'}}>获取解决方案报价</a>
            </div>
          </div>
        </section>

        <section className={styles.repairSection}>
          <h2 className={styles.sectionTitle}>一站式无人机维修与保养中心</h2>
          <div className={styles.repairGrid}>
            <img src="/demo/drone_repair.png" className={styles.entImg} alt="无人机维修" />
            <div className={styles.repairText}>
              <h3>官方授权，专业修复</h3>
              <p>无论您使用的是消费级航拍无人机，还是高负载的工业级/农业级飞行平台，我们的资深维修工程师团队都能提供快速、透明、专业的维修及保养服务。</p>
              <ul className={styles.repairList}>
                <li><strong>免费定损与评估：</strong> 寄修或到店，提供清晰的故障检测报告。</li>
                <li><strong>原厂配件保障：</strong> 承诺100%使用官方原厂配件，拒绝副厂组装件。</li>
                <li><strong>深度保养计划：</strong> 提供飞控校准、电机除尘、动力系统养护等全套深度保养套餐。</li>
                <li><strong>换新与保险服务：</strong> 协助处理大疆随心换及第三方无人机财产险的理赔流程。</li>
              </ul>
              <a href="#" className={styles.courseBtn}>在线预约维修</a>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContact}>
            <h4>联系天空之镜</h4>
            <p><strong>服务热线：</strong> 400-8868-XXX / 167-XXXX-XXXX</p>
            <p><strong>培训基地：</strong> 虎丘湿地公园基地 / 低空经济产业园</p>
            <p><strong>服务时间：</strong> 周一至周五 (9:00-18:00)</p>
          </div>
          <div className={styles.footerNav}>
            <div>
              <h5>产品服务</h5>
              <ul>
                <li><a href="#">航拍无人机</a></li>
                <li><a href="#">行业应用无人机</a></li>
                <li><a href="#">教育赛事设备</a></li>
              </ul>
            </div>
            <div>
              <h5>培训体系</h5>
              <ul>
                <li><a href="#">CAAC考证</a></li>
                <li><a href="#">青少年研学</a></li>
                <li><a href="#">行业定制培训</a></li>
              </ul>
            </div>
            <div>
              <h5>快速链接</h5>
              <ul>
                <li><a href="#">关于我们</a></li>
                <li><a href="#">新闻资讯</a></li>
                <li><a href="#">加入我们</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          Copyright &copy; 2026 苏州天空之镜智能科技有限公司 / 云南星势力航空 版权所有. 滇ICP备2026007307号
        </div>
      </footer>
    </div>
  );
}
