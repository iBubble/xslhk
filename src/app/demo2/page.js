"use client";
import React from 'react';
import styles from './page.module.css';

export default function Demo2() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <a href="#">
          <img src="/demo/logo.png" className={styles.logoImg} alt="星势力航空" />
        </a>
        <nav className={styles.nav}>
          <a href="#" className={styles.navItem}>首页</a>
          <a href="#" className={styles.navItem}>产品中心</a>
          <a href="#" className={styles.navItem}>解决方案</a>
          <a href="#" className={styles.navItem}>产教融合</a>
          <a href="#" className={styles.navItem}>低空智联</a>
          <a href="#" className={styles.navItem}>关于我们</a>
        </nav>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>星势力航空<br/>创造天空生产力</h1>
            <p className={styles.heroDesc}>致力于成为全球领先的低空经济与无人系统整体解决方案提供商。我们以创新为核心，赋能通用航空、应急救援与智慧城市建设。</p>
            <button className={styles.heroBtn}>探索核心技术</button>
          </div>
        </section>

        <section className={styles.products}>
          <h2 className={styles.sectionTitle}>产品中心</h2>
          <p className={styles.sectionSubtitle}>全谱系工业级无人机平台，适应全天候、全地形严苛作业</p>
          <div className={styles.productGrid}>
            <div className={styles.productCard}>
              <img src="/demo/demo2_img1.png" className={styles.productImg} alt="AF-35EV" />
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>ASTF-35EV 复合翼</h3>
                <p className={styles.productDesc}>电动垂直起降复合翼无人机，续航突破150分钟，专为长航时大面积测绘与巡检打造。</p>
              </div>
            </div>
            <div className={styles.productCard}>
              <img src="/demo/demo1_img1.png" className={styles.productImg} alt="M1300" />
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>M1300 多旋翼系统</h3>
                <p className={styles.productDesc}>六轴大载重多旋翼飞行器，支持双光云台、喊话器、抛投器等数十种外挂设备。</p>
              </div>
            </div>
            <div className={styles.productCard}>
              <img src="/demo/hero2.png" className={styles.productImg} alt="AG-30" />
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>AG-30 灭火无人机</h3>
                <p className={styles.productDesc}>挂载30公斤级高层灭火弹与灭火溶剂，精准打击超高层建筑与森林火点。</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.dataStrip}>
          <div>
            <div className={styles.dataNum}>100+</div>
            <div className={styles.dataLabel}>专利技术与软著</div>
          </div>
          <div>
            <div className={styles.dataNum}>5000+</div>
            <div className={styles.dataLabel}>行业成功案例</div>
          </div>
          <div>
            <div className={styles.dataNum}>15+</div>
            <div className={styles.dataLabel}>覆盖省市地区</div>
          </div>
        </section>

        <section className={styles.solutions}>
          <h2 className={styles.sectionTitle}>行业解决方案</h2>
          <p className={styles.sectionSubtitle}>深入业务场景，提供从硬件到软件的端到端交付服务</p>
          
          <div className={styles.solRow}>
            <img src="/demo/demo2_img2.png" className={styles.solImg} alt="产教融合" />
            <div className={styles.solText}>
              <h3 className={styles.solTitle}>产教融合与人才培养</h3>
              <p className={styles.solDesc}>与国内数十所高校及职业院校开展深度合作，共建“低空产业学院”与“无人机专业实训基地”。提供全套教具、课程大纲与师资培训。</p>
              <ul className={styles.solList}>
                <li>CAAC 民航局认证考证培训</li>
                <li>警用/消防/电力定制化飞行培训</li>
                <li>青少年航空科普与研学营地建设</li>
              </ul>
            </div>
          </div>

          <div className={`${styles.solRow} ${styles.solRowReverse}`}>
            <img src="/demo/hero2.png" className={styles.solImg} alt="低空智联" style={{filter:'grayscale(0.3)'}} />
            <div className={styles.solText}>
              <h3 className={styles.solTitle}>低空安全与智联管控</h3>
              <p className={styles.solDesc}>构建区域性低空飞行器监管平台，提供侦测、解析、反制一体化的综合安防设备，保障核心区域低空空域的绝对安全。</p>
              <ul className={styles.solList}>
                <li>空哨系列无人机报文解析站</li>
                <li>一网统飞数字孪生管控平台</li>
                <li>城市低空基础设施建设咨询</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerCol} style={{flex: 2}}>
            <img src="/demo/logo.png" style={{height: '50px', filter: 'brightness(0) invert(1)', marginBottom: '20px'}} alt="Footer Logo" />
            <p style={{lineHeight: '1.8', maxWidth: '300px'}}>云南星势力航空科技有限公司<br/>创造天空生产力，领航低空经济新纪元。</p>
          </div>
          <div className={styles.footerCol} style={{flex: 1}}>
            <h4>产品中心</h4>
            <ul>
              <li><a href="#">空中未来系列</a></li>
              <li><a href="#">空中卫士系列</a></li>
              <li><a href="#">低空安全管控设备</a></li>
            </ul>
          </div>
          <div className={styles.footerCol} style={{flex: 1}}>
            <h4>解决方案</h4>
            <ul>
              <li><a href="#">无人机应用</a></li>
              <li><a href="#">通用航空</a></li>
              <li><a href="#">产教融合</a></li>
            </ul>
          </div>
          <div className={styles.footerCol} style={{flex: 1}}>
            <h4>联系方式</h4>
            <ul>
              <li>电话：400-XXX-XXXX</li>
              <li>邮箱：contact@ynxslhk.com</li>
              <li>地址：云南省昆明市盘龙区</li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          &copy; 2026 云南星势力航空科技有限公司. All rights reserved. 滇ICP备2026007307号
        </div>
      </footer>
    </div>
  );
}
