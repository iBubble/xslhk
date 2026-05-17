"use client";
import { useState, useEffect } from 'react';

export default function ShowcaseGallery({ items = [] }) {
  const [selectedCat, setSelectedCat] = useState('全部');
  const [lightboxIndex, setLightboxIndex] = useState(null); // null 表示关闭
  const [currentPage, setCurrentPage] = useState(1);

  const categories = ['全部', ...new Set(items.map(i => i.category || '风采展示'))];

  const filteredItems = selectedCat === '全部'
    ? items
    : items.filter(item => item.category === selectedCat);

  // 切换分类时重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCat]);

  const pageSize = 10;
  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const activePage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const paginatedItems = filteredItems.slice((activePage - 1) * pageSize, activePage * pageSize);

  // 监听键盘按键，进行无缝大图切换与关闭
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredItems]);

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    if (lightboxIndex !== null && filteredItems.length > 0) {
      setLightboxIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    if (lightboxIndex !== null && filteredItems.length > 0) {
      setLightboxIndex(prev => (prev + 1) % filteredItems.length);
    }
  };

  const currentItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <>
      <style>{`
        .gallery-cat-tab {
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .gallery-cat-tab:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0,86,179,0.15);
        }
        .gallery-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border: 1px solid rgba(0,0,0,0.03);
        }
        .gallery-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }
        .gallery-img-container {
          position: relative;
          overflow: hidden;
          aspect-ratio: 4/3;
        }
        .gallery-img-container img {
          transition: transform 0.6s ease;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .gallery-card:hover .gallery-img-container img {
          transform: scale(1.08);
        }
        .gallery-overlay-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(0, 86, 179, 0.9);
          color: #fff;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.72rem;
          font-weight: 600;
          backdrop-filter: blur(4px);
        }
        .nav-arrow-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.75);
          width: auto;
          height: auto;
          border-radius: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 3.2rem;
          line-height: 1;
          transition: all 0.25s ease;
          outline: none;
          padding: 0;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
        }
        .nav-arrow-btn:hover {
          color: rgba(255, 255, 255, 1);
          transform: scale(1.15);
        }
        .close-lightbox-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255,255,255,0.1);
          border: none;
          color: #fff;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 1100;
          backdrop-filter: blur(5px);
        }
        .close-lightbox-btn:hover {
          background: rgba(239, 68, 68, 0.85);
          transform: rotate(90deg);
        }
      `}</style>

      {/* Category Tabs */}
      {categories.length > 2 && (
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '3rem', justifyContent: 'center' }}>
          {categories.map(cat => {
            const isAct = cat === selectedCat;
            return (
              <span
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className="gallery-cat-tab"
                style={{
                  padding: '8px 22px',
                  borderRadius: '30px',
                  background: isAct ? '#0056b3' : '#fff',
                  color: isAct ? '#fff' : '#4b5563',
                  border: isAct ? '1px solid #0056b3' : '1px solid #e5e7eb',
                  fontSize: '0.88rem',
                  fontWeight: isAct ? 600 : 500,
                  boxShadow: isAct ? '0 4px 12px rgba(0,86,179,0.25)' : '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                {cat}
              </span>
            );
          })}
        </div>
      )}

      {/* Grid List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '2rem' }}>
        {paginatedItems.map((item) => {
          const globalIdx = filteredItems.findIndex(i => i.id === item.id);
          return (
            <div
              key={item.id}
              className="gallery-card"
              onClick={() => setLightboxIndex(globalIdx)}
            >
              <div className="gallery-img-container">
                <img src={item.image} alt={item.title} />
                <span className="gallery-overlay-badge">{item.category || '风采'}</span>
              </div>
              {/* 说明文字小卡片 */}
              <div style={{ padding: '1.4rem' }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#1f2937',
                  marginBottom: '0.6rem',
                  lineHeight: 1.4
                }}>
                  {item.title}
                </h3>
                {item.content ? (
                  <div
                    style={{
                      fontSize: '0.86rem',
                      color: '#6b7280',
                      lineHeight: 1.6,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 3,
                    }}
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                ) : (
                  <p style={{ fontSize: '0.86rem', color: '#9ca3af', fontStyle: 'italic' }}>暂无详细描述</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Premium Front-end Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3.5rem', alignItems: 'center' }}>
          <style>{`
            .page-btn {
              padding: 8px 16px;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
              background: #fff;
              color: #4b5563;
              font-size: 0.88rem;
              font-weight: 500;
              transition: all 0.2s;
              cursor: pointer;
              outline: none;
            }
            .page-btn:hover {
              background: #f3f4f6;
              border-color: #d1d5db;
              color: #1f2937;
            }
            .page-btn.active {
              background: #0056b3;
              border-color: #0056b3;
              color: #fff;
              box-shadow: 0 4px 10px rgba(0,86,179,0.25);
            }
          `}</style>
          {activePage > 1 && (
            <button onClick={() => setCurrentPage(1)} className="page-btn">首页</button>
          )}
          {activePage > 1 && (
            <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="page-btn">《</button>
          )}
          
          {Array.from({ length: totalPages }).map((_, idx) => {
            const p = idx + 1;
            const isCurrent = p === activePage;
            return (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={isCurrent ? "page-btn active" : "page-btn"}
              >
                {p}
              </button>
            );
          })}

          {activePage < totalPages && (
            <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} className="page-btn">》</button>
          )}
          {activePage < totalPages && (
            <button onClick={() => setCurrentPage(totalPages)} className="page-btn">尾页</button>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && currentItem && (
        <div
          onClick={() => setLightboxIndex(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 11, 16, 0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          {/* Close Button */}
          <button
            className="close-lightbox-btn"
            onClick={() => setLightboxIndex(null)}
            title="关闭 (Esc)"
          >
            ✕
          </button>

          {/* Left Arrow */}
          <div style={{ position: 'absolute', left: '4vw', zIndex: 1010 }}>
            <button
              className="nav-arrow-btn"
              onClick={handlePrev}
              title="上一张"
            >
              《
            </button>
          </div>

          {/* Middle Content Wrapper */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '900px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.2rem',
            }}
          >
            {/* Big Image Container */}
            <div style={{
              position: 'relative',
              maxHeight: '68vh',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <img
                src={currentItem.image}
                alt={currentItem.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '68vh',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>

            {/* Description Card */}
            <div style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '1.2rem 1.5rem',
              color: '#f3f4f6',
              textAlign: 'center',
              backdropFilter: 'blur(5px)',
            }}>
              <span style={{
                background: '#0056b3',
                color: '#fff',
                padding: '3px 10px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
                display: 'inline-block'
              }}>
                {currentItem.category || '风采展示'}
              </span>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0.2rem 0 0.5rem', color: '#fff' }}>
                {currentItem.title}
              </h4>
              {currentItem.content && (
                <div
                  style={{
                    fontSize: '0.88rem',
                    color: '#9ca3af',
                    lineHeight: 1.6,
                    maxHeight: '80px',
                    overflowY: 'auto',
                    padding: '0 10px',
                  }}
                  dangerouslySetInnerHTML={{ __html: currentItem.content }}
                />
              )}
              <div style={{ fontSize: '0.75rem', color: '#4b5563', marginTop: '0.8rem' }}>
                {lightboxIndex + 1} / {filteredItems.length}
              </div>
            </div>
          </div>

          {/* Right Arrow */}
          <div style={{ position: 'absolute', right: '4vw', zIndex: 1010 }}>
            <button
              className="nav-arrow-btn"
              onClick={handleNext}
              title="下一张"
            >
              》
            </button>
          </div>
        </div>
      )}
    </>
  );
}
