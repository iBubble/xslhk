"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function HomeHeroCarousel({ slides = [] }) {
  const [currIndex, setCurrIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayTimer = useRef(null);

  const defaultSlides = [
    {
      id: 'd1',
      title: "星势力航空 创造天空生产力",
      subtitle: "致力于成为西南领先的无人机培训、维修与行业应用解决方案提供商，赋能通用航空与低空经济新纪元。",
      image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1600&auto=format&fit=crop&q=80",
      btnText: "无人机维修课程",
      btnLink: "/courses"
    },
    {
      id: 'd2',
      title: "硬核维保 护航每一次安全飞行",
      subtitle: "专业芯片级主板修复、高频射频链路调试及姿态控制PID精调，为您打造无懈可击的安全保障。",
      image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600&auto=format&fit=crop&q=80",
      btnText: "了解维保实力",
      btnLink: "/about"
    },
    {
      id: 'd3',
      title: "深度产教融合 孵化低空紧缺人才",
      subtitle: "与多所院校共建“无人机应用专业”及一体化实训示范基地，为低空经济发展源源不断输送专业力量。",
      image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1600&auto=format&fit=crop&q=80",
      btnText: "洽谈项目合作",
      btnLink: "/cooperation"
    }
  ];

  const displaySlides = slides.length > 0 ? slides : defaultSlides;

  // 启动自动播放
  useEffect(() => {
    if (isHovered) {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
      return;
    }
    autoPlayTimer.current = setInterval(() => {
      setCurrIndex(prev => (prev + 1) % displaySlides.length);
    }, 5000);

    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    };
  }, [isHovered, displaySlides.length]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrIndex(prev => (prev - 1 + displaySlides.length) % displaySlides.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrIndex(prev => (prev + 1) % displaySlides.length);
  };

  return (
    <section
      className="hero-carousel-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        height: '620px',
        overflow: 'hidden',
        background: '#090a0f',
      }}
    >
      <style>{`
        /* 大图淡入淡出与镜头拉近（呼吸感） */
        .carousel-slide-item {
          position: absolute;
          inset: 0;
          opacity: 0;
          visibility: hidden;
          transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1),
                      visibility 1.2s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }
        .carousel-slide-item.active {
          opacity: 1;
          visibility: visible;
          z-index: 2;
        }
        .carousel-bg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.08);
          transition: transform 6s ease-out;
        }
        .carousel-slide-item.active .carousel-bg-img {
          transform: scale(1.01);
        }

        /* 蒙层渐变 */
        .carousel-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(10, 11, 16, 0.78) 0%, rgba(10, 11, 16, 0.35) 60%, rgba(10, 11, 16, 0.15) 100%);
          z-index: 3;
        }

        /* 文字内容动画：自下而上弹出 */
        .carousel-content-box {
          position: relative;
          z-index: 10;
          color: #fff;
          max-width: 650px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-left: 10vw;
          padding-right: 5vw;
        }
        .animate-up {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .carousel-slide-item.active .animate-up.title-tag {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.3s;
        }
        .carousel-slide-item.active .animate-up.main-title {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.5s;
        }
        .carousel-slide-item.active .animate-up.subtitle {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.7s;
        }
        .carousel-slide-item.active .animate-up.btn-box {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.9s;
        }

        /* 极奢清爽左右按键 */
        .carousel-nav-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.55);
          cursor: pointer;
          font-size: 3.2rem;
          line-height: 1;
          transition: all 0.25s ease;
          outline: none;
          padding: 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          user-select: none;
        }
        .carousel-nav-btn:hover {
          color: rgba(255, 255, 255, 1);
          transform: translateY(-50%) scale(1.15);
        }

        /* 底部高档进度指示器 */
        .carousel-indicators {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.6rem;
          z-index: 20;
        }
        .indicator-dot {
          width: 24px;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.22);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .indicator-dot.active {
          width: 48px;
          background: #fff;
          box-shadow: 0 0 10px rgba(255,255,255,0.4);
        }

        /* 按钮与大图文字细节 */
        .about-link-btn {
          display: inline-block;
          border: 2px solid rgba(255,255,255,0.7);
          color: #fff;
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 1rem;
          transition: background 0.3s;
          text-decoration: none;
        }
        .about-link-btn:hover {
          background: rgba(255,255,255,0.15);
          color: #fff;
        }
      `}</style>

      {/* Slides Wrap */}
      {displaySlides.map((slide, index) => {
        const isActive = index === currIndex;
        return (
          <div
            key={slide.id || index}
            className={`carousel-slide-item ${isActive ? 'active' : ''}`}
          >
            {/* Background Image with breathing Zoom effect */}
            <img
              className="carousel-bg-img"
              src={slide.image}
              alt={slide.title}
            />
            {/* Smooth Vignette Gradient Overlay */}
            <div className="carousel-overlay" />

            {/* Inner Content */}
            <div className="carousel-content-box">
              <div className="animate-up title-tag" style={{ display: 'inline-block', background: 'rgba(0,86,179,0.85)', color: '#fff', padding: '4px 16px', borderRadius: '4px', fontSize: '0.85rem', letterSpacing: '2px', marginBottom: '1.5rem', fontWeight: 500, alignSelf: 'flex-start' }}>
                {slide.title_tag || "云南星势力航空科技有限公司"}
              </div>
              <h1 className="animate-up main-title" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                {slide.title}
              </h1>
              <p className="animate-up subtitle" style={{ color: 'rgba(255,255,255,0.88)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: '520px' }}>
                {slide.subtitle}
              </p>
              <div className="animate-up btn-box" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href={slide.btnLink || '/courses'} className="btn-white">
                  {slide.btnText || '了解更多'}
                </Link>
                <Link href="/contact" className="about-link-btn">
                  联系我们
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Prev / Next Chevrons without circular frame */}
      <button
        className="carousel-nav-btn"
        onClick={handlePrev}
        style={{ left: '4vw' }}
        title="上一张"
      >
        《
      </button>
      <button
        className="carousel-nav-btn"
        onClick={handleNext}
        style={{ right: '4vw' }}
        title="下一张"
      >
        》
      </button>

      {/* Premium capsule-shaped Indicators */}
      <div className="carousel-indicators">
        {displaySlides.map((_, index) => (
          <div
            key={index}
            className={`indicator-dot ${index === currIndex ? 'active' : ''}`}
            onClick={() => setCurrIndex(index)}
          />
        ))}
      </div>
    </section>
  );
}
