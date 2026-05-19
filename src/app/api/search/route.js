import prisma from '../../../lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({
        courses: [],
        news: [],
        cooperation: [],
        showcase: []
      });
    }

    // Parallel fuzzy search across tables using contains
    const [courses, news, cooperation, showcase] = await Promise.all([
      prisma.courseItem.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { content: { contains: query } },
            { category: { contains: query } }
          ]
        },
        orderBy: { sortOrder: 'asc' },
        take: 10
      }).catch(() => []),
      
      prisma.news.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { excerpt: { contains: query } },
            { content: { contains: query } }
          ]
        },
        orderBy: { date: 'desc' },
        take: 10
      }).catch(() => []),

      prisma.cooperationProject.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { partner: { contains: query } },
            { description: { contains: query } },
            { content: { contains: query } }
          ]
        },
        orderBy: { sortOrder: 'asc' },
        take: 10
      }).catch(() => []),

      prisma.showcaseItem.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { category: { contains: query } },
            { content: { contains: query } }
          ]
        },
        orderBy: { sortOrder: 'asc' },
        take: 10
      }).catch(() => [])
    ]);

    return NextResponse.json({
      courses,
      news,
      cooperation,
      showcase
    });
  } catch (err) {
    console.error('Global search error:', err);
    return NextResponse.json({ error: '搜索内部错误' }, { status: 500 });
  }
}
