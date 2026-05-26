import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const name = formData.get('name');
    const phone = formData.get('phone');

    if (!file || !name || !phone) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${safeName}_${file.name}`;
    
    const uploadDir = path.join(process.cwd(), 'pedidos_recibidos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, fileName });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
  }
}
