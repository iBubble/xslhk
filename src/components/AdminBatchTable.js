'use client';

import { useState, useCallback } from 'react';

/**
 * 通用后台列表表格，支持全选 + 批量删除 + 单条删除
 *
 * Props:
 *   model        - Prisma 模型名，如 'news' | 'courseItem' | ...
 *   items        - 数据数组（可序列化），每项必须含 id 字段
 *   fields       - 列配置数组，见下方类型说明
 *   deleteAction - Server Action，接受 FormData（含 id 字段）
 *   editBasePath - 编辑链接基础路径，如 '/admin/news'，?edit=id 自动拼接
 *   emptyText    - 空列表提示
 *
 * fields 字段类型：
 *   { key, label, type?, style?, maxWidth?, linkColor?, linkText? }
 *   type: 'text'(默认) | 'image' | 'link' | 'badge'
 */
export default function AdminBatchTable({
  model,
  items = [],
  fields = [],
  deleteAction,
  editBasePath,
  renderActions,
  emptyText = '暂无数据',
}) {
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const allIds = items.map(i => i.id);
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));

  const toggleAll = useCallback(() => {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }, [allSelected, JSON.stringify(allIds)]);

  const toggleOne = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleBatchDelete = async () => {
    if (!confirm) { setConfirm(true); return; }
    setDeleting(true);
    setConfirm(false);
    try {
      const res = await fetch('/api/admin/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, ids: Array.from(selected) }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(new Set());
        window.location.reload();
      } else {
        alert('批量删除失败：' + data.message);
      }
    } catch (e) {
      alert('请求失败：' + e.message);
    } finally {
      setDeleting(false);
    }
  };

  const renderCell = (item, field) => {
    const val = item[field.key];
    const cellStyle = {
      padding: '0.9rem 0.5rem',
      fontSize: '0.85rem',
      color: '#94a3b8',
      maxWidth: field.maxWidth || 'auto',
      overflow: field.maxWidth ? 'hidden' : 'visible',
      textOverflow: 'ellipsis',
      whiteSpace: field.maxWidth ? 'nowrap' : 'normal',
      ...(field.style || {}),
    };

    if (field.type === 'image') {
      return (
        <td key={field.key} style={{ padding: '0.9rem 0.5rem' }}>
          {val ? <img src={val} alt="thumb" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /> : <span style={{ color: '#475569', fontSize: '0.8rem' }}>-</span>}
        </td>
      );
    }

    if (field.type === 'link') {
      return (
        <td key={field.key} style={cellStyle}>
          {val ? (
            <a href={val} target="_blank" rel="noreferrer" style={{ color: field.linkColor || '#60a5fa', textDecoration: 'none', fontSize: '0.82rem' }}>
              {field.linkText || '查看'}
            </a>
          ) : <span style={{ color: '#475569' }}>-</span>}
        </td>
      );
    }

    if (field.type === 'badge') {
      return (
        <td key={field.key} style={{ padding: '0.9rem 0.5rem' }}>
          <span style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', padding: '2px 8px', borderRadius: '99px', fontSize: '0.78rem' }}>
            {val || '-'}
          </span>
        </td>
      );
    }

    // default: text
    return <td key={field.key} style={cellStyle}>{val ?? '-'}</td>;
  };

  return (
    <div>
      {/* 批量操作提示栏 */}
      {selected.size > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
          background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '8px', padding: '0.7rem 1.2rem', marginBottom: '1rem',
          animation: 'abFadeIn 0.2s ease',
        }}>
          <span style={{ color: '#60a5fa', fontSize: '0.88rem', fontWeight: 500 }}>
            已选 <strong>{selected.size}</strong> 项
          </span>
          <button onClick={() => { setSelected(new Set()); setConfirm(false); }}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.82rem' }}>
            取消选择
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {confirm && (
              <span style={{ color: '#fbbf24', fontSize: '0.82rem' }}>
                ⚠️ 即将永久删除 {selected.size} 条记录，确认吗？
              </span>
            )}
            <button onClick={handleBatchDelete} disabled={deleting}
              style={{
                background: confirm ? '#dc2626' : 'rgba(239,68,68,0.1)',
                color: confirm ? '#fff' : '#ef4444',
                border: confirm ? 'none' : '1px solid rgba(239,68,68,0.3)',
                padding: '0.45rem 1.1rem', borderRadius: '6px',
                fontSize: '0.84rem', fontWeight: 500,
                cursor: deleting ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              }}>
              {deleting ? '删除中...' : confirm ? '✅ 确认删除' : `🗑️ 批量删除 (${selected.size})`}
            </button>
            {confirm && (
              <button onClick={() => setConfirm(false)}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '0.45rem 0.9rem', borderRadius: '6px', fontSize: '0.84rem', cursor: 'pointer' }}>
                取消
              </button>
            )}
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <th style={{ padding: '0.8rem 0.5rem', width: '36px' }}>
              <input type="checkbox" checked={allSelected} onChange={toggleAll}
                title={allSelected ? '取消全选' : '全选'}
                style={{ cursor: 'pointer', accentColor: '#3b82f6', width: '15px', height: '15px' }} />
            </th>
            {fields.map(f => (
              <th key={f.key} style={{ padding: '0.8rem 0.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.83rem' }}>
                {f.label}
              </th>
            ))}
            <th style={{ padding: '0.8rem 0.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.83rem' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={fields.length + 2} style={{ padding: '2rem 0', textAlign: 'center', color: '#475569' }}>
                {emptyText}
              </td>
            </tr>
          )}
          {items.map(item => (
            <tr key={item.id} style={{
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              background: selected.has(item.id) ? 'rgba(59,130,246,0.05)' : 'transparent',
              transition: 'background 0.15s',
            }}>
              <td style={{ padding: '0.8rem 0.5rem' }}>
                <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleOne(item.id)}
                  style={{ cursor: 'pointer', accentColor: '#3b82f6', width: '15px', height: '15px' }} />
              </td>
              {fields.map(f => renderCell(item, f))}
              {/* 操作列 */}
              <td style={{ padding: '0.9rem 0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {renderActions ? renderActions(item) : (
                    <>
                      {editBasePath && (
                        <a href={`${editBasePath}?edit=${item.id}`} style={{
                          display: 'inline-block', background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
                          textDecoration: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 500,
                        }}>编辑</a>
                      )}
                      {deleteAction && (
                        <form action={deleteAction} style={{ display: 'inline' }}>
                          <input type="hidden" name="id" value={item.id} />
                          <button type="submit" style={{
                            background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none',
                            padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82rem',
                          }}>删除</button>
                        </form>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`
        @keyframes abFadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
