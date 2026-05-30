import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { filename } = resolvedParams;

    if (!filename) {
      return new Response('Not Found', { status: 404 });
    }

    // 防范目录穿越漏洞 (CWE-22 Security Check)
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'uploads', sanitizedFilename);

    if (!fs.existsSync(filePath)) {
      return new Response('Not Found', { status: 404 });
    }

    // 检测并设置正确的 Content-Type
    const ext = path.extname(sanitizedFilename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    const fileBuffer = fs.readFileSync(filePath);
    
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        // 设置 7 天的静态强缓存，提升首屏加载速度
        'Cache-Control': 'public, max-age=604800, no-transform',
      },
    });
  } catch (error) {
    console.error('动态读取图片失败:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
