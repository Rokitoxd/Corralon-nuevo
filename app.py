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

# --- AUTO-COLAPSAR SIDEBAR EN CELULAR ---
import streamlit.components.v1 as components
components.html("""
<script>
(function() {
    function collapseSidebar() {
        if (window.innerWidth <= 768) {
            var parent = window.parent.document;
            var sidebar = parent.querySelector('[data-testid="stSidebar"]');
            if (sidebar && sidebar.getAttribute('aria-expanded') === 'true') {
                var btn = parent.querySelector('[data-testid="stSidebar"] button[data-testid="stBaseButton-headerNoPadding"]');
                if (btn) { btn.click(); return true; }
                btn = parent.querySelector('button[aria-label="Close sidebar"]');
                if (btn) { btn.click(); return true; }
                sidebar.setAttribute('aria-expanded', 'false');
                return true;
            }
        }
        return false;
    }
    var tries = 0;
    var interval = setInterval(function() {
        if (collapseSidebar() || tries > 15) clearInterval(interval);
        tries++;
    }, 200);
})();
</script>
""", height=0)

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

    # 2. Conversión de Venta a numérico
    if '$ VENTA1' in df.columns:
        df['$ VENTA1'] = pd.to_numeric(df['$ VENTA1'], errors='coerce').fillna(0)

    # 3. Conversión de Stock a numérico
    stock_col = next((col for col in df.columns if 'STOCK' in str(col).upper() or 'CANT' in str(col).upper()), 'Stock')
    if stock_col in df.columns:
        df[stock_col] = pd.to_numeric(df[stock_col], errors='coerce').fillna(0)

    if 'ARTICULO' in df.columns:
        df['ARTICULO'] = df['ARTICULO'].fillna('').astype(str)
        
        # 4. Formato de nombres limpios (Title Case y unidades correctas)
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
    if 'CATEGORIA_WEB' in df.columns:
        columnas_guardar.append('CATEGORIA_WEB')
    if 'SUBCATEGORIA_WEB' in df.columns:
        columnas_guardar.append('SUBCATEGORIA_WEB')
    if stock_col in df.columns:
        columnas_guardar.append(stock_col)
        
    df_clean = df[columnas_guardar].copy()
    df_clean = df_clean[(df_clean['ARTICULO'] != 'nan') & (df_clean['ARTICULO'] != '')]
    
    if 'CATEGORIA_WEB' not in df_clean.columns:
        df_clean['CATEGORIA_WEB'] = '📦 General / Otros'
    if 'SUBCATEGORIA_WEB' not in df_clean.columns:
        df_clean['SUBCATEGORIA_WEB'] = 'Otros'
        
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

# --- META PIXEL ---
# Reemplazar con ID real del cliente
PIXEL_ID = "1234567890"
pixel_html = f"""
<script>
  !function(f,b,e,v,n,t,s)
  {{if(f.fbq)return;n=f.fbq=function(){{n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)}};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '{PIXEL_ID}');
  fbq('track', 'PageView');
  
  document.addEventListener('click', function(e) {{
      var target = e.target.closest('a');
      if (target && target.href.includes('wa.me')) {{
          fbq('track', 'Lead');
      }}
  }});
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id={PIXEL_ID}&ev=PageView&noscript=1"/></noscript>
"""
components.html(pixel_html, height=0)

if 'carrito' not in st.session_state: st.session_state.carrito = []
if 'categoria_actual' not in st.session_state: st.session_state.categoria_actual = None
if 'subcategoria_actual' not in st.session_state: st.session_state.subcategoria_actual = None
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
tab_ofertas, tab_minorista, tab_proyectos, tab_archivos, tab_admin = st.tabs([
    "🔥 Ofertas",
    "🛒 Catálogo Minorista",
    "🏗️ Calculadora de Obra", 
    "📂 Enviar Planilla", 
    "🔒 Intranet / Admin"
])

# --- PESTAÑA 0: OFERTAS ---
with tab_ofertas:
    st.header("🔥 Ofertas Destacadas")
    st.info("Espacio reservado para el carrusel de imágenes de ofertas. Los productos en oferta se destacarán aquí.")
    if not df_catalogo.empty:
        df_ofertas = df_catalogo[df_catalogo['CATEGORIA_WEB'] == '🔥 Ofertas']
        if df_ofertas.empty:
            st.warning("No hay productos en oferta en este momento.")
        else:
            buscar_oferta = st.text_input("🔍 Filtrar ofertas:", key="busqueda_ofertas_tab").strip().lower()
            if buscar_oferta:
                df_ofertas = df_ofertas[df_ofertas['ARTICULO'].str.lower().str.contains(buscar_oferta, na=False)]
                
            st.divider()
            
            for index, row in df_ofertas.iterrows():
                articulo = row['ARTICULO']
                with st.container(border=True):
                    c_nombre, c_input, c_btn = st.columns([5, 2, 2], vertical_alignment="bottom")
                    with c_nombre:
                        st.write(f"**{articulo}**")
                    input_key = f"cant_{index}_oferta"
                    with c_input:
                        cant = st.number_input("Cant.", min_value=1, value=1, step=1, key=input_key, label_visibility="collapsed")
                    with c_btn:
                        if st.button("➕", key=f"btn_{index}_oferta", width='stretch'):
                            st.session_state.carrito.append({"Articulo": str(articulo), "Cantidad": int(cant)})
                            st.rerun()

# --- FUNCIONES AUXILIARES PARA CALCULADORA ---
def verificar_stock_material(df, keywords):
    """Busca si existe un material en el catálogo con stock > 0.
    keywords: lista de palabras que TODAS deben estar en el nombre del artículo.
    Retorna (tiene_stock, nombre_encontrado)"""
    if df.empty:
        return False, ""
    mask = pd.Series([True] * len(df), index=df.index)
    for kw in keywords:
        mask = mask & df['ARTICULO'].str.upper().str.contains(kw.upper(), na=False)
    matches = df[mask]
    if not matches.empty:
        return True, matches.iloc[0]['ARTICULO']
    return False, ""

def render_material_line(nombre, cantidad, unidad, emoji, tiene_stock):
    """Renderiza una línea de material con indicador visual de stock."""
    if tiene_stock:
        st.markdown(f"""
        <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:#f0faf0;border-left:4px solid #4CAF50;border-radius:6px;margin-bottom:6px;">
            <span style="font-size:1.3rem;">{emoji}</span>
            <span style="flex:1;font-weight:600;color:#1a1a1a;">{nombre}</span>
            <span style="background:#4CAF50;color:white;padding:3px 10px;border-radius:12px;font-weight:700;font-size:0.9rem;">{cantidad} {unidad}</span>
            <span style="color:#4CAF50;font-size:0.75rem;font-weight:600;">✓ En Stock</span>
        </div>""", unsafe_allow_html=True)
    else:
        st.markdown(f"""
        <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:#f5f5f5;border-left:4px solid #ccc;border-radius:6px;margin-bottom:6px;opacity:0.4;">
            <span style="font-size:1.3rem;">{emoji}</span>
            <span style="flex:1;font-weight:600;color:#999;text-decoration:line-through;">{nombre}</span>
            <span style="background:#ccc;color:white;padding:3px 10px;border-radius:12px;font-weight:700;font-size:0.9rem;">{cantidad} {unidad}</span>
            <span style="color:#e53935;font-size:0.75rem;font-weight:700;">⚠️ Sin Stock</span>
        </div>""", unsafe_allow_html=True)

# --- PESTAÑA 1: LA CALCULADORA DE OBRAS ---
with tab_proyectos:
    st.header("🧮 Calculadora de Materiales")
    st.write("Seleccioná tu proyecto, ingresá los metros cuadrados y obtené una estimación de materiales al instante. Los materiales sin stock aparecen deshabilitados.")

    # CSS para las tarjetas de calculadoras
    st.markdown("""
    <style>
    .calc-card {
        background: white;
        border: 1px solid #e8e8e8;
        border-radius: 12px;
        padding: 18px;
        margin-bottom: 10px;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    .calc-card:hover {
        border-color: #b71c1c;
        box-shadow: 0 4px 15px rgba(183,28,28,0.12);
        transform: translateY(-2px);
    }
    .calc-card h4 {
        margin: 0 0 4px 0;
        color: #2c3e50;
        font-size: 1rem;
    }
    .calc-card p {
        margin: 0;
        color: #7f8c8d;
        font-size: 0.82rem;
    }
    .resultados-header {
        background: linear-gradient(135deg, #b71c1c 0%, #d32f2f 100%);
        color: white;
        padding: 14px 20px;
        border-radius: 10px;
        margin-bottom: 12px;
        text-align: center;
    }
    .resultados-header h3 { margin: 0; font-size: 1.1rem; }
    .resultados-header p { margin: 4px 0 0 0; font-size: 0.85rem; opacity: 0.9; }
    </style>
    """, unsafe_allow_html=True)
    
    opciones_proyecto = [
        "Seleccionar proyecto...", 
        "🧱 Pared de Ladrillo Hueco 18x18x33", 
        "🧱 Pared de Ladrillo Hueco 12x18x33", 
        "🏗️ Contrapiso Estándar",
        "📐 Carpeta de Nivelación",
        "🏠 Revoque Grueso (Jaharro)",
        "✨ Revoque Fino",
        "🏢 Losa / Cubierta de Hormigón",
        "💧 Impermeabilización con Membrana"
    ]
    
    proyecto = st.selectbox("¿Qué tipo de trabajo vas a realizar?", opciones_proyecto, key="calc_proyecto")

    if proyecto != "Seleccionar proyecto...":
        metros = st.number_input("Metros Cuadrados (m²):", min_value=1, value=15, step=1, key="calc_metros")
        
        st.markdown(f"""
        <div class="resultados-header">
            <h3>📋 Estimación para {metros} m²</h3>
            <p>{proyecto}</p>
        </div>
        """, unsafe_allow_html=True)

        # Definir materiales según proyecto
        materiales = []  # Lista de tuplas: (nombre, cantidad, unidad, emoji, keywords_busqueda)
        
        if proyecto == "🧱 Pared de Ladrillo Hueco 18x18x33":
            materiales = [
                ("Ladrillo Hueco 18x18x33", int(metros * 16), "u.", "🧱", ["LADRILLO", "HUECO", "18"]),
                ("Cemento Holcim x 25kg", round(metros * 0.60, 1), "bol.", "🏗️", ["CEMENTO", "HOLCIM", "25"]),
                ("Arena Mediana x m³", round(metros * 0.05, 2), "m³", "⏳", ["ARENA"]),
                ("Cal Hidratada x 25kg", round(metros * 0.15, 1), "bol.", "⚪", ["CAL"]),
            ]
        
        elif proyecto == "🧱 Pared de Ladrillo Hueco 12x18x33":
            materiales = [
                ("Ladrillo Hueco 12x18x33", int(metros * 16), "u.", "🧱", ["LADRILLO", "HUECO", "12"]),
                ("Cemento Holcim x 25kg", round(metros * 0.60, 1), "bol.", "🏗️", ["CEMENTO", "HOLCIM", "25"]),
                ("Arena Mediana x m³", round(metros * 0.05, 2), "m³", "⏳", ["ARENA"]),
                ("Cal Hidratada x 25kg", round(metros * 0.15, 1), "bol.", "⚪", ["CAL"]),
            ]
        
        elif proyecto == "🏗️ Contrapiso Estándar":
            materiales = [
                ("Cemento Holcim x 25kg", round(metros * 0.70, 1), "bol.", "🏗️", ["CEMENTO", "HOLCIM", "25"]),
                ("Arena Mediana x m³", round(metros * 0.05, 2), "m³", "⏳", ["ARENA"]),
                ("Piedra / Ripio x m³", round(metros * 0.05, 2), "m³", "🪨", ["PIEDRA"]),
            ]
        
        elif proyecto == "📐 Carpeta de Nivelación":
            materiales = [
                ("Cemento Holcim x 25kg", round(metros * 0.50, 1), "bol.", "🏗️", ["CEMENTO", "HOLCIM", "25"]),
                ("Arena Mediana x m³", round(metros * 0.03, 2), "m³", "⏳", ["ARENA"]),
            ]
        
        elif proyecto == "🏠 Revoque Grueso (Jaharro)":
            materiales = [
                ("Cemento Holcim x 25kg", round(metros * 0.40, 1), "bol.", "🏗️", ["CEMENTO", "HOLCIM", "25"]),
                ("Arena Mediana x m³", round(metros * 0.03, 2), "m³", "⏳", ["ARENA"]),
                ("Cal Hidratada x 25kg", round(metros * 0.10, 1), "bol.", "⚪", ["CAL"]),
            ]
        
        elif proyecto == "✨ Revoque Fino":
            materiales = [
                ("Cal Hidratada x 25kg", round(metros * 0.15, 1), "bol.", "⚪", ["CAL"]),
                ("Arena Fina x m³", round(metros * 0.02, 2), "m³", "⏳", ["ARENA"]),
                ("Cemento Holcim x 25kg", round(metros * 0.10, 1), "bol.", "🏗️", ["CEMENTO", "HOLCIM", "25"]),
            ]
        
        elif proyecto == "🏢 Losa / Cubierta de Hormigón":
            espesor = st.selectbox("Espesor de la losa:", ["10 cm (estándar)", "12 cm", "15 cm"], key="calc_espesor")
            factor_espesor = {"10 cm (estándar)": 1.0, "12 cm": 1.2, "15 cm": 1.5}[espesor]
            materiales = [
                ("Cemento Holcim x 25kg", round(metros * 1.00 * factor_espesor, 1), "bol.", "🏗️", ["CEMENTO", "HOLCIM", "25"]),
                ("Arena Mediana x m³", round(metros * 0.065 * factor_espesor, 2), "m³", "⏳", ["ARENA"]),
                ("Piedra / Ripio x m³", round(metros * 0.085 * factor_espesor, 2), "m³", "🪨", ["PIEDRA"]),
                ("Hierro Aletado 8mm x 12m", int(metros * 1.8 * factor_espesor), "barras", "🔩", ["HIERRO"]),
                ("Malla / Alambre", round(metros * 1.1, 1), "m²", "🔗", ["MALLA"]),
            ]
        
        elif proyecto == "💧 Impermeabilización con Membrana":
            materiales = [
                ("Membrana Asfáltica x rollo", round(metros * 1.1 / 10, 1), "rollos", "🛡️", ["MEMBRANA"]),
                ("Pintura Asfáltica (imprimación)", round(metros * 0.3 / 4, 1), "latas", "🖌️", ["PINTURA", "ASFALT"]),
            ]

        # Verificar stock y renderizar materiales
        texto_pedido_obra = f"Hola Corralon La Rural, usé la calculadora web y necesito presupuesto para {metros}m² de {proyecto}.\n\nMateriales sugeridos:\n"
        hay_todo_en_stock = True
        hay_algo_en_stock = False

        with st.container(border=True):
            for nombre, cantidad, unidad, emoji, keywords in materiales:
                tiene_stock, nombre_real = verificar_stock_material(df_catalogo, keywords)
                render_material_line(nombre, cantidad, unidad, emoji, tiene_stock)
                
                nombre_mostrar = nombre_real if nombre_real else nombre
                texto_pedido_obra += f"- {cantidad} {unidad} de {nombre_mostrar}\n"
                
                if not tiene_stock:
                    hay_todo_en_stock = False
                else:
                    hay_algo_en_stock = True

        # Mensaje de disponibilidad
        if hay_todo_en_stock:
            st.success("✅ ¡Todos los materiales están disponibles en nuestro stock!")
        elif hay_algo_en_stock:
            st.warning("⚠️ Algunos materiales no están en stock actualmente. Consultanos para alternativas.")
        else:
            st.error("❌ Los materiales de esta calculadora no están en stock actualmente. Consultanos igualmente para encargos.")

        st.info("💡 Envíanos esta estimación para que un asesor ajuste los cálculos y te ofrezca el mejor precio.")
        link_obra = f"https://wa.me/{tel_whatsapp}?text={urllib.parse.quote(texto_pedido_obra)}"
        st.link_button("🟢 Consultar Presupuesto por WhatsApp", link_obra, type="primary", use_container_width=True)

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
                categorias_unicas = [cat for cat in sorted(df_catalogo['CATEGORIA_WEB'].unique().tolist()) if cat != '🔥 Ofertas']

                # Mapeo de categorías a imágenes
                cat_imagenes = {
                    '🧱 Materiales de Construcción': 'cat_obra_gruesa.png',
                    '💧 Plomería': 'cat_plomeria.png',
                    '⚡ Electricidad': 'cat_electricidad.png',
                    '🛠️ Ferretería': 'cat_ferreteria.png',
                    '🎨 Pintura': 'cat_general.png', # Placeholder
                    '📦 General / Otros': 'cat_general.png',
                    '⚙️ Hierros y Chapas': 'cat_hierros_chapas.png',
                }

                cat_principal = '🧱 Materiales de Construcción'
                
                if cat_principal in categorias_unicas:
                    img_file = cat_imagenes.get(cat_principal, '')
                    img_b64 = get_base64_img(img_file) if img_file else ''
                    n_productos = len(df_catalogo[df_catalogo['CATEGORIA_WEB'] == cat_principal])
                    
                    if img_b64:
                        card_html_principal = f"""
                        <style>
                        .cat-card-principal {{
                            position: relative;
                            border-radius: 14px;
                            overflow: hidden;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                            transition: all 0.3s ease;
                            cursor: pointer;
                            margin-bottom: 12px;
                        }}
                        .cat-card-principal:hover {{
                            transform: translateY(-4px);
                            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                        }}
                        .cat-card-principal .cat-img-wrap {{
                            position: relative;
                            width: 100%;
                            aspect-ratio: 21/9;
                        }}
                        .cat-card-principal .cat-img-wrap img {{
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            display: block;
                        }}
                        .cat-card-principal .cat-overlay {{
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
                            padding: 24px 20px;
                            transition: background 0.3s ease;
                        }}
                        .cat-card-principal:hover .cat-overlay {{
                            background: linear-gradient(
                                180deg,
                                rgba(180, 30, 30, 0.25) 0%,
                                rgba(180, 30, 30, 0.45) 50%,
                                rgba(120, 15, 15, 0.75) 100%
                            );
                        }}
                        .cat-card-principal .cat-name {{
                            font-size: 1.6rem;
                            font-weight: 800;
                            color: #ffffff;
                            margin: 0 0 4px 0;
                            text-shadow: 0 2px 6px rgba(0,0,0,0.4);
                        }}
                        .cat-card-principal .cat-count {{
                            font-size: 1rem;
                            color: rgba(255,255,255,0.85);
                            margin: 0;
                            font-weight: 500;
                        }}
                        @media (max-width: 768px) {{
                            .cat-card-principal .cat-name {{
                                font-size: 1.2rem;
                            }}
                            .cat-card-principal .cat-overlay {{
                                padding: 16px 12px;
                            }}
                            .cat-card-principal .cat-img-wrap {{
                                aspect-ratio: 16/9;
                            }}
                        }}
                        </style>
                        <div class="cat-card-principal">
                            <div class="cat-img-wrap">
                                <img src="{img_b64}" alt="{cat_principal}">
                                <div class="cat-overlay">
                                    <p class="cat-name">{cat_principal}</p>
                                    <p class="cat-count">{n_productos} productos principales</p>
                                </div>
                            </div>
                        </div>
                        """
                        st.markdown(card_html_principal, unsafe_allow_html=True)
                    
                    if st.button("Explorar Materiales Principales", key=f"cat_{cat_principal}", use_container_width=True):
                        st.session_state.categoria_actual = cat_principal
                        st.rerun()

                    st.markdown("<br>", unsafe_allow_html=True)

                categorias_secundarias = [c for c in categorias_unicas if c != cat_principal]
                columnas = st.columns(2)
                
                for i, cat in enumerate(categorias_secundarias):
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
                subcat_actual = st.session_state.subcategoria_actual
                
                col_titulo, col_volver = st.columns([3, 1], vertical_alignment="center")
                with col_titulo:
                    if subcat_actual:
                        st.header(f"{cat_actual} > {subcat_actual}")
                    else:
                        st.header(cat_actual)
                with col_volver:
                    if st.button("🔙 Volver"):
                        if subcat_actual:
                            st.session_state.subcategoria_actual = None
                        else:
                            st.session_state.categoria_actual = None
                        st.rerun()
                
                # Obtener subcategorías reales de la base de datos
                subcategorias_reales = sorted(df_catalogo[df_catalogo['CATEGORIA_WEB'] == cat_actual]['SUBCATEGORIA_WEB'].unique().tolist())
                
                # Si la categoría tiene subcategorías y no hemos elegido ninguna
                if subcategorias_reales and subcat_actual is None and len(subcategorias_reales) > 0:
                    # Si solo hay una subcategoría llamada "Otros", saltarla e ir directo a los productos
                    if len(subcategorias_reales) == 1 and subcategorias_reales[0] == "Otros":
                        st.session_state.subcategoria_actual = "Otros"
                        st.rerun()
                    else:
                        st.write("Selecciona una subcategoría:")
                        cols_sub = st.columns(2)
                        for i, sub in enumerate(subcategorias_reales):
                            with cols_sub[i % 2]:
                                if st.button(sub, use_container_width=True, key=f"sub_{i}_{cat_actual}"):
                                    st.session_state.subcategoria_actual = sub
                                    st.rerun()
                        st.divider()
                else:
                    # Mostrar productos
                    df_cat = df_catalogo[df_catalogo['CATEGORIA_WEB'] == cat_actual]
                    
                    if subcat_actual:
                        df_cat = df_cat[df_cat['SUBCATEGORIA_WEB'] == subcat_actual]
                        
                    if cat_actual == '🧱 Materiales de Construcción' and subcat_actual == 'Aridos':
                        st.write("Seleccioná el tipo de árido y el formato de venta:")
                        
                        col_tipo, col_formato = st.columns(2)
                        with col_tipo:
                            tipo_arido = st.radio("Tipo de Árido", ["Arena Mediana", "Ripio Bruto", "Ripio Lavado"], key="radio_tipo_arido")
                        with col_formato:
                            formato_arido = st.radio("Formato", ["x Bolsa", "por m3"], key="radio_formato_arido")
                            
                        # Mapear la selección a artículos de la base de datos
                        mapeo = {
                            ("Arena Mediana", "x Bolsa"): "ARENA MEDIANA X BOLSA",
                            ("Arena Mediana", "por m3"): "ARENA MEDIANA  X M3",
                            ("Ripio Bruto", "x Bolsa"): "RIPIO BRUTO X BOLSA",
                            ("Ripio Bruto", "por m3"): "RIPIO BRUTO FINO X M3",
                            ("Ripio Lavado", "x Bolsa"): "RIPIO LAVADO 1 - 3 X BOLSA",
                            ("Ripio Lavado", "por m3"): "RIPIO LAVADO 1 - 3 X M3"
                        }
                        
                        articulo_buscar = mapeo.get((tipo_arido, formato_arido))
                        df_filtrado = df_cat[df_cat['ARTICULO'].str.contains(articulo_buscar, case=False, na=False, regex=False)]
                        
                        st.divider()
                        
                        if not df_filtrado.empty:
                            for index, row in df_filtrado.iterrows():
                                articulo = row['ARTICULO']
                                with st.container(border=True):
                                    c_nombre, c_input, c_btn = st.columns([5, 2, 2], vertical_alignment="bottom")
                                    with c_nombre:
                                        st.write(f"**{articulo}**")
                                    input_key = f"cant_arido_{index}"
                                    with c_input:
                                        cant = st.number_input("Cant.", min_value=1, value=1, step=1, key=input_key, label_visibility="collapsed")
                                    with c_btn:
                                        if st.button("➕", key=f"btn_arido_{index}", width='stretch'):
                                            st.session_state.carrito.append({"Articulo": str(articulo), "Cantidad": int(cant)})
                                            st.rerun()
                        else:
                            st.warning("El formato seleccionado no se encuentra disponible actualmente.")

                    else:
                        buscar_prod = st.text_input("🔍 Filtrar dentro de esta sección:", key=f"busqueda_{cat_actual}_{subcat_actual}").strip().lower()
                        if buscar_prod:
                            df_cat = df_cat[df_cat['ARTICULO'].str.lower().str.contains(buscar_prod, na=False)]
                            
                        st.divider()

                        for index, row in df_cat.iterrows():
                            articulo = row['ARTICULO']
                            with st.container(border=True):
                                c_nombre, c_input, c_btn = st.columns([5, 2, 2], vertical_alignment="bottom")
                                with c_nombre:
                                    st.write(f"**{articulo}**")
                                input_key = f"cant_{index}_{cat_actual}"
                                with c_input:
                                    cant = st.number_input("Cant.", min_value=1, value=1, step=1, key=input_key, label_visibility="collapsed")
                                with c_btn:
                                    if st.button("➕", key=f"btn_{index}_{cat_actual}", width='stretch'):
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
