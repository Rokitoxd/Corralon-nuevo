import streamlit as st
import pandas as pd
import os
import urllib.parse
import traceback

# Variable de Teléfono para WhatsApp (Reemplazar las X con tu número real)
tel_whatsapp = '5493815139567'

st.set_page_config(page_title="Corralon La Rural", layout="wide", page_icon="🧱", initial_sidebar_state="expanded")

# CSS personalizado para mejorar las Pestañas (TABS)
st.markdown("""
<style>
    /* Agrandar el texto y el padding de las pestañas */
    .stTabs [data-baseweb="tab-list"] button {
        font-size: 1.2rem;
        padding: 1rem 2rem;
    }
    .stTabs [data-baseweb="tab-list"] button [data-testid="stMarkdownContainer"] p {
        font-size: 1.25rem;
        font-weight: 700;
    }
    /* Añadir un color leve al tab activo para que resalte más */
    .stTabs [data-baseweb="tab-list"] button[aria-selected="true"] {
        background-color: #f0f8ff;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
    }
    
    /* Responsive: Celulares (Wrap tabs para que no queden ocultas) */
    @media (max-width: 768px) {
        .stTabs [data-baseweb="tab-list"] {
            display: flex;
            flex-wrap: wrap !important;
            justify-content: center;
            gap: 5px;
        }
        .stTabs [data-baseweb="tab-list"] button {
            flex-basis: 48% !important; /* Dos pestañas por fila en celular */
            padding: 0.5rem !important;
            font-size: 1rem !important;
            border-radius: 8px !important;
            border: 1px solid #e0e0e0;
            margin: 0 !important;
        }
        .stTabs [data-baseweb="tab-list"] button [data-testid="stMarkdownContainer"] p {
            font-size: 0.95rem !important;
            text-align: center;
        }
    }
</style>
""", unsafe_allow_html=True)


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

import base64
import os
def get_base64_img(filename):
    if os.path.exists(filename):
        ext = os.path.splitext(filename)[1].lower()
        mime = 'image/jpeg' if ext in ('.jpg', '.jpeg') else 'image/png' if ext == '.png' else 'image/webp' if ext == '.webp' else 'image/png'
        with open(filename, "rb") as f:
            return f"data:{mime};base64,{base64.b64encode(f.read()).decode()}"
    return ""

logo_rural = get_base64_img('WhatsApp Image 2026-03-18 at 16.45.55.jpeg')
logo_disensa = get_base64_img('Logo-Disensa.png')
marcas = [
    "amanco-logo-png_seeklogo-203056.png",
    "ferrum-seeklogo.png",
    "tersuave-seeklogo.png",
    "Holcim_Logo_2021_sRGB.png",
    "Weber Saint Gobain.png"
]
imgs_html = "".join([f'<img src="{get_base64_img(m)}" class="brand-logo">' for m in marcas])

html_header = f"""
<style>
.header-container {{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color: white;
    padding: 15px 25px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    margin-bottom: 25px;
    border: 1px solid #f0f0f0;
}}
.header-left {{
    flex: 1;
    text-align: center;
    border-right: 2px solid #f5f5f5;
    padding-right: 20px;
}}
.header-right {{
    flex: 1.5;
    text-align: center;
    padding-left: 20px;
}}
.main-logo {{
    width: 100%;
    max-width: 200px;
    object-fit: contain;
    border-radius: 8px;
}}
.title-rural {{
    margin: 10px 0 0 0;
    font-size: 1.5rem;
    font-weight: 800;
    color: #2c3e50;
}}
.title-confianza {{
    margin: 0 0 10px 0;
    font-size: 0.9rem;
    font-weight: 700;
    color: #7f8c8d;
    text-transform: uppercase;
    letter-spacing: 1.5px;
}}
.disensa-logo {{
    width: 100%;
    max-width: 160px;
    object-fit: contain;
    margin-bottom: 12px;
}}
.brands-container {{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
    gap: 12px;
}}
.brand-logo {{
    height: 32px;
    width: auto;
    max-width: 18%;
    object-fit: contain;
    filter: grayscale(100%);
    opacity: 0.7;
    transition: all 0.3s;
}}
.brand-logo:hover {{
    filter: none;
    opacity: 1;
}}

/* Responsive para celulares */
@media (max-width: 768px) {{
    .header-container {{
        padding: 12px 10px;
        margin-bottom: 15px;
    }}
    .header-left {{
        padding-right: 10px;
        border-right: 1px solid #f0f0f0;
    }}
    .header-right {{
        padding-left: 10px;
    }}
    .main-logo {{
        max-width: 100px;
    }}
    .title-rural {{
        font-size: 1rem;
        margin-top: 5px;
    }}
    .title-confianza {{
        font-size: 0.6rem;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
    }}
    .disensa-logo {{
        max-width: 80px;
        margin-bottom: 8px;
    }}
    .brands-container {{
        gap: 4px;
        flex-wrap: wrap;
    }}
    .brand-logo {{
        height: 16px;
        max-width: 30%;
    }}
}}
</style>

<div class="header-container">
    <div class="header-left">
        <img src="{logo_rural}" class="main-logo">
        <h1 class="title-rural">Corralon La Rural</h1>
    </div>
    
    <div class="header-right">
        <p class="title-confianza">Tu Corralón de Confianza</p>
        <img src="{logo_disensa}" class="disensa-logo">
        <div class="brands-container">
            {imgs_html}
        </div>
    </div>
</div>
"""
try:
    st.html(html_header)
except Exception:
    import streamlit.components.v1 as components
    components.html(html_header, height=220)


st.info("🚀 **¿Cómo comprar?** 1️⃣ Armá tu pedido en el catálogo ➔ 2️⃣ Revisá tu carrito ➔ 3️⃣ Envialo por WhatsApp para coordinar pago y envío.")



# Cargar DataFrame
df_catalogo = cargar_articulos_df()



if 'carrito' not in st.session_state: st.session_state.carrito = []
if 'categoria_actual' not in st.session_state: st.session_state.categoria_actual = None
if 'ver_carrito_pantalla' not in st.session_state: st.session_state.ver_carrito_pantalla = False

if st.session_state.ver_carrito_pantalla:
    st.header("\U0001f6d2 Resumen de tu Pedido")
    
    if not st.session_state.carrito:
        st.info("No tienes productos en el carrito.")
        if st.button("🔙 Volver a la Tienda"):
            st.session_state.ver_carrito_pantalla = False
            st.rerun()
        st.stop()
        
    pedido_texto = "Hola Corralon La Rural, quiero encargar lo siguiente para revisar stock:\n\n"
    for idx, item in enumerate(st.session_state.carrito):
        col1, col2 = st.columns([4, 1])
        with col1:
            st.write(f"🔹 **{item['Cantidad']} u.** de {item['Articulo']}")
        with col2:
            if st.button("❌", key=f"del_checkout_{idx}"):
                st.session_state.carrito.pop(idx)
                if len(st.session_state.carrito) == 0:
                    st.session_state.ver_carrito_pantalla = False
                st.rerun()
        pedido_texto += f"- {item['Cantidad']} u. de {item['Articulo']}\n"
        
    st.divider()
    
    col_back, col_send = st.columns(2)
    with col_back:
        if st.button("🔙 Seguir Comprando", use_container_width=True):
            st.session_state.ver_carrito_pantalla = False
            st.rerun()
    with col_send:
        msg_codificado = urllib.parse.quote(pedido_texto)
        link_pedido = f"https://wa.me/{tel_whatsapp}?text={msg_codificado}"
        st.link_button("🟩 Confirmar y Enviar a WhatsApp", link_pedido, type="primary", use_container_width=True)
        
    st.stop() # Finaliza la ejecución para que no se muestre el catálogo debajo

# --- SIDEBAR: CARRITO PERSISTENTE ---
st.sidebar.markdown('<h3 style="text-align: center;">Corralon La Rural</h3>', unsafe_allow_html=True)

total_unidades = sum(item['Cantidad'] for item in st.session_state.carrito)

if total_unidades > 0:
    html_lleno = f"""
    <div style="background-color: #e8f5e9; padding: 15px; border-radius: 10px; text-align: center; border: 2px solid #4CAF50; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h3 style="color: #2e7d32; margin: 0;">\U0001f6d2 Carrito ({total_unidades})</h3>
        <p style="color: #388e3c; font-size: 0.9em; font-weight: bold; margin: 5px 0 0 0;">¡Tenés productos listos!</p>
    </div>
    """
    st.sidebar.markdown(html_lleno, unsafe_allow_html=True)
else:
    html_vacio = """
    <div style="background-color: #fafafa; padding: 15px; border-radius: 10px; text-align: center; border: 1px dashed #bdbdbd;">
        <h3 style="color: #9e9e9e; margin: 0;">\U0001f6d2 Carrito (0)</h3>
    </div>
    """
    st.sidebar.markdown(html_vacio, unsafe_allow_html=True)

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
    link_pedido = f"https://wa.me/{tel_whatsapp}?text={msg_codificado}"
    st.sidebar.link_button("🟩 Consultar Stock y Envío por WhatsApp", link_pedido, type="primary", use_container_width=True)

    # --- BOTÓN FLOTANTE GLOBAL (VISIBLE SIEMPRE) ---
    st.markdown('<div id="btn-flotante-ancla"></div>', unsafe_allow_html=True)
    if st.button(f"\U0001f6d2 Ver mi Pedido ({total_unidades})", key="btn_checkout_float", type="primary"):
        st.session_state.ver_carrito_pantalla = True
        st.rerun()

    css_flotante = """
    <style>
    /* Buscamos el contenedor del ancla, y seleccionamos el hermano adyacente que contiene el st.button */
    div[data-testid="stElementContainer"]:has(#btn-flotante-ancla) + div[data-testid="stElementContainer"] {
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        z-index: 999999 !important;
    }
    div[data-testid="stElementContainer"]:has(#btn-flotante-ancla) + div[data-testid="stElementContainer"] button {
        background-color: #25D366 !important;
        color: white !important;
        padding: 15px 25px !important;
        border-radius: 50px !important;
        border: none !important;
        box-shadow: 0px 4px 12px rgba(0,0,0,0.3) !important;
        transition: all 0.3s ease !important;
    }
    div[data-testid="stElementContainer"]:has(#btn-flotante-ancla) + div[data-testid="stElementContainer"] button:hover {
        background-color: #1ebe5d !important;
        transform: scale(1.05) !important;
    }
    div[data-testid="stElementContainer"]:has(#btn-flotante-ancla) + div[data-testid="stElementContainer"] button p {
        font-size: 18px !important;
        font-weight: bold !important;
        color: white !important;
    }
    </style>
    """
    st.markdown(css_flotante, unsafe_allow_html=True)


# --- PESTAÑAS ---
tab_minorista, tab_proyectos, tab_archivos, tab_admin = st.tabs([
    "\U0001f6d2 Catálogo Minorista",
    "🏗️ Calculadora de Obra", 
    "📂 Enviar Planilla", 
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
        link_obra = f"https://wa.me/{tel_whatsapp}?text={urllib.parse.quote(texto_pedido_obra)}"
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
                    link_archivo = f"https://wa.me/{tel_whatsapp}?text={urllib.parse.quote(msg_archivo)}"
                    st.markdown(f"**[🟢 Avisar al local que enviaste el archivo]({link_archivo})**")
                except Exception as e:
                    st.error("Error temporal. Por favor contáctanos directamente.")
            else:
                st.error("⚠️ Completa tu nombre, teléfono y adjunta el archivo.")

# --- PESTAÑA 3: CATÁLOGO MINORISTA ---
with tab_minorista:

    # --- BANNER PROMOCIONAL DE MARCAS ---
    banner_b64 = get_base64_img('banner_marcas_larural.jpg')
    if banner_b64:
        banner_html = f"""
        <style>
        .promo-banner-wrap {{
            position: relative;
            width: 100%;
            max-width: 95%;
            margin: 0 auto 25px auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }}
        .promo-banner-wrap:hover {{
            transform: translateY(-3px);
            box-shadow: 0 12px 40px rgba(0,0,0,0.18);
        }}
        .promo-banner-wrap img {{
            width: 100%;
            display: block;
            border-radius: 16px;
            image-rendering: auto;
            image-rendering: -webkit-optimize-contrast;
            -ms-interpolation-mode: bicubic;
        }}
        .promo-overlay {{
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(0deg, rgba(180,30,30,0.92) 0%, rgba(180,30,30,0.7) 40%, transparent 100%);
            padding: 30px 20px 18px 20px;
            border-bottom-left-radius: 16px;
            border-bottom-right-radius: 16px;
        }}
        .promo-overlay h3 {{
            color: #fff;
            margin: 0 0 4px 0;
            font-size: 1.25rem;
            font-weight: 800;
            text-shadow: 0 2px 8px rgba(0,0,0,0.3);
            letter-spacing: 0.5px;
        }}
        .promo-overlay p {{
            color: rgba(255,255,255,0.9);
            margin: 0;
            font-size: 0.88rem;
            font-weight: 500;
        }}
        @keyframes subtlePulse {{
            0%, 100% {{ box-shadow: 0 8px 30px rgba(0,0,0,0.12); }}
            50% {{ box-shadow: 0 8px 35px rgba(180,30,30,0.25); }}
        }}
        .promo-banner-wrap {{
            animation: subtlePulse 4s ease-in-out infinite;
        }}
        .promo-banner-wrap:hover {{
            animation: none;
        }}
        /* Responsive */
        @media (max-width: 768px) {{
            .promo-overlay {{
                padding: 20px 12px 12px 12px;
            }}
            .promo-overlay h3 {{
                font-size: 1rem;
            }}
            .promo-overlay p {{
                font-size: 0.75rem;
            }}
        }}
        </style>
        <div class="promo-banner-wrap">
            <img src="{banner_b64}" alt="Corralon La Rural - Marcas Líderes">
            <div class="promo-overlay">
                <h3>🏠 Todo para tu Obra en un Solo Lugar</h3>
                <p>Holcim · Amanco · Ferrum · Tersuave · Weber — Orgullosamente afiliados a Disensa</p>
            </div>
        </div>
        """
        try:
            st.html(banner_html)
        except Exception:
            import streamlit.components.v1 as components
            components.html(banner_html, height=450)

    # --- SECCIÓN VIP: ASESORAMIENTO Y MARCAS LÍDERES ---
    with st.container(border=True):
        st.header("🏗️ Asesoramiento Profesional para tu Obra")
        st.markdown("¿No sabés cuánto material necesitás o cuál es el ideal para tu proyecto? Nuestro equipo técnico te ayuda a planificar tu obra desde cero. Corralon La Rural es orgullosa red afiliada a **DISENSA**, garantizando la calidad de marcas líderes.")
        msg_asesoramiento = urllib.parse.quote("Hola La Rural! Necesito asesoramiento profesional para un proyecto. Vengo desde Instagram.")
        link_asesoramiento = f"https://wa.me/{tel_whatsapp}?text={msg_asesoramiento}"
        st.link_button("💬 Consultar con un Asesor de Obra", link_asesoramiento, type="primary", use_container_width=True)

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

                # Mapeo de categorías a imágenes
                cat_imagenes = {
                    '🧱 Obra Gruesa y Materiales': 'cat_obra_gruesa.png',
                    '💧 Plomería y Sanitarios': 'cat_plomeria.png',
                    '⚡ Electricidad': 'cat_electricidad.png',
                    '🛠️ Ferretería y Herramientas': 'cat_ferreteria.png',
                    '📦 General / Otros': 'cat_general.png',
                }

                columnas = st.columns(2)
                
                for i, cat in enumerate(categorias_unicas):
                    with columnas[i % 2]:
                        img_file = cat_imagenes.get(cat, '')
                        img_b64 = get_base64_img(img_file) if img_file else ''
                        
                        # Contar productos de esta categoría
                        n_productos = len(df_catalogo[df_catalogo['CATEGORIA_WEB'] == cat])
                        
                        if img_b64:
                            card_html = f"""
                            <style>
                            .cat-card-{i} {{
                                position: relative;
                                border-radius: 14px;
                                overflow: hidden;
                                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                                transition: all 0.3s ease;
                                cursor: pointer;
                                margin-bottom: 12px;
                            }}
                            .cat-card-{i}:hover {{
                                transform: translateY(-4px);
                                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                            }}
                            .cat-card-{i} .cat-img-wrap {{
                                position: relative;
                                width: 100%;
                                aspect-ratio: 4/3;
                            }}
                            .cat-card-{i} .cat-img-wrap img {{
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                                display: block;
                            }}
                            .cat-card-{i} .cat-overlay {{
                                position: absolute;
                                top: 0;
                                left: 0;
                                right: 0;
                                bottom: 0;
                                background: linear-gradient(
                                    180deg,
                                    rgba(180, 30, 30, 0.35) 0%,
                                    rgba(180, 30, 30, 0.55) 50%,
                                    rgba(120, 15, 15, 0.85) 100%
                                );
                                display: flex;
                                flex-direction: column;
                                justify-content: flex-end;
                                padding: 18px 16px;
                                transition: background 0.3s ease;
                            }}
                            .cat-card-{i}:hover .cat-overlay {{
                                background: linear-gradient(
                                    180deg,
                                    rgba(180, 30, 30, 0.25) 0%,
                                    rgba(180, 30, 30, 0.45) 50%,
                                    rgba(120, 15, 15, 0.75) 100%
                                );
                            }}
                            .cat-card-{i} .cat-name {{
                                font-size: 1.1rem;
                                font-weight: 800;
                                color: #ffffff;
                                margin: 0 0 4px 0;
                                text-shadow: 0 2px 6px rgba(0,0,0,0.4);
                            }}
                            .cat-card-{i} .cat-count {{
                                font-size: 0.8rem;
                                color: rgba(255,255,255,0.85);
                                margin: 0;
                                font-weight: 500;
                            }}
                            @media (max-width: 768px) {{
                                .cat-card-{i} .cat-name {{
                                    font-size: 0.95rem;
                                }}
                                .cat-card-{i} .cat-overlay {{
                                    padding: 12px 10px;
                                }}
                            }}
                            </style>
                            <div class="cat-card-{i}">
                                <div class="cat-img-wrap">
                                    <img src="{img_b64}" alt="{cat}">
                                    <div class="cat-overlay">
                                        <p class="cat-name">{cat}</p>
                                        <p class="cat-count">{n_productos} productos</p>
                                    </div>
                                </div>
                            </div>
                            """
                            st.markdown(card_html, unsafe_allow_html=True)
                        
                        if st.button("Explorar", key=f"cat_{cat}", use_container_width=True):
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
