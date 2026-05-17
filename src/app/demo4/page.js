"use client";
import React from 'react';
import styles from './page.module.css';

export default function Demo4() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <a href="#" className={styles.logo}><img src="/demo/logo.png" alt="Logo" className={styles.logoImg} /></a>
        <nav className={styles.nav}>
          <a href="#" className={styles.navItem}>农业无人机</a>
          <a href="#" className={styles.navItem}>工业无人机</a>
          <a href="#" className={styles.navItem}>智能控制系统</a>
          <a href="#" className={styles.navItem}>服务与支持</a>
          <a href="#" className={styles.navItem}>关于拓攻</a>
        </nav>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>智造农业<br/>拓攻未来</h1>
            <p className={styles.heroDesc}>全新一代 FP 系列农业植保无人机，50L 超大载重，全场景智能播撒，让农业更简单、更高效。</p>
            <button className={styles.heroBtn}>了解全新 FP500</button>
          </div>
        </section>

        <section className={styles.products}>
          <h2 className={styles.sectionTitle}>强大，不凡</h2>
          <p className={styles.sectionSubtitle}>专为现代农业与工业场景打造的旗舰级飞行平台</p>
          <div className={styles.productGrid}>
            <div className={styles.productCard}>
              <span className={styles.productTag}>2025 新品</span>
              <img src="/demo/demo1_img1.png" className={styles.productImg} alt="FP500" />
              <h3 className={styles.productName}>FP500 农业植保机</h3>
              <p className={styles.productDesc}>50升超大药箱，70升播撒箱。双重离心雾化系统配合雷达避障，实现每小时200亩超高效率作业。折叠化设计，便携转场。</p>
              <a href="#" className={styles.productLink}>探索详情 &gt;</a>
            </div>
            <div className={styles.productCard}>
              <span className={styles.productTag}>工业旗舰</span>
              <img src="/demo/hero2.png" className={styles.productImg} alt="M600" />
              <h3 className={styles.productName}>M600 工业飞行器</h3>
              <p className={styles.productDesc}>支持三光吊舱、激光雷达与高音喊话器。55分钟超长续航，IP55级防护，无惧恶劣天气，专为电力巡检与应急救援研发。</p>
              <a href="#" className={styles.productLink}>探索详情 &gt;</a>
            </div>
          </div>
        </section>

        <section className={styles.systemBanner}>
          <div className={styles.systemText}>
            <h2 className={styles.systemTitle}>星势力·智慧大脑平台</h2>
            <p className={styles.systemDesc}>自主研发的飞控系统与云端数据管理平台。实时回传飞行数据，AI算法自动生成航线与植保处方图，让飞行全自动，管理全数字化。</p>
            <div className={styles.systemData}>
              <div className={styles.dataBlock}>
                <h4>1000+</h4>
                <p>全球服务网点</p>
              </div>
              <div className={styles.dataBlock}>
                <h4>30万+</h4>
                <p>平台接入设备</p>
              </div>
              <div className={styles.dataBlock}>
                <h4>5000万</h4>
                <p>累计作业面积(亩)</p>
              </div>
            </div>
          </div>
          <img src="/demo/demo2_img2.png" className={styles.systemImg} alt="智慧大脑" />
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <h2>TOPUAV</h2>
            <p>星势力航空科技有限公司，致力于为全球用户提供领先的工业及农业无人机系统解决方案。</p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.linkGroup}>
              <h4>产品系列</h4>
              <ul>
                <li><a href="#">农业植保系列</a></li>
                <li><a href="#">工业巡检系列</a></li>
                <li><a href="#">智能遥控器</a></li>
              </ul>
            </div>
            <div className={styles.linkGroup}>
              <h4>技术与服务</h4>
              <ul>
                <li><a href="#">下载中心</a></li>
                <li><a href="#">售后政策</a></li>
                <li><a href="#">视频教学</a></li>
              </ul>
            </div>
            <div className={styles.linkGroup}>
              <h4>关于我们</h4>
              <ul>
                <li><a href="#">品牌故事</a></li>
                <li><a href="#">新闻动态</a></li>
                <li><a href="#">加入我们</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          &copy; 2026 星势力航空科技有限公司. 保留所有权利. 滇ICP备2026007307号
        </div>
      </footer>
    </div>
  );
}
