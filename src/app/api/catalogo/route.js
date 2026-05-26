import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const basePath = process.cwd();
    
    // Check for excel files
    const xlsxPath = path.join(basePath, 'articulos_stock_proveedores.xlsx');
    const csvPath = path.join(basePath, 'articulos_stock_proveedores.csv');
    
    let workbook;
    if (fs.existsSync(xlsxPath)) {
      const fileBuffer = fs.readFileSync(xlsxPath);
      workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    } else if (fs.existsSync(csvPath)) {
      const fileBuffer = fs.readFileSync(csvPath);
      workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    } else {
      return NextResponse.json({ error: 'Data file not found' }, { status: 404 });
    }
    
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(sheet);
    
    // Clean and transform data
    const cleanedData = rawData
      .map(row => {
        // Find stock column
        let stockVal = 0;
        for (const key of Object.keys(row)) {
          if (key.toUpperCase().includes('STOCK') || key.toUpperCase().includes('CANT')) {
            stockVal = parseFloat(row[key]) || 0;
            break;
          }
        }
        
        let art = String(row['ARTICULO'] || '').trim();
        if (!art || art === 'nan' || !isNaN(art)) return null;
        
        // Title case and clean units
        art = art.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        art = art.replace(/\sX\s/gi, ' x ')
                 .replace(/\sKg\b/gi, ' kg')
                 .replace(/\sMm\b/gi, ' mm')
                 .replace(/\sCm\b/gi, ' cm')
                 .replace(/\sMts\b|\sMt\b/gi, ' m')
                 .replace(/\sLts\b|\sLt\b/gi, ' L')
                 .replace(/\bPvc\b/gi, ' PVC')
                 .replace(/\bMdf\b/gi, ' MDF');
                 
        return {
          ARTICULO: art,
          ITEM: row['ITEM'] || '',
          CATEGORIA_WEB: row['CATEGORIA_WEB'] || '📦 General / Otros',
          SUBCATEGORIA_WEB: row['SUBCATEGORIA_WEB'] || 'Otros',
          STOCK: stockVal
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.ARTICULO.localeCompare(b.ARTICULO));

    return NextResponse.json(cleanedData);
  } catch (error) {
    console.error('Error fetching catalogue:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
