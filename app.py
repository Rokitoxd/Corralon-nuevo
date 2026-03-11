import streamlit as st
import pandas as pd
import os
import urllib.parse
import traceback

st.set_page_config(page_title="Corralón - Portal de Clientes", layout="centered")

# --- FUNCIONES DE DATOS ---
def clasificar_articulo(row):
    articulo = str(row.get('ARTICULO', '')).upper()
    item = str(row.get('ITEM', '')).upper()
    
    texto = articulo + " " + item
    
    # Regla 1 (Exclusión)
    if any(word in texto for word in ['FLETE', 'ALQUILER', 'MANO DE OBRA', 'SERVICIO', 'VIAJE']):
        return 'EXCLUIR'
        
    # Regla 2 (Obra Gruesa)
    if any(word in texto for word in ['LADRILLO', 'BOLSA', 'CEMENTO', 'ARENA', 'CAL', 'HIERRO', 'MALLA', 'CHAPA', 'ARIDO']):
        return '🧱 Obra Gruesa y Materiales'
        
    # Regla 3 (Plomería)
    if any(word in texto for word in ['PLOMERIA', 'SEPAPY', 'CAÑO', 'AWADUC', 'SANITARIO', 'GRIFERIA', 'TANQUE', 'BOMBA']):
        return '💧 Plomería y Sanitarios'
        
    # Regla 4 (Electricidad)
    if any(word in texto for word in ['ELECTRICIDAD', 'CABLE', 'ILUMINACION', 'FOCO', 'TOMA']):
        return '⚡ Electricidad'
        
    # Regla 5 (Ferretería)
    if any(word in texto for word in ['HERRAMIENTA', 'DISCO', 'MECHA', 'TORNILLO', 'CLAVO', 'PINTURA']):
        return '🛠️ Ferretería y Herramientas'
        
    # Regla 6 (Por defecto)
    return '📦 General / Otros'

@st.cache_data
def cargar_articulos_df():
    """Carga y limpia la lista de artículos y categorías del documento del corralón."""
    # Archivos posibles
    archivos = ['articulos.xls - Sheet 1.csv', 'articulos.xls']
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
                print(f"Error cargando {filename}: {e}")
                continue

    if df is None:
        return pd.DataFrame()

    # Limpiar columnas
    df.columns = df.columns.astype(str).str.strip()
    
    if 'ARTICULO' not in df.columns:
        return pd.DataFrame()

    # Si no existe la columna ITEM, la creamos vacía para evitar fallos
    if 'ITEM' not in df.columns:
        df['ITEM'] = ''

    # Quedarnos con ARTICULO e ITEM
    df_clean = df[['ARTICULO', 'ITEM']].copy()
    
    # Limpiar ARTICULO (convertir a string y quitar espacios)
    df_clean['ARTICULO'] = df_clean['ARTICULO'].astype(str).str.strip()
    
    # Excluir nulos formales en ARTICULO
    df_clean = df_clean[(df_clean['ARTICULO'] != 'nan') & (df_clean['ARTICULO'] != '')]
    
    # Aplicar la función a cada fila para crear CATEGORIA_WEB
    df_clean['CATEGORIA_WEB'] = df_clean.apply(clasificar_articulo, axis=1)
    
    # Filtrar EXCLUIR
    df_clean = df_clean[df_clean['CATEGORIA_WEB'] != 'EXCLUIR']
    
    # Filtrar basura donde el articulo sean solo numeros
    df_clean = df_clean[~df_clean['ARTICULO'].str.isnumeric()]
    
    # Ordenar alfabéticamente
    df_clean = df_clean.sort_values(by='ARTICULO').reset_index(drop=True)
    
    return df_clean

# --- INTERFAZ ---
st.title("Bienvenido a Nuestro Corralón 🧱")
st.write("Selecciona cómo prefieres trabajar hoy:")

# Cargar el DataFrame global
df_catalogo = cargar_articulos_df()
articulos_reales = df_catalogo['ARTICULO'].tolist() if not df_catalogo.empty else ["Error cargando datos"]

# Creamos TRES pestañas principales
tab_proyectos, tab_archivos, tab_minorista = st.tabs([
    "🏗️ Calculadora Estimativa", 
    "📂 Subir Planilla de Obra", 
    "🛒 Pedidos Rápidos"
])

# --- PESTAÑA 1: LA CALCULADORA DE OBRAS (Consultoría) ---
with tab_proyectos:
    st.header("Calculadora Inteligente de Materiales")
    st.write("Estima los materiales básicos y recibe asesoramiento sin cargo.")
    
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
        
        texto_pedido_obra = f"Hola, usé la calculadora web y necesito presupuesto para {metros}m2 de {proyecto}.\n\nMateriales sugeridos:\n"
        
        if proyecto == "Pared de Ladrillo Hueco 18x18x33":
            ladrillos = int(metros * 16)
            cemento = round(metros * 0.30, 2)
            arena = round(metros * 0.05, 3)
            cal = round(metros * 0.15, 2)
            
            st.write(f"- 🧱 **LADRILLO HUECO 18 X 18 X 33:** {ladrillos} unidades.")
            st.write(f"- 🏗️ **CEMENTO X BOLSA - HOLCIM X 50 KG:** {cemento} bolsas.")
            st.write(f"- ⏳ **AR ARENA MEDIANA X M3:** {arena} m³.")
            st.write(f"- ⚪ **CAL HIDRATADA X 25 KG:** {cal} bolsas.")
            
            texto_pedido_obra += f"- {ladrillos} u. de LADRILLO HUECO 18 X 18 X 33\n- {cemento} bolsas de CEMENTO X BOLSA - HOLCIM X 50 KG\n- {cal} bolsas de CAL HIDRATADA X 25 KG\n- {arena} m3 de AR ARENA MEDIANA X M3"
            
        elif proyecto == "Pared de Ladrillo Hueco 12x18x33":
            ladrillos = int(metros * 16)
            cemento = round(metros * 0.30, 2)
            arena = round(metros * 0.05, 3)
            cal = round(metros * 0.15, 2)
            
            st.write(f"- 🧱 **LADRILLO HUECO 12 X 18 X 33:** {ladrillos} unidades.")
            st.write(f"- 🏗️ **CEMENTO X BOLSA - HOLCIM X 50 KG:** {cemento} bolsas.")
            st.write(f"- ⏳ **AR ARENA MEDIANA X M3:** {arena} m³.")
            st.write(f"- ⚪ **CAL HIDRATADA X 25 KG:** {cal} bolsas.")
            
            texto_pedido_obra += f"- {ladrillos} u. de LADRILLO HUECO 12 X 18 X 33\n- {cemento} bolsas de CEMENTO X BOLSA - HOLCIM X 50 KG\n- {cal} bolsas de CAL HIDRATADA X 25 KG\n- {arena} m3 de AR ARENA MEDIANA X M3"

        elif proyecto == "Contrapiso Estándar":
            cemento = round(metros * 0.35, 2)
            arena = round(metros * 0.05, 3)
            ripio = round(metros * 0.05, 3)
            
            st.write(f"- 🏗️ **CEMENTO X BOLSA - HOLCIM X 50 KG:** {cemento} bolsas.")
            st.write(f"- ⏳ **AR ARENA MEDIANA X M3:** {arena} m³.")
            st.write(f"- 🪨 **PIEDRA/RIPIO X M3:** {ripio} m³.")
            
            texto_pedido_obra += f"- {cemento} bolsas de CEMENTO X BOLSA - HOLCIM X 50 KG\n- {arena} m3 de AR ARENA MEDIANA X M3\n- {ripio} m3 de PIEDRA/RIPIO X M3"

        st.info("💡 Envíanos esto para que un ingeniero ajuste los cálculos y te ofrezca precio por volumen.")
        
        link_obra = f"https://wa.me/5493810000000?text={urllib.parse.quote(texto_pedido_obra)}"
        st.markdown(f"**[🟢 Enviar Consulta por WhatsApp]({link_obra})**")


# --- PESTAÑA 2: SUBIR ARCHIVOS (El gancho para obras grandes) ---
with tab_archivos:
    st.header("Cotizaciones Especiales y Obras")
    st.write("¿Ya tienes tu lista de materiales, planilla Excel o plano en PDF? Súbelo aquí y nuestro equipo técnico lo analizará para darte el mejor presupuesto.")
    
    nombre_cliente = st.text_input("Tu Nombre o Empresa:")
    telefono_cliente = st.text_input("Teléfono de contacto:")
    
    archivo_subido = st.file_uploader(
        "Arrastra aquí tu Excel, PDF o foto del pedido", 
        type=["pdf", "xls", "xlsx", "csv", "png", "jpg", "jpeg"]
    )
    
    if st.button("📤 Enviar para cotizar"):
        if nombre_cliente and telefono_cliente and archivo_subido:
            carpeta_dest = "pedidos_recibidos"
            if not os.path.exists(carpeta_dest):
                os.makedirs(carpeta_dest)
                
            nombre_limpio = nombre_cliente.replace(" ", "_")
            ruta_guardado = os.path.join(carpeta_dest, f"{nombre_limpio}_{archivo_subido.name}")
            
            try:
                with open(ruta_guardado, "wb") as f:
                    f.write(archivo_subido.getbuffer())
                st.success(f"✅ ¡Archivo recibido con éxito! Un especialista ya lo tiene en su sistema.")
                
                msg_archivo = f"Hola, acabo de subir mi planilla de materiales en la web a nombre de {nombre_cliente}. Mi teléfono es {telefono_cliente}. Aguardo cotización."
                link_archivo = f"https://wa.me/5493810000000?text={urllib.parse.quote(msg_archivo)}"
                st.markdown(f"**[🟢 Avisar por WhatsApp que ya enviaste el archivo]({link_archivo})**")
            except Exception as e:
                st.error("Error al guardar el archivo. Por favor contacta por WhatsApp.")
                print(f"Error subida archivo: {e}")
        else:
            st.error("⚠️ Por favor, completa tu nombre, teléfono y asegúrate de adjuntar un archivo.")


# --- PESTAÑA 3: CATÁLOGO MINORISTA (Carrito de compras) ---
with tab_minorista:
    st.header("🛒 Catálogo y Pedido Rápido")

    # Inicialización de estado para la navegación
    if 'carrito' not in st.session_state:
        st.session_state.carrito = []
    if 'categoria_actual' not in st.session_state:
        st.session_state.categoria_actual = None

    if df_catalogo.empty:
        st.error("No se pudo cargar el catálogo de artículos. Por favor, verifica los archivos de datos.")
    else:
        # 1. VISTA: GRILLA DE CATEGORÍAS
        if st.session_state.categoria_actual is None:
            st.subheader("📂 Selecciona una Categoría")
            st.write("Explora nuestros productos por rubro:")
            
            # Obtener lista única de categorías
            categorias_unicas = sorted(df_catalogo['CATEGORIA_WEB'].unique().tolist())
            
            # Dibujar grilla de 3 columnas
            columnas = st.columns(3)
            for i, cat in enumerate(categorias_unicas):
                with columnas[i % 3]:
                    # Botón grande para categoría
                    if st.button(cat, use_container_width=True, key=f"cat_{cat}"):
                        st.session_state.categoria_actual = cat
                        st.rerun()

        # 2. VISTA: LISTA DE PRODUCTOS POR CATEGORÍA
        else:
            cat_actual = st.session_state.categoria_actual
            
            # Encabezado con botón de volver
            col_titulo, col_volver = st.columns([3, 1])
            with col_titulo:
                st.subheader(f"📦 Categoría: {cat_actual}")
            with col_volver:
                if st.button("🔙 Volver a Categorías"):
                    st.session_state.categoria_actual = None
                    st.rerun()
            
            # Filtrar df por la categoria seleccionada
            df_cat = df_catalogo[df_catalogo['CATEGORIA_WEB'] == cat_actual]
            
            # Buscador interno
            buscar_prod = st.text_input("🔍 Buscar artículo específico:", key=f"busqueda_{cat_actual}").strip().lower()
            if buscar_prod:
                df_cat = df_cat[df_cat['ARTICULO'].str.lower().str.contains(buscar_prod, na=False)]
                
            st.write(f"Mostrando {len(df_cat)} artículos.")
            st.divider()

            # Iterar productos
            for index, row in df_cat.iterrows():
                articulo = row['ARTICULO']
                
                # Container simulando tarjeta
                with st.container(border=True):
                    st.write(f"**{articulo}**")
                    
                    c_input, c_btn = st.columns([1, 2])
                    # IDs unicos para inputs
                    input_key = f"cant_{index}"
                    
                    with c_input:
                        cant = st.number_input("Cantidad", min_value=1, value=1, step=1, key=input_key)
                    with c_btn:
                        # Alienamos verticalmente el boton un poco mas abajo (opcional padding con markdown, o directo st.columns extra)
                        st.markdown("<br>", unsafe_allow_html=True)
                        if st.button("➕ Agregar", key=f"btn_{index}", use_container_width=True):
                            st.session_state.carrito.append({"Articulo": str(articulo), "Cantidad": int(cant)})
                            st.success(f"¡Agregado al carrito!")
            
    # 4. EL CARRITO (Siempre visible al final de la pestaña)
    st.divider()
    
    if st.session_state.carrito:
        st.subheader("📝 Tu Pedido Actual:")
        pedido_texto = "Hola Corralón, quiero encargar lo siguiente para revisar stock:\n\n"
        
        for item in st.session_state.carrito:
            st.write(f"👉 {item['Cantidad']} u. - **{item['Articulo']}**")
            pedido_texto += f"- {item['Cantidad']} u. de {item['Articulo']}\n"
            
        col_vaciar, col_enviar = st.columns(2)
        with col_vaciar:
            if st.button("🗑️ Vaciar pedido"):
                st.session_state.carrito = []
                st.rerun()

        with col_enviar:
            import urllib.parse
            msg_codificado = urllib.parse.quote(pedido_texto)
            link_pedido = f"https://wa.me/5493810000000?text={msg_codificado}"
            st.markdown(f"**[🟢 Enviar pedido por WhatsApp]({link_pedido})**")
