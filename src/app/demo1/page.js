"use client";
import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function Demo1() {
  const images = ['/demo/demo1_bg.png', '/demo/hero2.png', '/demo/demo2_img1.png'];
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <img src="/demo/logo.png" className={styles.logoImg} style={{height: '60px'}} alt="Logo" />
        <nav className={styles.nav}>
          <a href="#">赛博架构</a>
          <a href="#">全息成像</a>
          <a href="#">量子链路</a>
          <a href="#">开发接入</a>
        </nav>
      </header>
      
      <main>
        <section className={styles.hero}>
          {images.map((img, idx) => (
            <img 
              key={idx} 
              src={img} 
              className={`${styles.heroBg} ${idx === currentImg ? styles.heroBgActive : ''}`} 
              alt="Hero Background" 
            />
          ))}
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>星势力·天穹网络</h1>
            <p className={styles.heroDesc}>超越视距的数字孪生架构，部署于云端的超低延迟无人机集群调度系统。用绝对的数据掌控，重新定义城市空域的极限。</p>
          </div>
        </section>

        <section className={styles.stats}>
          <div className={styles.statBox}>
            <div className={styles.statNum}>99.9%</div>
            <div className={styles.statLabel}>网络连通率</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNum}>1.2ms</div>
            <div className={styles.statLabel}>节点响应时间</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNum}>10TB+</div>
            <div className={styles.statLabel}>日均数据处理量</div>
          </div>
        </section>
        <section className={styles.cyberBanner}>
          <div className={styles.bannerText}>
            <h3>全域态势 <span>神盾指挥大屏</span></h3>
            <p>基于 WebGL 渲染的城市级数字沙盘，实时投射海量飞行器轨迹、挂载传感器回传的红外与可见光视频流。指挥官只需一块屏幕，即可掌控 500 平方公里空域的安全动态与入侵拦截警戒线。</p>
          </div>
          <button className={styles.neonBtn}>获取中控演示权限</button>
        </section>

        <section className={styles.features}>
          <h2 className={styles.sectionTitle}>核心底层技术</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>◆</div>
              <h3 className={styles.cardTitle}>高维空间感知</h3>
              <p className={styles.cardDesc}>采用毫米波雷达与高频激光雷达阵列，以 1000Hz 刷新率实时构建三维空间点云，实现极致的避障精度与环境洞察。</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>◈</div>
              <h3 className={styles.cardTitle}>分布式边缘计算</h3>
              <p className={styles.cardDesc}>机载 AI 芯片具备高达 100 TOPS 算力，可在飞行途中直接处理并分析复杂图像，大幅减轻云端压力并消除传输延迟。</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>◇</div>
              <h3 className={styles.cardTitle}>抗干扰微波链路</h3>
              <p className={styles.cardDesc}>基于动态跳频技术的加密通信协议，即便在密集的城市电磁风暴中，也能保障 20 公里级别的高清视频流绝对稳定。</p>
            </div>
          </div>
        </section>

        <section className={styles.dataSection}>
          <div className={styles.dataText}>
            <h2 className={styles.sectionTitle} style={{textAlign: 'left'}}>无缝接入数字孪生</h2>
            <p className={styles.cardDesc}>
              天穹网络提供完整的 API 体系，可将无人机采集的 8K 级高清影像与厘米级测绘数据，毫秒级注入到城市 GIS 系统与安防中控台中。
              打破物理与数字的边界，让城市管理者获得前所未有的全域视野。
            </p>
          </div>
          <img src="/demo/demo1_img1.png" className={styles.dataImage} alt="Cyber City" />
        </section>
      </main>

      <footer className={styles.footer}>
        <div>&copy; 2026 星势力航空科技. All Rights Reserved.</div>
        <div>System Version 4.0.1 | Status: Online</div>
      </footer>
    </div>
  );
}
