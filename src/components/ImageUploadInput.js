"use client";
import { useState, useRef, useEffect } from 'react';

export default function ImageUploadInput({ name, defaultValue = '', placeholder = '/img_news.png', required = false }) {
  const [value, setValue] = useState(defaultValue);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  // 监听初始默认值的变化以实现同步数据（比如管理员切换编辑项）
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  // 错误提示 5 秒后自动消失
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleInputChange = (e) => {
    setValue(e.target.value);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 前端基本类型校验
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setErrorMsg('仅支持上传 JPG, PNG, GIF, WEBP 图片格式');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setErrorMsg('上传图片不能超过 5MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '上传封面图片失败');
      }

      // 设置输入框的值
      setValue(data.url);
      
      // 主动分发 React/DOM input 事件，确保父组件 Form 能捕获更改
      setTimeout(() => {
        const imageInput = document.querySelector(`input[name="${name}"]`);
        if (imageInput) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          setter?.call(imageInput, data.url);
          imageInput.dispatchEvent(new Event('input', { bubbles: true }));
          imageInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 50);
    } catch (err) {
      console.error('上传封面图片失败:', err);
      setErrorMsg(err.message || '网络连接错误，上传失败');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        {/* 文本输入框：支持手动输入与自动回填路径 */}
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          className="admin-input"
          style={{ flex: 1 }}
        />

        {/* 上传图片触发按钮 */}
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: isUploading ? 'rgba(255,255,255,0.05)' : 'rgba(59,130,246,0.15)',
            border: isUploading ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(59,130,246,0.3)',
            borderRadius: '6px',
            color: isUploading ? '#94a3b8' : '#60a5fa',
            padding: '0 1rem',
            height: '38px', // 契合 admin-input input 的高度
            cursor: isUploading ? 'not-allowed' : 'pointer',
            fontSize: '0.82rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => !isUploading && (e.currentTarget.style.background = 'rgba(59,130,246,0.25)')}
          onMouseOut={e => !isUploading && (e.currentTarget.style.background = 'rgba(59,130,246,0.15)')}
        >
          {isUploading ? '⌛ 上传中...' : '📤 上传图片'}
        </button>

        {/* 隐藏的 File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>

      {/* 错误提示文字 */}
      {errorMsg && (
        <span style={{ color: '#ef4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
          ⚠️ {errorMsg}
        </span>
      )}

      {/* 选中/上传后的缩略图及清除控制 */}
      {value && value.startsWith('/') && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.2rem' }}>
          <div style={{
            width: '80px',
            height: '50px',
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.2)',
          }}>
            <img
              src={value}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
            已上传预览
          </span>
          <button
            type="button"
            onClick={() => {
              setValue('');
              setTimeout(() => {
                const imageInput = document.querySelector(`input[name="${name}"]`);
                if (imageInput) {
                  imageInput.value = '';
                  imageInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }, 0);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.75rem',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            清除图片
          </button>
        </div>
      )}
    </div>
  );
}
