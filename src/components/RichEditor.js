"use client";
import { useState, useRef, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';

export default function RichEditor({ name, defaultValue = '', placeholder = '请输入正文内容...' }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [html, setHtml] = useState(defaultValue);
  const [mounted, setMounted] = useState(false);
  const [imagesInContent, setImagesInContent] = useState([]);
  const [selectedCover, setSelectedCover] = useState('');

  // 自定义链接/图片插入弹窗状态
  const [modalType, setModalType] = useState(null); // null | 'link' | 'image'
  const [modalValue, setModalValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [editorError, setEditorError] = useState('');

  // 错误提示自动消失
  useEffect(() => {
    if (editorError) {
      const timer = setTimeout(() => setEditorError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [editorError]);

  // 1. 仅在挂载时将 mounted 设为 true
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. 在 mounted 变为 true，或者 defaultValue 改变，且真实的编辑器 DOM 已经存在时，初始化内容
  useEffect(() => {
    if (mounted && editorRef.current) {
      // 安全过滤初始化值
      const cleanHtml = DOMPurify.sanitize(defaultValue);
      editorRef.current.innerHTML = cleanHtml;
      setHtml(cleanHtml);
    }
  }, [mounted, defaultValue]);

  // 监听并实时提取内容中的图片链接
  useEffect(() => {
    if (mounted && editorRef.current) {
      const imgs = editorRef.current.querySelectorAll('img');
      const srcList = [];
      imgs.forEach(img => {
        if (img.src && !srcList.includes(img.src)) {
          srcList.push(img.src);
        }
      });
      setImagesInContent(srcList);

      const imageInput = document.querySelector('input[name="image"]');
      if (imageInput && srcList.length > 0) {
        // 如果当前封面图路径为空，或者处于系统的默认占位符状态，自动默认将第一张图片设为封面
        const val = imageInput.value;
        const isDefault = !val || val === '/img_news.png' || val === '/card_repair.png' || val === '/img_service.png' || val === '/demo/logo.png';
        if (isDefault) {
          imageInput.value = srcList[0];
          imageInput.dispatchEvent(new Event('input', { bubbles: true }));
          setSelectedCover(srcList[0]);
        }
      }
    }
  }, [html, mounted]);

  // 监听输入框的修改，保持缩略图选中同步
  useEffect(() => {
    if (mounted) {
      const imageInput = document.querySelector('input[name="image"]');
      if (imageInput) {
        setSelectedCover(imageInput.value);
        const handleRawInput = (e) => {
          setSelectedCover(e.target.value);
        };
        imageInput.addEventListener('input', handleRawInput);
        return () => {
          imageInput.removeEventListener('input', handleRawInput);
        };
      }
    }
  }, [mounted]);

  const handleSelectCover = (src) => {
    const imageInput = document.querySelector('input[name="image"]');
    if (imageInput) {
      imageInput.value = src;
      imageInput.dispatchEvent(new Event('input', { bubbles: true }));
      setSelectedCover(src);
    }
  };
  const handleInput = () => {
    if (editorRef.current) {
      // 实时获取编辑器内容并做基本的 sanitize 过滤后更新组件状态
      const rawHtml = editorRef.current.innerHTML;
      setHtml(rawHtml);
    }
  };

  const executeCommand = (command, value = null) => {
    if (typeof document !== 'undefined') {
      document.execCommand(command, false, value);
      handleInput();
    }
  };

  const insertLink = () => {
    setModalType('link');
    setModalValue('');
  };

  const insertImageByUrl = () => {
    setModalType('image');
    setModalValue('');
  };

  const insertHTMLAtCursor = (htmlString) => {
    if (typeof document === 'undefined') return;
    
    if (editorRef.current) {
      editorRef.current.focus();
    }
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        try {
          document.execCommand('insertHTML', false, htmlString);
          handleInput();
          return;
        } catch (e) {
          console.error("execCommand failed:", e);
        }
        
        range.deleteContents();
        const el = document.createElement("div");
        el.innerHTML = htmlString;
        const frag = document.createDocumentFragment();
        let node;
        let lastNode;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        
        if (lastNode) {
          const newRange = range.cloneRange();
          newRange.setStartAfter(lastNode);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
        handleInput();
        return;
      }
    }
    
    if (editorRef.current) {
      const el = document.createElement("div");
      el.innerHTML = htmlString;
      while (el.firstChild) {
        editorRef.current.appendChild(el.firstChild);
      }
      handleInput();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 前端基础校验
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setEditorError('仅支持上传 JPG, PNG, GIF, WEBP 格式的图片');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setEditorError('文件过大，单张图片不能超过 5MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setEditorError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '文件上传失败');
      }

      // 安全插入 HTML 指向上传后的服务器图片路径
      insertHTMLAtCursor(`<img src="${data.url}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" alt="uploaded image" />`);
    } catch (err) {
      console.error('上传本地图片失败:', err);
      setEditorError(err.message || '网络错误，文件上传失败');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  if (!mounted) {
    return (
      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        编辑器加载中...
      </div>
    );
  }

  return (
    <div style={{
      background: '#0a0b10',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'inherit',
      position: 'relative',
    }}>
      {/* 错误提示浮层 */}
      {editorError && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(239, 68, 68, 0.95)',
          color: '#fff',
          padding: '0.6rem 1.2rem',
          borderRadius: '6px',
          fontSize: '0.82rem',
          fontWeight: 500,
          zIndex: 1000,
          boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <span>⚠️ {editorError}</span>
          <button
            type="button"
            onClick={() => setEditorError('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              padding: '0 4px',
              opacity: 0.8,
              lineHeight: 1,
            }}
            onMouseOver={e => e.currentTarget.style.opacity = 1}
            onMouseOut={e => e.currentTarget.style.opacity = 0.8}
          >
            ✕
          </button>
        </div>
      )}
      {/* 嵌入式超链接/图片插入弹窗 (替换不安全且体验差的 prompt) */}
      {modalType && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(10, 11, 16, 0.88)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem',
        }}>
          <div style={{
            background: '#0d0f16',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '360px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}>
            <h4 style={{ margin: '0 0 1rem', color: '#f8fafc', fontSize: '0.95rem', fontWeight: 600 }}>
              {modalType === 'link' ? '🔗 插入超链接' : '🌐🖼️ 插入网络图片链接'}
            </h4>
            <input
              type="text"
              value={modalValue}
              onChange={e => setModalValue(e.target.value)}
              placeholder={modalType === 'link' ? '请输入链接 URL，如 https://example.com' : '请输入图片 URL，如 https://example.com/pic.jpg'}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                padding: '0.6rem 0.8rem',
                color: '#f8fafc',
                fontSize: '0.88rem',
                outline: 'none',
                marginBottom: '1.2rem',
              }}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  document.getElementById('editor-modal-confirm-btn')?.click();
                } else if (e.key === 'Escape') {
                  setModalType(null);
                }
              }}
            />
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setModalType(null); setModalValue(''); }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8',
                  borderRadius: '6px',
                  padding: '0.4rem 1rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                id="editor-modal-confirm-btn"
                type="button"
                onClick={() => {
                  if (modalValue.trim()) {
                    if (modalType === 'link') {
                      executeCommand('createLink', modalValue.trim());
                    } else {
                      insertHTMLAtCursor(`<img src="${modalValue.trim()}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" alt="network image" />`);
                    }
                  }
                  setModalType(null);
                  setModalValue('');
                }}
                style={{
                  background: '#3b82f6',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '0.4rem 1rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden input to pass data in forms */}
      <input type="hidden" name={name} value={html} />

      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.4rem',
        padding: '0.6rem',
        background: '#0e1017',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        alignItems: 'center',
      }}>
        {[
          { icon: 'B', title: '加粗', command: 'bold' },
          { icon: 'I', title: '斜体', command: 'italic', style: { fontStyle: 'italic' } },
          { icon: 'U', title: '下划线', command: 'underline', style: { textDecoration: 'underline' } },
          { icon: 'S', title: '删除线', command: 'strikeThrough', style: { textDecoration: 'line-through' } },
        ].map(btn => (
          <button
            key={btn.command}
            type="button"
            title={btn.title}
            onClick={() => executeCommand(btn.command)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '4px',
              color: '#f8fafc',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              fontWeight: btn.command === 'bold' ? 'bold' : 'normal',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
              ...btn.style
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            {btn.icon}
          </button>
        ))}

        <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)', margin: '0 0.2rem' }} />

        {/* Font size */}
        <select
          title="字号"
          onChange={(e) => executeCommand('fontSize', e.target.value)}
          defaultValue="3"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '4px',
            color: '#f8fafc',
            height: '28px',
            padding: '0 4px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="1">小号</option>
          <option value="3">中号</option>
          <option value="5">大号</option>
          <option value="7">超大</option>
        </select>

        {/* Text Color */}
        <input
          type="color"
          title="字体颜色"
          onChange={(e) => executeCommand('foreColor', e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            width: '28px',
            height: '28px',
            padding: 0,
            cursor: 'pointer',
            borderRadius: '4px',
            outline: 'none'
          }}
        />

        <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)', margin: '0 0.2rem' }} />

        {/* Alignments */}
        {[
          { icon: '⬅️', title: '左对齐', command: 'justifyLeft' },
          { icon: '➡️', title: '右对齐', command: 'justifyRight' },
          { icon: '↔️', title: '居中对齐', command: 'justifyCenter' },
        ].map(btn => (
          <button
            key={btn.command}
            type="button"
            title={btn.title}
            onClick={() => executeCommand(btn.command)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '4px',
              color: '#f8fafc',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            {btn.icon}
          </button>
        ))}

        <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)', margin: '0 0.2rem' }} />

        {/* Lists & Link & Media */}
        {[
          { icon: '• List', title: '无序列表', command: 'insertUnorderedList' },
          { icon: '1. List', title: '有序列表', command: 'insertOrderedList' },
        ].map(btn => (
          <button
            key={btn.command}
            type="button"
            title={btn.title}
            onClick={() => executeCommand(btn.command)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '4px',
              color: '#f8fafc',
              padding: '0 6px',
              height: '28px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            {btn.icon}
          </button>
        ))}

        <button
          type="button"
          title="插入链接"
          onClick={insertLink}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '4px',
            color: '#f8fafc',
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
        >
          🔗
        </button>

        <button
          type="button"
          title="插入图片链接"
          onClick={insertImageByUrl}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '4px',
            color: '#f8fafc',
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
        >
          🌐🖼️
        </button>
        <button
          type="button"
          title="上传本地图片"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          style={{
            background: isUploading ? 'rgba(255,255,255,0.05)' : 'rgba(59,130,246,0.15)',
            border: isUploading ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(59,130,246,0.3)',
            borderRadius: '4px',
            color: isUploading ? '#94a3b8' : '#60a5fa',
            padding: '0 8px',
            height: '28px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            transition: 'background 0.2s',
          }}
          onMouseOver={e => !isUploading && (e.currentTarget.style.background = 'rgba(59,130,246,0.25)')}
          onMouseOut={e => !isUploading && (e.currentTarget.style.background = 'rgba(59,130,246,0.15)')}
        >
          {isUploading ? '⌛ 上传中...' : '📤 本地图片'}
        </button>
      </div>

      {/* Editor Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        placeholder={placeholder}
        style={{
          minHeight: '220px',
          maxHeight: '450px',
          overflowY: 'auto',
          padding: '1rem',
          outline: 'none',
          color: '#f8fafc',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          textAlign: 'left',
          fontFamily: 'inherit',
          backgroundColor: '#0a0b10',
        }}
      />

      {imagesInContent.length > 0 && (
        <div style={{
          padding: '1.2rem',
          background: '#0d0f16',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>🖼️ 文中已插入的图片（点击可直接设为封面）:</span>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            {imagesInContent.map((src, idx) => {
              const isSelected = selectedCover === src;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectCover(src)}
                  style={{
                    position: 'relative',
                    width: '80px',
                    height: '60px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: isSelected ? '2px solid #3b82f6' : '2px solid rgba(255,255,255,0.1)',
                    boxShadow: isSelected ? '0 0 10px rgba(59,130,246,0.5)' : 'none',
                    transition: 'all 0.2s',
                  }}
                  title={idx === 0 ? "第一张图片 (默认封面)" : `图片 ${idx + 1}`}
                >
                  <img src={src} alt={`thumbnail ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {idx === 0 && (
                    <span style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      background: '#10b981',
                      color: '#fff',
                      fontSize: '0.6rem',
                      padding: '1px 4px',
                      borderBottomRightRadius: '4px',
                      fontWeight: 600,
                    }}>
                      首图
                    </span>
                  )}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      background: '#3b82f6',
                      color: '#fff',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                    }}>
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
