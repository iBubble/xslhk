import prisma from '../../../lib/prisma';
import { NextResponse } from 'next/server';

// 简单内存速率限制（防止灌水垃圾数据）
const ipCache = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 分钟
const MAX_REQUESTS = 3; // 每分钟每个 IP 最多 3 次

function checkRateLimit(ip) {
  const now = Date.now();
  if (!ipCache.has(ip)) {
    ipCache.set(ip, [now]);
    return false;
  }
  const timestamps = ipCache.get(ip).filter(t => now - t < RATE_LIMIT_WINDOW);
  if (timestamps.length >= MAX_REQUESTS) {
    return true;
  }
  timestamps.push(now);
  ipCache.set(ip, timestamps);
  return false;
}

export async function POST(req) {
  try {
    // 1. 速率限制检查
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
               req.headers.get('x-real-ip')?.trim() || 
               '127.0.0.1';
               
    if (checkRateLimit(ip)) {
      return NextResponse.json({ error: '提交过于频繁，请 1 分钟后再试' }, { status: 429 });
    }

    const body = await req.json();
    const { name, phone, email = '', type = '其他', message = '' } = body;

    // 2. 强输入验证 (CWE-20)
    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 50) {
      return NextResponse.json({ error: '无效姓名，且长度不能超过 50 个字符' }, { status: 400 });
    }

    const trimmedPhone = (phone || '').toString().trim();
    const phoneRegex = /^1[3-9]\d{9}$|^(\d{3,4}-)?\d{7,8}$/;
    if (!trimmedPhone || !phoneRegex.test(trimmedPhone) || trimmedPhone.length > 20) {
      return NextResponse.json({ error: '电话格式不正确，请输入正确的手机号码或固定电话' }, { status: 400 });
    }

    if (email && email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim()) || email.trim().length > 100) {
        return NextResponse.json({ error: '电子邮箱格式不正确且不能超过 100 字符' }, { status: 400 });
      }
    }

    if (type && (typeof type !== 'string' || type.trim().length > 50)) {
      return NextResponse.json({ error: '无效的咨询类型' }, { status: 400 });
    }

    if (message && (typeof message !== 'string' || message.trim().length > 1000)) {
      return NextResponse.json({ error: '留言字数不能超过 1000 字' }, { status: 400 });
    }

    // 3. 数据存库
    const record = await prisma.contactRequest.create({
      data: { 
        name: name.trim(), 
        phone: trimmedPhone, 
        email: (email || '').trim(), 
        type: (type || '其他').trim(), 
        message: (message || '').trim() 
      },
    });

    return NextResponse.json({ ok: true, id: record.id });
  } catch (err) {
    console.error('保存联系人咨询工单失败:', err);
    return NextResponse.json({ error: '服务端内部错误，操作失败' }, { status: 500 });
  }
}
