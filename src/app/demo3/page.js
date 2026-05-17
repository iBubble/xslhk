"use client";
import React from 'react';
import styles from './page.module.css';

export default function Demo3() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <a href="#" className={styles.logo}><img src="/images/LOGO.png" alt="Logo" className={styles.logoImg} /></a>
        <nav className={styles.nav}>
          <a href="#" className={styles.navItem}>应用</a>
          <a href="#" className={styles.navItem}>产品</a>
          <a href="#" className={styles.navItem}>支持</a>
          <a href="#" className={styles.navItem}>资讯</a>
          <a href="#" className={styles.navItem}>关于</a>
          <a href="#" className={styles.navItem}>合作公社</a>
        </nav>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>专注无人机技术创新</h1>
            <p className={styles.heroDesc}>全球电池动力植保无人机科技的创新领导者，全面赋能现代农业与公共安全</p>
            <button className={styles.heroBtn}>了解更多</button>
          </div>
        </section>

        <section className={styles.categories}>
          <h2 className={styles.sectionTitle}>核心产品体系</h2>
          <p className={styles.sectionSubtitle}>涵盖农业植保、巡检安防、无人车及数据管理平台，提供全场景智能装备</p>
          <div className={styles.catGrid}>
            <div className={styles.catCard}>
              <img src="/demo/demo2_img1.png" className={styles.catImg} alt="植保无人机" />
              <h3 className={styles.catTitle}>农业植保无人机</h3>
              <p className={styles.catDesc}>X32、H22系列高效植保机，具备大载重、全自主仿地飞行与精准喷洒能力，提升农田作业效率。</p>
            </div>
            <div className={styles.catCard}>
              <img src="/demo/demo1_img1.png" className={styles.catImg} alt="巡检安防无人机" />
              <h3 className={styles.catTitle}>巡检安防无人机</h3>
              <p className={styles.catDesc}>长航时高抗风，搭载双光红外吊舱与喊话器，专为电力巡检、边防巡逻、城市安防打造。</p>
            </div>
            <div className={styles.catCard}>
              <img src="/demo/hero2.png" className={styles.catImg} alt="无人车" />
              <h3 className={styles.catTitle}>F70 地面无人车</h3>
              <p className={styles.catDesc}>多功能越野底盘平台，支持果园履带喷洒、物流搬运与危化环境侦测，实现空地协同。</p>
            </div>
          </div>
        </section>

        <section className={styles.featureSection}>
          <img src="/demo/demo2_img2.png" className={styles.featureImg} alt="平台" />
          <div className={styles.featureText}>
            <h2 className={styles.featureTitle}>5G 物联网大数据平台</h2>
            <p className={styles.featureDesc}>我们不仅仅提供智能硬件，更通过自主研发的大数据管理中心，为农业服务、无人机管理与数据采集分析提供可视化后台。</p>
            <ul className={styles.featureList}>
              <li>实时监控全国设备的运行状态与作业轨迹</li>
              <li>农服中心作业面积与农药消耗智能统计</li>
              <li>一键生成植保处方图，助力精准农业</li>
              <li>无人机反制与空域安全管理对接</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerCol}>
            <h4>产品中心</h4>
            <ul>
              <li><a href="#">植保无人机系列</a></li>
              <li><a href="#">巡检安防系列</a></li>
              <li><a href="#">无人车系列</a></li>
              <li><a href="#">公共安全装备</a></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>技术支持</h4>
            <ul>
              <li><a href="#">售后服务中心</a></li>
              <li><a href="#">飞手证查询</a></li>
              <li><a href="#">视频教程中心</a></li>
              <li><a href="#">保险服务</a></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>公社体系</h4>
            <ul>
              <li><a href="#">加入农民公社</a></li>
              <li><a href="#">培训中心</a></li>
              <li><a href="#">农服大数据平台</a></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>联系我们</h4>
            <ul>
              <li>电话：+86 400-XXX-XXXX</li>
              <li>邮箱：sales@ynxslhk.com</li>
              <li>地址：云南省昆明市盘龙区</li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2026 云南星势力航空科技有限公司. 专注无人机技术创新.</p>
        </div>
      </footer>
    </div>
  );
}
