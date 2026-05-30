import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(req) {
  try {
    // 1. 权限校验：仅允许登录管理员上传文件
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权，请先登录后台' }, { status: 401 });
    }

    // 2. 解析 FormData
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: '未接收到上传的文件' }, { status: 400 });
    }

    // 3. 校验文件大小（限制 5MB，防范 DoS 攻击）
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: '文件过大，单张图片不能超过 5MB' }, { status: 400 });
    }

    // 4. 校验文件类型 (MIME type)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: '不支持的文件类型，仅允许上传图片（JPG, PNG, GIF, WEBP）' }, { status: 400 });
    }

    // 5. 校验文件后缀名
    const origFilename = file.name || 'image.png';
    const ext = path.extname(origFilename).toLowerCase().replace('.', '');
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json({ error: '不支持的文件后缀名，仅允许上传图片（JPG, PNG, GIF, WEBP）' }, { status: 400 });
    }

    // 6. 生成不可预测的唯一安全文件名（CWE-434/CWE-22）
    const uuid = crypto.randomUUID();
    const safeFilename = `${uuid}.${ext}`;

    // 7. 写入物理磁盘
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 确定上传目录：public/uploads/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // 确保上传目录安全存在
    await mkdir(uploadDir, { recursive: true });

    // 拼装绝对物理路径并写入
    const absolutePath = path.join(uploadDir, safeFilename);
    await writeFile(absolutePath, buffer);

    // 8. 返回安全的相对 URL，用于前端访问
    const fileUrl = `/uploads/${safeFilename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
    });
  } catch (error) {
    console.error('上传图片后端处理失败:', error);
    return NextResponse.json({ error: '服务器内部错误，文件上传失败' }, { status: 500 });
  }
}
