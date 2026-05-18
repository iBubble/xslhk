'use client';

import { useState } from 'react';

const COLLECT_SCRIPT = `(async function(){
  const t = new URLSearchParams(location.search).get('token');
  if(!t){alert('请先在发表记录页面运行！');return;}
  const arts=[];let off=0,tot=Infinity;
  while(off<tot){
    const r=await fetch('/cgi-bin/appmsgpublish?sub=list&action=list_ex&begin='+off+'&count=10&token='+t+'&lang=zh_CN&f=json',{credentials:'include'});
    const d=await r.json();
    const pg=d.publish_page;if(!pg)break;
    tot=pg.total_count||0;
    const items=pg.publish_info||[];if(!items.length)break;
    for(const it of items){for(const n of(it.appmsgex||[])){if(n.title&&n.link)arts.push({title:n.title,digest:n.digest||'',url:n.link,thumb_url:n.cover||'',publish_time:String(it.publish_time||'')});}}
    off+=items.length;
    await new Promise(r=>setTimeout(r,400));
  }
  const json=JSON.stringify({articles:arts},null,2);
  await navigator.clipboard.writeText(json).catch(()=>{});
  console.log('共收集'+arts.length+'篇，JSON已复制到剪贴板：');
  console.log(json);
  alert('完成！共收集'+arts.length+'篇文章。\\nJSON数据已复制到剪贴板，请粘贴到导入工具页面。');
})();`;

export default function WeChatBatchImport() {
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopyScript = async () => {
    await navigator.clipboard.writeText(COLLECT_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = async () => {
    if (!jsonText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      let parsed;
      try {
        parsed = JSON.parse(jsonText.trim());
      } catch {
        setResult({ type: 'error', message: 'JSON 格式有误，请重新复制脚本输出的内容。' });
        return;
      }
      const articles = Array.isArray(parsed) ? parsed : (parsed.articles || []);
      const res = await fetch('/api/wechat/batch-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles }),
      });
      const data = await res.json();
      setResult({ type: data.success ? 'success' : 'error', message: data.message });
      if (data.success) setJsonText('');
    } catch (e) {
      setResult({ type: 'error', message: '请求失败：' + e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '860px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.4rem', color: '#f8fafc' }}>
        微信历史文章批量导入
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '2rem' }}>
        将微信公众号"发表记录"中的历史文章一次性批量导入至公司动态
      </p>

      {/* Step 1 */}
      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.8rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
          <span style={{ background: '#3b82f6', color: '#fff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0 }}>1</span>
          <h2 style={{ margin: 0, fontSize: '1rem', color: '#e2e8f0', fontWeight: 600 }}>登录微信公众号后台，打开"发表记录"页面</h2>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.7, margin: 0 }}>
          浏览器打开 <code style={{ color: '#60a5fa', background: 'rgba(59,130,246,0.1)', padding: '1px 6px', borderRadius: '4px' }}>mp.weixin.qq.com</code>，
          进入 <strong style={{ color: '#94a3b8' }}>内容与互动 → 文章 → 发表记录</strong>，确保页面已完整加载。
        </p>
      </div>

      {/* Step 2 */}
      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.8rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
          <span style={{ background: '#3b82f6', color: '#fff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0 }}>2</span>
          <h2 style={{ margin: 0, fontSize: '1rem', color: '#e2e8f0', fontWeight: 600 }}>复制下方采集脚本，在微信后台浏览器控制台中运行</h2>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.84rem', marginBottom: '1rem' }}>
          在发表记录页面按 <kbd style={{ background: '#1e293b', border: '1px solid #334155', padding: '2px 7px', borderRadius: '4px', color: '#94a3b8', fontSize: '0.82rem' }}>F12</kbd>，
          切换到 <strong style={{ color: '#94a3b8' }}>Console</strong> 标签，粘贴以下脚本并按回车。脚本会自动收集全部文章并复制到剪贴板。
        </p>
        <div style={{ position: 'relative' }}>
          <pre style={{ background: '#060910', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '1rem', fontSize: '0.75rem', color: '#6ee7b7', overflowX: 'auto', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {COLLECT_SCRIPT}
          </pre>
          <button
            onClick={handleCopyScript}
            style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.15)', border: copied ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(59,130,246,0.3)', color: copied ? '#34d399' : '#60a5fa', padding: '4px 12px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {copied ? '✅ 已复制' : '📋 复制脚本'}
          </button>
        </div>
      </div>

      {/* Step 3 */}
      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.8rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
          <span style={{ background: '#3b82f6', color: '#fff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0 }}>3</span>
          <h2 style={{ margin: 0, fontSize: '1rem', color: '#e2e8f0', fontWeight: 600 }}>粘贴采集结果，点击导入</h2>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.84rem', marginBottom: '1rem' }}>
          脚本运行完成后，JSON 数据已自动复制到剪贴板。在下方文本框内按 <kbd style={{ background: '#1e293b', border: '1px solid #334155', padding: '2px 7px', borderRadius: '4px', color: '#94a3b8', fontSize: '0.82rem' }}>Ctrl+V</kbd> 粘贴，然后点击"开始导入"按钮。
        </p>

        {result && (
          <div style={{
            background: result.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${result.type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            borderRadius: '8px', padding: '0.9rem 1.1rem', marginBottom: '1rem',
            color: result.type === 'success' ? '#34d399' : '#f87171',
            fontSize: '0.88rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
          }}>
            <span>{result.type === 'success' ? '✅' : '❌'}</span>
            <span>{result.message}</span>
          </div>
        )}

        <textarea
          value={jsonText}
          onChange={e => setJsonText(e.target.value)}
          placeholder={'在此粘贴脚本输出的 JSON 数据...\n\n格式示例：\n{\n  "articles": [\n    { "title": "文章标题", "url": "https://mp.weixin.qq.com/s/xxx", ... }\n  ]\n}'}
          style={{
            width: '100%', minHeight: '200px', background: '#060910', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '8px', padding: '0.9rem', color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.6,
            fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box', outline: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
          <button
            onClick={handleImport}
            disabled={loading || !jsonText.trim()}
            style={{
              background: loading || !jsonText.trim() ? '#1e293b' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: loading || !jsonText.trim() ? '#475569' : '#fff',
              border: 'none', padding: '0.65rem 2rem', borderRadius: '8px',
              fontSize: '0.9rem', fontWeight: 600, cursor: loading || !jsonText.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '⏳ 正在导入...' : '🚀 开始导入'}
          </button>
          {jsonText && (
            <button onClick={() => { setJsonText(''); setResult(null); }}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', padding: '0.65rem 1.2rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
              清空
            </button>
          )}
          {result?.type === 'success' && (
            <a href="/admin/news" style={{ color: '#60a5fa', fontSize: '0.85rem', textDecoration: 'none' }}>
              → 查看已导入的动态
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
