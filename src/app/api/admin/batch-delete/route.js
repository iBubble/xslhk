import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '../../../../lib/prisma';
import { revalidatePath } from 'next/cache';

const MODEL_PATHS = {
  news:                ['/admin/news', '/news', '/'],
  courseItem:          ['/admin/courses', '/courses'],
  showcaseItem:        ['/admin/showcase', '/showcase'],
  cooperationProject:  ['/admin/cooperation', '/cooperation'],
  heroSlide:           ['/admin/hero', '/'],
  contactRequest:      ['/admin/contacts'],
};

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: '未授权' }, { status: 401 });

  try {
    const { model, ids } = await request.json();

    if (!model || !MODEL_PATHS[model]) {
      return NextResponse.json({ success: false, message: '无效的数据模型' }, { status: 400 });
    }
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: '未选择任何条目' }, { status: 400 });
    }

    const intIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));

    await prisma[model].deleteMany({ where: { id: { in: intIds } } });

    MODEL_PATHS[model].forEach(p => revalidatePath(p));

    return NextResponse.json({ success: true, deleted: intIds.length });
  } catch (error) {
    console.error('批量删除操作失败:', error);
    return NextResponse.json({ success: false, message: '操作失败，服务端内部错误' }, { status: 500 });
  }
}
