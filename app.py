import streamlit as st
import pandas as pd
import os
import re

st.set_page_config(page_title="📦 Panel de Control: Artículos y Proveedores", layout="wide")

@st.cache_data
def load_data():
    folder_path = "."
    
    # Load Main Files
    df_articulos = pd.DataFrame()
    df_stock = pd.DataFrame()

    try:
        df_articulos = pd.read_csv("articulos.xls - Sheet 1.csv")
    except FileNotFoundError:
        try:
            df_articulos = pd.read_excel("articulos.xls")
        except Exception:
            pass

    try:
        df_stock = pd.read_csv("stock.xls - Sheet 1.csv")
    except FileNotFoundError:
        try:
            df_stock = pd.read_excel("stock.xls")
        except Exception:
            pass

    if df_articulos.empty or df_stock.empty:
        st.error("Error al cargar los archivos principales ('articulos' y 'stock').")
        return pd.DataFrame()

    # Data Processing: Drop null IDs and convert to int
    for df_temp in [df_articulos, df_stock]:
        if 'ID' in df_temp.columns:
            df_temp.dropna(subset=['ID'], inplace=True)
            df_temp['ID'] = pd.to_numeric(df_temp['ID'], errors='coerce')
            df_temp.dropna(subset=['ID'], inplace=True)
            df_temp['ID'] = df_temp['ID'].astype(int)

    if 'ID' not in df_articulos.columns or 'ID' not in df_stock.columns:
        st.error("La columna 'ID' falta en los archivos principales.")
        return pd.DataFrame()

    # Merge DataFrames on 'ID'
    df_merged = pd.merge(df_articulos, df_stock, on='ID', how='inner')
    
    # Initialize new columns
    df_merged['PROVEEDOR'] = "SIN ASIGNAR"
    df_merged['NRO DE CLIENTE'] = "SIN ASIGNAR"
    
    # Dictionaries to hold ID mappings
    proveedor_mapping = {}
    cliente_mapping = {}

    # Define base files to exclude
    base_files = ["app.py", "articulos.xls", "articulos.csv", "articulos.xls - Sheet 1.csv", 
                  "stock.xls", "stock.csv", "stock.xls - Sheet 1.csv"]

    pattern = re.compile(r'^(.*?)\s+(\d+)$')

    # Search for other .csv or .xls files in the directory
    for file in os.listdir(folder_path):
        if file in base_files or file.startswith("~") or file.startswith("."):
            continue
            
        if file.endswith(".csv") or file.endswith(".xls") or file.endswith(".xlsx"):
            # Clean up the filename
            prov_name_clean = file
            for suffix in [".xls - Sheet 1.csv", ".xlsx - Sheet 1.csv", ".csv", ".xlsx", ".xls"]:
                if prov_name_clean.endswith(suffix):
                    prov_name_clean = prov_name_clean[:-len(suffix)]
                    break

            # Regex match
            match = pattern.match(prov_name_clean)
            if match:
                proveedor_str = match.group(1).strip()
                nro_cliente_str = match.group(2).strip()
            else:
                proveedor_str = prov_name_clean.strip()
                nro_cliente_str = "SIN ASIGNAR"

            # Load the provider file
            try:
                if file.endswith(".csv"):
                    df_prov = pd.read_csv(file)
                else:
                    df_prov = pd.read_excel(file)
                
                # If there's an ID column, map it
                if 'ID' in df_prov.columns:
                    df_prov = df_prov.dropna(subset=['ID'])
                    df_prov['ID'] = pd.to_numeric(df_prov['ID'], errors='coerce')
                    df_prov = df_prov.dropna(subset=['ID'])
                    df_prov['ID'] = df_prov['ID'].astype(int)
                    
                    # Update mapping
                    for prov_id in df_prov['ID'].unique():
                        proveedor_mapping[prov_id] = proveedor_str
                        cliente_mapping[prov_id] = nro_cliente_str
                        
            except Exception as e:
                print(f"No se pudo cargar {file}: {e}")

    # Map the columns to the main merged dataframe
    # We update only those that have a match to avoid overwriting SIN ASIGNAR unnecessarily
    df_merged['PROVEEDOR'] = df_merged['ID'].map(proveedor_mapping).fillna("SIN ASIGNAR")
    df_merged['NRO DE CLIENTE'] = df_merged['ID'].map(cliente_mapping).fillna("SIN ASIGNAR")

    return df_merged

def main():
    st.title("📦 Panel de Control: Artículos y Proveedores")

    with st.spinner('Cargando datos y procesando proveedores...'):
        df = load_data()

    if df.empty:
        st.warning("No hay datos disponibles para mostrar. Asegúrate de que los archivos estén en la misma carpeta.")
        return

    # User Interface (Streamlit)
    st.markdown("### Filtros")
    col1, col2, col3, col4 = st.columns([2, 1, 1, 1])
    
    with col1:
        search_query = st.text_input("Buscar por nombre del ARTICULO o número de ID:", placeholder="Ejemplo: 5218 o taladro")
        
    with col2:
        # Provider filter
        proveedores_unicos = ["Todos"] + sorted(df['PROVEEDOR'].astype(str).unique().tolist())
        selected_proveedor = st.selectbox("Filtrar por PROVEEDOR:", proveedores_unicos)
        
    with col3:
        # Client Number filter
        clientes_unicos = ["Todos"] + sorted(df['NRO DE CLIENTE'].astype(str).unique().tolist())
        selected_cliente = st.selectbox("Filtrar por NRO DE CLIENTE:", clientes_unicos)
    
    with col4:
        st.write("") # Spacer
        st.write("") # Spacer
        show_negative_stock = st.checkbox("⚠️ Mostrar solo stock negativo")

    # Filtering logic
    filtered_df = df.copy()

    articulo_col = next((col for col in filtered_df.columns if 'ARTICULO' in col.upper() or 'ARTÍCULO' in col.upper()), None)
    stock_col = next((col for col in filtered_df.columns if col.upper() == 'STOCK' or col.upper() == 'CANTIDAD'), None)

    # 1. Filter by Search Query
    if search_query:
        query = str(search_query).strip().lower()
        
        mask_id = filtered_df['ID'].astype(str).str.contains(query, case=False, na=False)
        if articulo_col:
            mask_name = filtered_df[articulo_col].astype(str).str.contains(query, case=False, na=False)
            filtered_df = filtered_df[mask_id | mask_name]
        else:
            filtered_df = filtered_df[mask_id]

    # 2. Filter by Provider
    if selected_proveedor != "Todos":
        filtered_df = filtered_df[filtered_df['PROVEEDOR'].astype(str) == str(selected_proveedor)]
        
    # 3. Filter by Client Number
    if selected_cliente != "Todos":
        filtered_df = filtered_df[filtered_df['NRO DE CLIENTE'].astype(str) == str(selected_cliente)]

    # 4. Filter by Negative Stock
    if show_negative_stock and stock_col:
        filtered_df[stock_col] = pd.to_numeric(filtered_df[stock_col], errors='coerce')
        filtered_df = filtered_df[filtered_df[stock_col] < 0]

    st.markdown("---")
    st.metric(label="Total de artículos encontrados", value=len(filtered_df))
    
    # Interactive dataframe
    st.dataframe(filtered_df, use_container_width=True)

if __name__ == "__main__":
    main()
