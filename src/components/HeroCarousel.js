'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroCarousel() {
  const slides = [
    {
      image: '/home_hero_fixed.png',
      title1: '重新定义天空',
      title2: '探索无限可能',
      desc: '星势力航空科技为您提供极致的无人机研发定制、专业 CAAC 执照培训及行业设备深度保养与维修。',
      link1: '/services', link1Text: '探索业务',
      link2: '/contact', link2Text: '联系我们'
    },
    {
      image: '/img_service.png',
      title1: '掌握核心技术',
      title2: '驭空制胜未来',
      desc: '专注于高性能行业应用无人机，涵盖测绘、勘探、安防与植保，提供端到端的飞行生态方案。',
      link1: '/services', link1Text: '行业方案',
      link2: '/contact', link2Text: '咨询定制'
    },
    {
      image: '/img_training.png',
      title1: '培养顶尖飞手',
      title2: '筑梦通航时代',
      desc: '国家级 CAAC 授权考试中心，全真机型实操，从零起步到教员级别的全链路职业规划。',
      link1: '/training', link1Text: '了解培训',
      link2: '/contact', link2Text: '立即报名'
    }
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section style={{
      position: 'relative',
      height: 'min(900px, 100vh)',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      borderBottom: '1px solid var(--border-glass)'
    }}>
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div key={`bg-${index}`} style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("${slide.image}")`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          opacity: current === index ? 1 : 0,
          transform: current === index ? 'scale(1.05)' : 'scale(1)',
          transition: 'opacity 1.5s ease-in-out, transform 8s linear',
          zIndex: 1,
        }} />
      ))}
      
      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(5,5,5,0.2) 0%, rgba(5,5,5,0.6) 70%, rgba(5,5,5,1) 100%)',
        zIndex: 2,
      }} />
      
      <div className="container" style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '100%', height: '300px' }}>
          {slides.map((slide, index) => (
            <div key={`text-${index}`} style={{ 
              maxWidth: '700px', 
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: current === index ? 1 : 0,
              pointerEvents: current === index ? 'auto' : 'none',
              transition: 'opacity 1s ease-in-out, transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: current === index ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.98)',
            }}>
              <h1 className="text-gradient" style={{ marginBottom: '1.5rem', fontWeight: 600 }}>
                {slide.title1}<br />
                <span style={{ color: 'var(--text-secondary)' }}>{slide.title2}</span>
              </h1>
              <p style={{ fontSize: '1.1rem', marginBottom: '3rem', maxWidth: '500px', lineHeight: 1.8 }}>
                {slide.desc}
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link href={slide.link1} className="btn-primary">
                  {slide.link1Text}
                </Link>
                <Link href={slide.link2} className="btn-outline">
                  {slide.link2Text}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicators */}
      <div style={{ position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.8rem', zIndex: 11 }}>
        {slides.map((_, index) => (
          <button 
            key={`dot-${index}`}
            onClick={() => setCurrent(index)}
            style={{
              width: current === index ? '2.5rem' : '0.5rem',
              height: '0.5rem',
              borderRadius: '5px',
              backgroundColor: current === index ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
