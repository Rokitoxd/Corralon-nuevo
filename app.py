import streamlit as st
import pandas as pd
import os
import urllib.parse
import traceback

st.set_page_config(page_title="Corralon La Rural", layout="centered", page_icon="🧱")


# --- FUNCIONES DE DATOS ---
def clasificar_articulo(row):
    articulo = str(row.get('ARTICULO', '')).upper()
    item = str(row.get('ITEM', '')).upper()
    
    texto = articulo + " " + item
    
    if any(word in texto for word in ['FLETE', 'ALQUILER', 'MANO DE OBRA', 'SERVICIO', 'VIAJE']):
        return 'EXCLUIR'
        
    if any(word in texto for word in ['LADRILLO', 'BOLSA', 'CEMENTO', 'ARENA', 'CAL', 'HIERRO', 'MALLA', 'CHAPA', 'ARIDO']):
        return '🧱 Obra Gruesa y Materiales'
        
    if any(word in texto for word in ['PLOMERIA', 'SEPAPY', 'CAÑO', 'AWADUC', 'SANITARIO', 'GRIFERIA', 'TANQUE', 'BOMBA']):
        return '💧 Plomería y Sanitarios'
        
    if any(word in texto for word in ['ELECTRICIDAD', 'CABLE', 'ILUMINACION', 'FOCO', 'TOMA']):
        return '⚡ Electricidad'
        
    if any(word in texto for word in ['HERRAMIENTA', 'DISCO', 'MECHA', 'TORNILLO', 'CLAVO', 'PINTURA']):
        return '🛠️ Ferretería y Herramientas'
        
    return '📦 General / Otros'

@st.cache_data
def cargar_articulos_df():
    archivos = ['articulos_stock_proveedores.xlsx', 'articulos_stock_proveedores.csv']
    df = None
    for filename in archivos:
        if os.path.exists(filename):
            try:
                if filename.endswith('.csv'):
                    df = pd.read_csv(filename)
                else:
                    try:
                        df = pd.read_csv(filename, delimiter='\t')
                    except:
                        try:
                            df = pd.read_excel(filename)
                        except:
                            df = pd.read_html(filename, decimal=',', thousands='.')[0]
                break
            except Exception as e:
                continue

    if df is None: return pd.DataFrame()
    if 'ARTICULO' not in df.columns: return pd.DataFrame()
    
    # 1. Limpiar nombres de columnas
    df.columns = df.columns.astype(str).str.strip()

    # 2. Filtro de Venta (Solo mayores a 1)
    if '$ VENTA1' in df.columns:
        df['$ VENTA1'] = pd.to_numeric(df['$ VENTA1'], errors='coerce').fillna(0)
        df = df[df['$ VENTA1'] > 1]

    # 3. Filtro de Stock (Solo mayores a 0)
    stock_col = next((col for col in df.columns if 'STOCK' in str(col).upper() or 'CANT' in str(col).upper()), 'Stock')
    if stock_col in df.columns:
        df[stock_col] = pd.to_numeric(df[stock_col], errors='coerce').fillna(0)
        df = df[df[stock_col] > 0]

    # 4. Filtro de Basura (Z, Asteriscos, Xx)
    if 'ARTICULO' in df.columns:
        df['ARTICULO'] = df['ARTICULO'].fillna('').astype(str)
        patron_basura = r'^\s*\*|^\s*X[xX]|^\s*Z(?!(OC|IN|UN|AP))'
        df = df[~df['ARTICULO'].str.contains(patron_basura, case=False, regex=True)]
        
        # 5. Formato de nombres limpios (Title Case y unidades correctas)
        df['ARTICULO'] = df['ARTICULO'].str.title()
        reemplazos = {
            r'\sX\s': ' x ', r'\sKg\b': ' kg', r'\sMm\b': ' mm', 
            r'\sCm\b': ' cm', r'\sMts\b|\sMt\b': ' m', r'\sLts\b|\sLt\b': ' L', 
            r'\bPvc\b': ' PVC', r'\bMdf\b': ' MDF'
        }
        for patron, reemplazo in reemplazos.items():
            df['ARTICULO'] = df['ARTICULO'].str.replace(patron, reemplazo, regex=True)

    if 'ITEM' not in df.columns: df['ITEM'] = ''

    columnas_guardar = ['ARTICULO', 'ITEM']
    if stock_col in df.columns:
        columnas_guardar.append(stock_col)
        
    df_clean = df[columnas_guardar].copy()
    df_clean = df_clean[(df_clean['ARTICULO'] != 'nan') & (df_clean['ARTICULO'] != '')]
    df_clean['CATEGORIA_WEB'] = df_clean.apply(clasificar_articulo, axis=1)
    df_clean = df_clean[df_clean['CATEGORIA_WEB'] != 'EXCLUIR']
    df_clean = df_clean[~df_clean['ARTICULO'].str.isnumeric()]
    df_clean = df_clean.sort_values(by='ARTICULO').reset_index(drop=True)
    return df_clean

@st.cache_data
def cargar_lista_madre():
    try:
        df = pd.read_excel('articulos_stock_proveedores.xlsx')
        col_v1, col_v2 = '$ VENTA1', '$ VENTA 2'
        
        if col_v1 in df.columns: df[col_v1] = pd.to_numeric(df[col_v1], errors='coerce').fillna(0)
        else: df[col_v1] = 0
            
        if col_v2 in df.columns: df[col_v2] = pd.to_numeric(df[col_v2], errors='coerce').fillna(0)
        else: df[col_v2] = 0
            
        df = df[(df[col_v1] > 1) | (df[col_v2] > 1)]
        if 'ARTICULO' in df.columns: df = df.sort_values(by='ARTICULO')
        
        df = df.fillna('')
        df = df.astype(str)
        return df
    except Exception as e:
        return pd.DataFrame()

col1, col2, col3 = st.columns([1, 2, 1])
with col2:
    st.image('WhatsApp Image 2026-03-18 at 16.45.55.jpeg', width=300)
st.header('Corralon La Rural')

st.info("🚀 **¿Cómo comprar?** 1️⃣ Armá tu pedido en el catálogo ➔ 2️⃣ Revisá tu carrito ➔ 3️⃣ Envialo por WhatsApp para coordinar pago y envío.")

# Cargar DataFrame
df_catalogo = cargar_articulos_df()



if 'carrito' not in st.session_state: st.session_state.carrito = []
if 'categoria_actual' not in st.session_state: st.session_state.categoria_actual = None

# --- SIDEBAR: CARRITO PERSISTENTE ---
st.sidebar.image('WhatsApp Image 2026-03-18 at 16.45.55.jpeg', width='stretch')
st.sidebar.markdown('<h3 style="text-align: center;">Corralon La Rural</h3>', unsafe_allow_html=True)
st.sidebar.header('🛒 Tu Pedido Actual')
st.sidebar.divider()

if not st.session_state.carrito:
    st.sidebar.info('Aún no agregaste artículos.')
else:
    pedido_texto = "Hola Corralon La Rural, quiero encargar lo siguiente para revisar stock:\n\n"
    for item in st.session_state.carrito:
        st.sidebar.write(f"- {item['Cantidad']} u. de {item['Articulo']}")
        pedido_texto += f"- {item['Cantidad']} u. de {item['Articulo']}\n"
        
    st.sidebar.divider()
    if st.sidebar.button("🗑️ Vaciar pedido", type="secondary", width="stretch"):
        st.session_state.carrito = []
        st.rerun()
        
    msg_codificado = urllib.parse.quote(pedido_texto)
    link_pedido = f"https://wa.me/5493810000000?text={msg_codificado}"
    st.sidebar.link_button("🟩 Consultar Stock y Envío por WhatsApp", link_pedido, type="primary", use_container_width=True)


# --- PESTAÑAS ---
tab_proyectos, tab_archivos, tab_minorista, tab_admin = st.tabs([
    "🏗️ Calculadora de Obra", 
    "📂 Enviar Planilla", 
    "🛒 Catálogo Minorista",
    "🔒 Intranet / Admin"
])

# --- PESTAÑA 1: LA CALCULADORA DE OBRAS ---
with tab_proyectos:
    st.header("Herramienta de Estimación")
    st.write("Calcula los materiales básicos y obten asesoramiento sin cargo.")
    
    opciones_proyecto = [
        "Seleccionar proyecto...", 
        "Pared de Ladrillo Hueco 18x18x33", 
        "Pared de Ladrillo Hueco 12x18x33", 
        "Contrapiso Estándar"
    ]
    
    proyecto = st.selectbox("¿Qué tipo de trabajo vas a realizar?", opciones_proyecto)

    if proyecto != "Seleccionar proyecto...":
        metros = st.number_input("Metros Cuadrados (m²):", min_value=1, value=15, step=1)
        st.subheader(f"📋 Estimación para {metros} m²")
        texto_pedido_obra = f"Hola Corralon La Rural, usé la calculadora web y necesito presupuesto para {metros}m2 de {proyecto}.\n\nMateriales sugeridos:\n"
        
        with st.container(border=True):
            if proyecto == "Pared de Ladrillo Hueco 18x18x33":
                ladrillos = int(metros * 16)
                cemento = round(metros * 0.30, 2)
                arena = round(metros * 0.05, 3)
                cal = round(metros * 0.15, 2)
                st.write(f"- 🧱 **LADRILLO HUECO 18 X 18 X 33:** {ladrillos} u.")
                st.write(f"- 🏗️ **CEMENTO X BOLSA - HOLCIM X 50 KG:** {cemento} bol.")
                st.write(f"- ⏳ **AR ARENA MEDIANA X M3:** {arena} m³.")
                st.write(f"- ⚪ **CAL HIDRATADA X 25 KG:** {cal} bol.")
                texto_pedido_obra += f"- {ladrillos} u. de LADRILLO HUECO 18 X 18 X 33\n- {cemento} bolsas de CEMENTO X BOLSA - HOLCIM\n- {cal} bolsas de CAL HIDRATADA\n- {arena} m3 de AR ARENA"
                
            elif proyecto == "Pared de Ladrillo Hueco 12x18x33":
                ladrillos = int(metros * 16)
                cemento = round(metros * 0.30, 2)
                arena = round(metros * 0.05, 3)
                cal = round(metros * 0.15, 2)
                st.write(f"- 🧱 **LADRILLO HUECO 12 X 18 X 33:** {ladrillos} u.")
                st.write(f"- 🏗️ **CEMENTO X BOLSA - HOLCIM X 50 KG:** {cemento} bol.")
                st.write(f"- ⏳ **AR ARENA MEDIANA X M3:** {arena} m³.")
                st.write(f"- ⚪ **CAL HIDRATADA X 25 KG:** {cal} bol.")
                texto_pedido_obra += f"- {ladrillos} u. de LADRILLO HUECO 12 X 18 X 33\n- {cemento} bolsas de CEMENTO X BOLSA - HOLCIM\n- {cal} bolsas de CAL HIDRATADA\n- {arena} m3 de AR ARENA"

            elif proyecto == "Contrapiso Estándar":
                cemento = round(metros * 0.35, 2)
                arena = round(metros * 0.05, 3)
                ripio = round(metros * 0.05, 3)
                st.write(f"- 🏗️ **CEMENTO X BOLSA - HOLCIM X 50 KG:** {cemento} bol.")
                st.write(f"- ⏳ **AR ARENA MEDIANA X M3:** {arena} m³.")
                st.write(f"- 🪨 **PIEDRA/RIPIO X M3:** {ripio} m³.")
                texto_pedido_obra += f"- {cemento} bolsas de CEMENTO X BOLSA - HOLCIM\n- {arena} m3 de AR ARENA\n- {ripio} m3 de PIEDRA/RIPIO"

        st.info("💡 Envíanos esto para que un agente ajuste los cálculos y te ofrezca el mejor precio.")
        link_obra = f"https://wa.me/5493810000000?text={urllib.parse.quote(texto_pedido_obra)}"
        st.markdown(f"**[🟢 Consultar Presupuesto por WhatsApp]({link_obra})**")

# --- PESTAÑA 2: ENVIAR PLANILLA ---
with tab_archivos:
    st.header("Cotizaciones a Medida")
    st.write("Sube tu Excel o plano en PDF y recibe un presupuesto exacto con descuentos por volumen.")
    
    with st.container(border=True):
        nombre_cliente = st.text_input("Tu Nombre o Empresa:")
        telefono_cliente = st.text_input("Teléfono de contacto:")
        
        archivo_subido = st.file_uploader(
            "Adjunta aquí tu Excel, PDF o Foto", 
            type=["pdf", "xls", "xlsx", "csv", "png", "jpg", "jpeg"]
        )
        
        if st.button("📤 Subir Documentos", type="primary"):
            if nombre_cliente and telefono_cliente and archivo_subido:
                carpeta_dest = "pedidos_recibidos"
                if not os.path.exists(carpeta_dest):
                    os.makedirs(carpeta_dest)
                    
                nombre_limpio = nombre_cliente.replace(" ", "_").replace("/", "-")
                ruta_guardado = os.path.join(carpeta_dest, f"{nombre_limpio}_{archivo_subido.name}")
                
                try:
                    with open(ruta_guardado, "wb") as f:
                        f.write(archivo_subido.getbuffer())
                    st.success(f"✅ ¡Documento procesado! Un ejecutivo comercial lo está revisando.")
                    
                    msg_archivo = f"Hola Corralon La Rural, subí mi planilla de materiales a nombre de {nombre_cliente} ({telefono_cliente}). Aguardo respuesta para avanzar."
                    link_archivo = f"https://wa.me/5493810000000?text={urllib.parse.quote(msg_archivo)}"
                    st.markdown(f"**[🟢 Avisar al local que enviaste el archivo]({link_archivo})**")
                except Exception as e:
                    st.error("Error temporal. Por favor contáctanos directamente.")
            else:
                st.error("⚠️ Completa tu nombre, teléfono y adjunta el archivo.")

# --- PESTAÑA 3: CATÁLOGO MINORISTA ---
with tab_minorista:
    if df_catalogo.empty:
        st.error("Error al conectar con la base de inventario. Verifica tus archivos.")
    else:
        busqueda_global = st.text_input('🔍 Buscar producto directo...', '')

        if busqueda_global:
            df_busqueda = df_catalogo[df_catalogo['ARTICULO'].str.contains(busqueda_global, case=False, na=False)]
            if not df_busqueda.empty:
                st.write("**Mostrando resultados directos:**")
                for index, row in df_busqueda.iterrows():
                    articulo = row['ARTICULO']
                    with st.container(border=True):
                        c_nombre, c_input, c_btn = st.columns([5, 2, 2], vertical_alignment="bottom")
                        with c_nombre:
                            st.write(f"**{articulo}**")
                        input_key = f"cant_global_{articulo}_{index}"
                        with c_input:
                            cant = st.number_input("Cant.", min_value=1, value=1, step=1, key=input_key, label_visibility="collapsed")
                        with c_btn:
                            if st.button("➕", key=f"btn_global_{articulo}_{index}", width='stretch'):
                                st.session_state.carrito.append({"Articulo": str(articulo), "Cantidad": int(cant)})
                                st.rerun()
            else:
                st.warning('No hay coincidencias en nuestro catálogo actual.')

        else:
            if st.session_state.categoria_actual is None:
                st.header("Explorar Familias")
                categorias_unicas = sorted(df_catalogo['CATEGORIA_WEB'].unique().tolist())
                columnas = st.columns(2)
                
                for i, cat in enumerate(categorias_unicas):
                    with columnas[i % 2]:
                        with st.container(border=True):
                            st.write(f"**{cat}**")
                            if st.button("Explorar", key=f"cat_{cat}", width='stretch'):
                                st.session_state.categoria_actual = cat
                                st.rerun()
            else:
                cat_actual = st.session_state.categoria_actual
                col_titulo, col_volver = st.columns([3, 1], vertical_alignment="center")
                with col_titulo:
                    st.header(cat_actual)
                with col_volver:
                    if st.button("🔙 Volver"):
                        st.session_state.categoria_actual = None
                        st.rerun()
                
                df_cat = df_catalogo[df_catalogo['CATEGORIA_WEB'] == cat_actual]
                buscar_prod = st.text_input("🔍 Filtrar dentro de esta sección:", key=f"busqueda_{cat_actual}").strip().lower()
                if buscar_prod:
                    df_cat = df_cat[df_cat['ARTICULO'].str.lower().str.contains(buscar_prod, na=False)]
                    
                st.divider()

                for index, row in df_cat.iterrows():
                    articulo = row['ARTICULO']
                    with st.container(border=True):
                        c_nombre, c_input, c_btn = st.columns([5, 2, 2], vertical_alignment="bottom")
                        with c_nombre:
                            st.write(f"**{articulo}**")
                        input_key = f"cant_{index}"
                        with c_input:
                            cant = st.number_input("Cant.", min_value=1, value=1, step=1, key=input_key, label_visibility="collapsed")
                        with c_btn:
                            if st.button("➕", key=f"btn_{index}", width='stretch'):
                                st.session_state.carrito.append({"Articulo": str(articulo), "Cantidad": int(cant)})
                                st.rerun()

# --- PESTAÑA 4: INTRANET ---
with tab_admin:
    st.header("Portal Interno")
    password = st.text_input("Clave de Operador:", type="password")
    
    if password == 'corralon2026':
        st.success("Verificado correctamente.")
        df_madre = cargar_lista_madre()
        if not df_madre.empty:
            buscar_admin = st.text_input('🔍 Buscar por código o descripción...').strip().lower()
            if buscar_admin and 'ARTICULO' in df_madre.columns:
                df_madre = df_madre[df_madre['ARTICULO'].astype(str).str.lower().str.contains(buscar_admin, na=False)]
            st.dataframe(df_madre, width='stretch', hide_index=True)
        else:
            st.error("Error en lectura de base maestra.")
    elif password:
        st.warning('Credenciales inválidas.')

# --- FOOTER ---
st.divider()
st.markdown("<p style='text-align: center; color: gray; font-size: 0.9em;'>📍 Av. Camino del Perú 1291, Tucumán | ⏰ Lunes a Viernes 08:00 a 18:00hs | 🚚 Envíos a obra | 💳 Medios de pago: Efectivo, Transferencia, Débito/Crédito</p>", unsafe_allow_html=True)
