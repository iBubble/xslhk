import prisma from '../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, phone, email = '', type = '其他', message = '' } = body;
    if (!name || !phone) {
      return NextResponse.json({ error: '姓名和电话为必填项' }, { status: 400 });
    }
    const record = await prisma.contactRequest.create({
      data: { name, phone, email, type, message },
    });
    return NextResponse.json({ ok: true, id: record.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
