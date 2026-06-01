import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

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
    const blobFilename = `planillas/${timestamp}_${safeName}.${ext}`;

    // Upload to Vercel Blob (requires BLOB_READ_WRITE_TOKEN env var on Vercel)
    const blob = await put(blobFilename, buffer, {
      access: 'public',
      contentType: file.type || 'application/octet-stream',
    });

    return NextResponse.json({ success: true, url: blob.url, fileName: file.name });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 });
  }
}
