import os
import glob
import pandas as pd
import re

def generar_base():
    base_articulos = 'articulos.xls'
    base_stock = 'stock.xls'
    
    # 1. Leer archivos base
    try:
        print(f"Leyendo {base_articulos}...")
        df_articulos = pd.read_excel(base_articulos)
        print(f"Leyendo {base_stock}...")
        df_stock = pd.read_excel(base_stock)
    except FileNotFoundError as e:
        print(f"Error: No se encontró el archivo base {e.filename}")
        return
    except Exception as e:
        print(f"Error al leer archivos base: {e}")
        return
        
    # Encontrar nombre de columna ID en cada df (asumimos que existe)
    id_art_col = next((c for c in df_articulos.columns if c.upper() == 'ID'), 'ID')
    id_stock_col = next((c for c in df_stock.columns if c.upper() == 'ID'), 'ID')
    
    # 2. Convertir columnas ID a enteros usando Int64 (soporta NaN de Pandas)
    if id_art_col in df_articulos.columns:
        df_articulos['ID'] = pd.to_numeric(df_articulos[id_art_col], errors='coerce').astype('Int64')
    if id_stock_col in df_stock.columns:
        df_stock['ID'] = pd.to_numeric(df_stock[id_stock_col], errors='coerce').astype('Int64')
    
    # Únelos (merge) - Outer merge
    if 'ID' in df_articulos.columns and 'ID' in df_stock.columns:
        df_base = pd.merge(df_articulos, df_stock, on='ID', how='outer', suffixes=('', '_STOCK'))
    else:
        print("Advertencia: No se encontró columna ID para hacer merge.")
        df_base = pd.concat([df_articulos, df_stock])
    
    # 3. Buscar todos los demás archivos .xls (y .xlsx)
    excel_files = [f for f in glob.glob('*.xls*') if f not in [base_articulos, base_stock] and not f.startswith('articulos_stock_proveedores')]
    
    # Mapeos
    provider_mapping = {}
    nro_cliente_mapping = {}
    
    for f in excel_files:
        # 4. Limpia el nombre
        # Remover extensiones .xls o .xlsx
        clean_name = re.sub(r'\.xlsx?$', '', f).strip()
        
        # Usa regex para separar PROVEEDOR de NRO DE CLIENTE
        match = re.search(r'^(.*?)\s+(\d+)$', clean_name)
        if match:
            proveedor = match.group(1).strip()
            nro_cliente = match.group(2).strip()
        else:
            proveedor = clean_name
            nro_cliente = ""
            
        # 5. Lee los ID dentro de cada archivo de proveedor
        try:
            print(f"Procesando {f}...")
            df_prov = pd.read_excel(f)
            id_prov_col = next((c for c in df_prov.columns if c.upper() == 'ID'), 'ID')
            if id_prov_col in df_prov.columns:
                ids = pd.to_numeric(df_prov[id_prov_col], errors='coerce').dropna().astype('Int64').tolist()
                for i in ids:
                    provider_mapping[i] = proveedor
                    nro_cliente_mapping[i] = nro_cliente
        except Exception as e:
            print(f"Error procesando {f}: {e}")
            
    # Cruzar esa información con la tabla principal
    if 'ID' in df_base.columns:
        df_base['PROVEEDOR'] = df_base['ID'].map(provider_mapping).fillna('SIN ASIGNAR')
        df_base['NRO DE CLIENTE'] = df_base['ID'].map(nro_cliente_mapping).fillna('')
    else:
        df_base['PROVEEDOR'] = 'SIN ASIGNAR'
        df_base['NRO DE CLIENTE'] = ''
    
    # 6. Limpia un poco las columnas innecesarias
    cols_to_drop = [c for c in df_base.columns if c.endswith('_STOCK') or c.endswith('_y')]
    
    # Removemos originial columns from merge if ID was populated
    if 'ID' in df_base.columns:
        for c in [id_art_col, id_stock_col]:
            if c != 'ID' and c in df_base.columns:
                cols_to_drop.append(c)
                
    df_base.drop(columns=list(set(cols_to_drop)), inplace=True, errors='ignore')
    
    # Remove _x from remaining columns if they exist
    df_base.rename(columns=lambda x: x.replace('_x', '') if x.endswith('_x') else x, inplace=True)
    
    # 7. Exportar el resultado final a CSV y XLSX
    csv_out = 'articulos_stock_proveedores.csv'
    xlsx_out = 'articulos_stock_proveedores.xlsx'
    
    try:
        print("Exportando CSV...")
        df_base.to_csv(csv_out, index=False)
        print(f"Generado con éxito: {csv_out}")
    except Exception as e:
        print(f"Error al exportar CSV: {e}")
        
    try:
        print("Exportando XLSX...")
        # Usa pandas y openpyxl para exportar una copia llamada articulos_stock_proveedores.xlsx
        df_base.to_excel(xlsx_out, index=False, engine='openpyxl')
        print(f"Generado con éxito: {xlsx_out}")
    except Exception as e:
        print(f"Error al exportar XLSX: {e}. Asegúrese de tener 'openpyxl' installed.")

if __name__ == '__main__':
    print("Iniciando unificación de base de datos...")
    generar_base()
    print("Proceso finalizado.")
