import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

// Server-side in-memory cache
let cachedData = null;
let cachedMtime = 0;

export async function GET() {
  try {
    const basePath = process.cwd();
    
    // Check for excel files
    const xlsxPath = path.join(basePath, 'articulos_stock_proveedores.xlsx');
    const csvPath = path.join(basePath, 'articulos_stock_proveedores.csv');
    
    let dataPath = null;
    if (fs.existsSync(xlsxPath)) {
      dataPath = xlsxPath;
    } else if (fs.existsSync(csvPath)) {
      dataPath = csvPath;
    } else {
      return NextResponse.json({ error: 'Data file not found' }, { status: 404 });
    }
    
    // Get file modification time for cache validation
    const stats = fs.statSync(dataPath);
    const mtime = stats.mtimeMs;
    
    // Return cached data if file hasn't changed
    if (cachedData && cachedMtime === mtime) {
      return NextResponse.json(cachedData);
    }
    
    // Read and parse file
    const fileBuffer = fs.readFileSync(dataPath);
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    
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
        
        // Filter out uncategorized items (General / Otros)
        const cat = row['CATEGORIA_WEB'] ? String(row['CATEGORIA_WEB']).trim() : '';
        if (!cat || cat === '📦 General / Otros' || cat.toLowerCase().includes('general') || cat.toLowerCase().includes('otros')) {
          return null;
        }
        
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
          CATEGORIA_WEB: cat,
          SUBCATEGORIA_WEB: row['SUBCATEGORIA_WEB'] || 'Otros',
          STOCK: stockVal
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.ARTICULO.localeCompare(b.ARTICULO));

    // Update cache
    cachedData = cleanedData;
    cachedMtime = mtime;

    return NextResponse.json(cleanedData);
  } catch (error) {
    console.error('Error fetching catalogue:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
