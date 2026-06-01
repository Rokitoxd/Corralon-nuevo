import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const name = formData.get('name') || 'cliente';

    if (!file) {
      return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const filenameWithTimestamp = `${timestamp}_${safeName}.${ext}`;

    // Check if we should use Vercel Blob or fallback to local disk storage
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blobFilename = `planillas/${filenameWithTimestamp}`;
      // Upload to Vercel Blob
      const blob = await put(blobFilename, buffer, {
        access: 'public',
        contentType: file.type || 'application/octet-stream',
      });
      return NextResponse.json({ success: true, url: blob.url, fileName: file.name });
    } else {
      // Fallback: Save file to local directory 'pedidos_recibidos'
      const dir = path.join(process.cwd(), 'pedidos_recibidos');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const filePath = path.join(dir, filenameWithTimestamp);
      await fs.promises.writeFile(filePath, buffer);

      // Construct a full absolute URL based on the request host (e.g., http://192.168.0.154:3000)
      const requestUrl = new URL(request.url);
      const localUrl = `${requestUrl.origin}/api/download?file=${filenameWithTimestamp}`;

      console.log('Saved file locally (fallback):', filePath);
      console.log('Local fallback URL:', localUrl);

      return NextResponse.json({ success: true, url: localUrl, fileName: file.name });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 });
  }
}

