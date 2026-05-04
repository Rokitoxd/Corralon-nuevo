import os
import pandas as pd

def procesar_categorias():
    base_path = "/Users/roccomarcantonio/Desktop/rocco/La rural/Corralon-nuevo/Pagina 2"
    main_csv_path = "articulos_stock_proveedores.csv"
    main_xlsx_path = "articulos_stock_proveedores.xlsx"

    # 1. Leer archivos de "Pagina 2"
    dfs_pagina2 = []
    
    cat_map = {
        'PINTURA': '🎨 Pintura',
        'FERRETERIA': '🛠️ Ferretería',
        'ELECTRICIDAD': '⚡ Electricidad',
        'PLOMERIA': '💧 Plomería',
        'MAT. CONTRUCCION': '🧱 Materiales de Construcción',
        'HIERROS Y CHAPAS': '⚙️ Hierros y Chapas',
        'OFERTA': '🔥 Ofertas'
    }

    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.endswith((".xls", ".xlsx", ".csv")):
                full_path = os.path.join(root, file)
                
                # Nombres de carpetas
                cat_folder = os.path.basename(os.path.dirname(root))
                subcat_folder = os.path.basename(root)
                
                if cat_folder == "Pagina 2":
                    continue # Archivo suelto en raíz
                
                # Mapeo de nombre
                categoria_web = cat_map.get(cat_folder.upper(), f"📦 {cat_folder.title()}")
                subcategoria_web = subcat_folder.title()
                
                try:
                    if file.endswith(".csv"):
                        df = pd.read_csv(full_path)
                    else:
                        df = pd.read_excel(full_path)
                    
                    df["CATEGORIA_WEB"] = categoria_web
                    df["SUBCATEGORIA_WEB"] = subcategoria_web
                    dfs_pagina2.append(df)
                except Exception as e:
                    print(f"Error procesando {file}: {e}")

    if not dfs_pagina2:
        print("No se encontraron archivos en 'Pagina 2'.")
        return

    df_pag2 = pd.concat(dfs_pagina2, ignore_index=True)
    
    # 2. Leer base maestra
    if os.path.exists(main_csv_path):
        print(f"Leyendo base maestra: {main_csv_path}")
        df_main = pd.read_csv(main_csv_path)
    else:
        print("No se encontró base maestra. Se creará una nueva.")
        df_main = pd.DataFrame()

    # Asegurarnos de que el ID es numérico
    if "ID" in df_pag2.columns:
        df_pag2["ID"] = pd.to_numeric(df_pag2["ID"], errors="coerce").astype("Int64")
    if "ID" in df_main.columns:
        df_main["ID"] = pd.to_numeric(df_main["ID"], errors="coerce").astype("Int64")

    # Mapeo de Categorías basado en ID
    df_pag2_valid_ids = df_pag2.dropna(subset=["ID"]).drop_duplicates(subset=["ID"], keep="last")
    cat_mapping = dict(zip(df_pag2_valid_ids["ID"], df_pag2_valid_ids["CATEGORIA_WEB"]))
    subcat_mapping = dict(zip(df_pag2_valid_ids["ID"], df_pag2_valid_ids["SUBCATEGORIA_WEB"]))

    # Actualizar df_main
    if not df_main.empty and "ID" in df_main.columns:
        df_main["CATEGORIA_WEB"] = df_main["ID"].map(cat_mapping)
        df_main["SUBCATEGORIA_WEB"] = df_main["ID"].map(subcat_mapping)
        
        # Identificar nuevos registros de Pagina 2 que no están en df_main
        main_ids = set(df_main["ID"].dropna())
        pag2_new = df_pag2_valid_ids[~df_pag2_valid_ids["ID"].isin(main_ids)]
        
        if not pag2_new.empty:
            print(f"Agregando {len(pag2_new)} nuevos registros desde Pagina 2.")
            df_main = pd.concat([df_main, pag2_new], ignore_index=True)
    else:
        # Si df_main estaba vacío, usamos df_pag2 entero
        df_main = df_pag2

    # Llenar vacíos
    df_main["CATEGORIA_WEB"] = df_main["CATEGORIA_WEB"].fillna("📦 General / Otros")
    df_main["SUBCATEGORIA_WEB"] = df_main["SUBCATEGORIA_WEB"].fillna("Otros")

    # Guardar
    try:
        df_main.to_csv(main_csv_path, index=False)
        print(f"Datos exportados a {main_csv_path}")
    except Exception as e:
        print(f"Error guardando CSV: {e}")
        
    try:
        df_main.to_excel(main_xlsx_path, index=False, engine='openpyxl')
        print(f"Datos exportados a {main_xlsx_path}")
    except Exception as e:
        print(f"Error guardando XLSX: {e}")

if __name__ == "__main__":
    procesar_categorias()
