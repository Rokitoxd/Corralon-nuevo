import pandas as pd
from fpdf import FPDF
import datetime
import os
import sys

def leer_datos():
    filename_csv = 'articulos.xls - Sheet 1.csv'
    filename_xls = 'articulos.xls'
    
    if os.path.exists(filename_csv):
        print(f"Leyendo {filename_csv}...")
        try:
            return pd.read_csv(filename_csv)
        except Exception as e:
            print("Error leyendo csv:", e)
            
    if os.path.exists(filename_xls):
        print(f"Leyendo {filename_xls}...")
        try:
            return pd.read_excel(filename_xls)
        except Exception as e1:
            try:
                # Some systems export HTML as .xls
                return pd.read_html(filename_xls, decimal=',', thousands='.')[0]
            except Exception as e2:
                try:
                    return pd.read_csv(filename_xls, delimiter='\t')
                except Exception as e3:
                    print(f"No se pudo leer {filename_xls}.")
                    print(e1, e2, e3)
                    
    print("No se encontró el archivo de datos.")
    sys.exit(1)

def format_price(val):
    try:
        if pd.isna(val):
            return ""
        val = float(val)
        return f"${val:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    except:
        return str(val)

def main():
    df = leer_datos()
    
    print("Columnas encontradas:", df.columns.tolist())
    
    # Normalizar nombres de columnas por si tienen espacios extras
    df.columns = df.columns.astype(str).str.strip()
    
    # 1. Filtrado de datos
    if 'ARTICULO' not in df.columns:
        print("Error: Columna ARTICULO no encontrada.")
        sys.exit(1)
        
    keywords_incluir = ['CEMENTO', 'CAL ', 'ARENA', 'HIERRO', 'LADRILLO', 'MALLA', 'BLOCK', 'PEGAMENTO']
    keywords_excluir = ['ALQUILER', 'ALQ.', 'MANO DE OBRA', 'FLETE']
    
    # Filter for inclusion
    pattern_incluir = '|'.join(keywords_incluir)
    df_filtered = df[df['ARTICULO'].astype(str).str.contains(pattern_incluir, case=False, na=False)]
    
    # Filter for exclusion
    pattern_excluir = '|'.join(keywords_excluir)
    df_filtered = df_filtered[~df_filtered['ARTICULO'].astype(str).str.contains(pattern_excluir, case=False, na=False)]
    
    # Columnas de precio
    col_venta1 = '$ VENTA1' if '$ VENTA1' in df_filtered.columns else ('$ VENTA 1' if '$ VENTA 1' in df_filtered.columns else None)
    col_venta2 = '$ VENTA 2' if '$ VENTA 2' in df_filtered.columns else ('$ VENTA2' if '$ VENTA2' in df_filtered.columns else None)
    
    if not col_venta1 or not col_venta2:
        print("Buscando columnas de venta por aproximación...")
        for col in df_filtered.columns:
            if 'VENTA' in col.upper():
                print("Columna candidata:", col)
                if '1' in col:
                    col_venta1 = col
                elif '2' in col:
                    col_venta2 = col
    
    if not col_venta1 or not col_venta2:
        print(f"Error: No se encontraron las columnas de precios. Columnas: {df_filtered.columns.tolist()}")
        # Asignar a mano para no romper si tienen otros nombres pero es obvio
        ventas = [col for col in df_filtered.columns if 'VENTA' in str(col).upper() or 'PRECIO' in str(col).upper()]
        if len(ventas) >= 2:
            col_venta1, col_venta2 = ventas[0], ventas[1]
        else:
            sys.exit(1)
            
    # Remove null prices
    df_filtered = df_filtered.dropna(subset=[col_venta1, col_venta2])
    
    # Convert prices to numeric, coerce errors, drop rows with 0
    df_filtered[col_venta1] = pd.to_numeric(df_filtered[col_venta1], errors='coerce')
    df_filtered[col_venta2] = pd.to_numeric(df_filtered[col_venta2], errors='coerce')
    
    df_filtered = df_filtered[(df_filtered[col_venta1] > 0) & (df_filtered[col_venta2] > 0)]
    
    # Keep columns and rename
    df_final = df_filtered[['ARTICULO', col_venta1, col_venta2]].copy()
    df_final.columns = ['Descripción', 'Precio Contado', 'Precio Lista']
    
    # Sort
    df_final = df_final.sort_values(by='Descripción')
    
    print(f"Artículos procesados: {len(df_final)}")
    
    # 2. Generación PDF
    class PDF(FPDF):
        def header(self):
            self.set_font("Arial", "B", 16)
            self.cell(0, 10, "Lista de Precios Rápidos - Corralón", ln=True, align="C")
            self.set_font("Arial", "I", 12)
            today = datetime.datetime.now().strftime("%d/%m/%Y")
            self.cell(0, 10, f"Actualizado al: {today}", ln=True, align="C")
            self.ln(5)
            
            # Table Header
            self.set_font("Arial", "B", 10)
            self.cell(110, 8, "Descripción".encode('latin-1', 'replace').decode('latin-1'), border=1)
            self.cell(40, 8, "Precio Contado", border=1, align="C")
            self.cell(40, 8, "Precio Lista", border=1, align="C")
            self.ln()

    pdf = PDF()
    pdf.add_page()
    pdf.set_font("Arial", size=9)
    
    for i, row in df_final.iterrows():
        desc = str(row['Descripción'])
        # Truncar descripción si es muy larga
        if len(desc) > 65:
            desc = desc[:62] + "..."
        desc = desc.encode('latin-1', 'replace').decode('latin-1')
        p_contado = format_price(row['Precio Contado'])
        p_lista = format_price(row['Precio Lista'])
        
        pdf.cell(110, 8, desc, border=1)
        pdf.cell(40, 8, p_contado, border=1, align="R")
        pdf.cell(40, 8, p_lista, border=1, align="R")
        pdf.ln()
        
    pdf_filename = "Catalogo_WhatsApp.pdf"
    pdf.output(pdf_filename)
    print(f"PDF generado exitosamente en {pdf_filename}")

if __name__ == "__main__":
    main()
