import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');

    if (!filename) {
      return new NextResponse('Filename is required', { status: 400 });
    }

    // Prevent directory traversal attacks
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'pedidos_recibidos', safeFilename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    let contentType = 'application/octet-stream';
    if (safeFilename.endsWith('.pdf')) contentType = 'application/pdf';
    else if (safeFilename.endsWith('.png')) contentType = 'image/png';
    else if (safeFilename.endsWith('.jpg') || safeFilename.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (safeFilename.endsWith('.xlsx')) contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    else if (safeFilename.endsWith('.xls')) contentType = 'application/vnd.ms-excel';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${safeFilename}"`
      }
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
