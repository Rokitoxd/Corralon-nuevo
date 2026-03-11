import streamlit as st
import pandas as pd
import os

st.set_page_config(page_title="Corralón - Portal de Clientes", layout="centered")

st.title("Bienvenido a Nuestro Corralón 🧱")
st.write("Selecciona cómo prefieres trabajar hoy:")

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
    
    proyecto = st.selectbox(
        "¿Qué tipo de trabajo vas a realizar?", 
        ["Seleccionar proyecto...", "Pared de Ladrillo Hueco (15cm)", "Contrapiso Estándar"]
    )

    if proyecto != "Seleccionar proyecto...":
        metros = st.number_input("Metros Cuadrados (m²):", min_value=1, value=15, step=1)
        st.subheader(f"📋 Estimación para {metros} m²")
        
        if proyecto == "Pared de Ladrillo Hueco (15cm)":
            st.write(f"- 🧱 **Ladrillo Hueco:** {int(metros * 16)} unidades.")
            st.write(f"- 🏗️ **Cemento:** {round(metros * 0.25, 1)} bolsas.")
            st.write(f"- ⏳ **Arena:** {round(metros * 0.04, 2)} m³.")
            
        elif proyecto == "Contrapiso Estándar":
            st.write(f"- 🏗️ **Cemento:** {round(metros * 0.35, 1)} bolsas.")
            st.write(f"- ⏳ **Arena:** {round(metros * 0.05, 2)} m³.")
            st.write(f"- 🪨 **Ripio / Piedra:** {round(metros * 0.05, 2)} m³.")

        st.info("💡 Envíanos esto para que un ingeniero ajuste los cálculos y te ofrezca precio por volumen.")
        msg_obra = f"Hola, necesito asesoramiento para {metros}m2 de {proyecto}."
        link_obra = f"https://wa.me/5493810000000?text={msg_obra.replace(' ', '%20')}"
        st.markdown(f"**[🟢 Enviar a un Ingeniero por WhatsApp]({link_obra})**")


# --- PESTAÑA 2: SUBIR ARCHIVOS (El gancho para obras grandes) ---
with tab_archivos:
    st.header("Cotizaciones Especiales y Obras")
    st.write("¿Ya tienes tu lista de materiales, planilla Excel o plano en PDF? Súbelo aquí y nuestro equipo técnico lo analizará para darte el mejor presupuesto.")
    
    # Formulario de contacto y subida
    nombre_cliente = st.text_input("Tu Nombre o Empresa:")
    telefono_cliente = st.text_input("Teléfono de contacto:")
    
    archivo_subido = st.file_uploader(
        "Arrastra aquí tu Excel, PDF o foto del pedido", 
        type=["pdf", "xls", "xlsx", "csv", "png", "jpg", "jpeg"]
    )
    
    if st.button("📤 Enviar para cotizar"):
        if nombre_cliente and telefono_cliente and archivo_subido:
            # Crear carpeta local si no existe para guardar los presupuestos
            if not os.path.exists("pedidos_recibidos"):
                os.makedirs("pedidos_recibidos")
                
            # Guardar el archivo físicamente en tu servidor/PC
            ruta_guardado = os.path.join("pedidos_recibidos", f"{nombre_cliente}_{archivo_subido.name}")
            with open(ruta_guardado, "wb") as f:
                f.write(archivo_subido.getbuffer())
                
            st.success("✅ ¡Archivo recibido con éxito! Un especialista ya lo tiene en su sistema.")
            
            # Botón de aviso rápido
            msg_archivo = f"Hola, acabo de subir mi planilla de materiales en la web a nombre de {nombre_cliente}. Mi teléfono es {telefono_cliente}. Aguardo cotización."
            link_archivo = f"https://wa.me/5493810000000?text={msg_archivo.replace(' ', '%20')}"
            st.markdown(f"**[🟢 Avisar por WhatsApp que ya enviaste el archivo]({link_archivo})**")
            
        else:
            st.error("⚠️ Por favor, completa tu nombre, teléfono y asegúrate de adjuntar un archivo.")


# --- PESTAÑA 3: CATÁLOGO MINORISTA (Carrito de compras) ---
with tab_minorista:
    st.header("Arma tu pedido rápido")
    st.write("Busca artículos sueltos y envíanos tu pedido.")

    if 'carrito' not in st.session_state:
        st.session_state.carrito = []

    articulos_demo = ["Bolsa de Cemento Loma Negra 50kg", "Cal Hidratada 25kg", "Hierro aletado 8mm x 12m", "Ladrillo Hueco 18x18x33", "Arena (metro cúbico)"]
    
    col1, col2 = st.columns([3, 1])
    with col1:
        producto_elegido = st.selectbox("Buscar artículo:", articulos_demo)
    with col2:
        cantidad = st.number_input("Cant.", min_value=1, value=1, step=1)

    if st.button("➕ Agregar al pedido"):
        st.session_state.carrito.append({"Articulo": producto_elegido, "Cantidad": cantidad})
        st.success(f"Agregado: {cantidad} x {producto_elegido}")

    st.divider()
    
    if st.session_state.carrito:
        st.subheader("Tu Pedido Actual:")
        pedido_texto = "Hola Corralón, quiero encargar lo siguiente:\n\n"
        
        for item in st.session_state.carrito:
            st.write(f"{item['Cantidad']} u. - {item['Articulo']}")
            pedido_texto += f"- {item['Cantidad']} u. de {item['Articulo']}\n"
            
        if st.button("🗑️ Vaciar pedido"):
            st.session_state.carrito = []
            st.rerun()

        import urllib.parse
        msg_codificado = urllib.parse.quote(pedido_texto)
        link_pedido = f"https://wa.me/5493810000000?text={msg_codificado}"
        st.markdown(f"**[🟢 Enviar pedido por WhatsApp]({link_pedido})**")
