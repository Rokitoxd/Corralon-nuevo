import streamlit as st

st.markdown('<div id="mi-boton-flotante"></div>', unsafe_allow_html=True)
if st.button("🛒 Revisar Pedido (3)", type="primary"):
    st.write("Abriendo carrito...")

st.markdown("""
<style>
/* Streamlit element containers are siblings */
div:has(> div > div > #mi-boton-flotante) + div button {
    position: fixed !important;
    bottom: 20px !important;
    right: 20px !important;
    padding: 15px 25px !important;
    border-radius: 50px !important;
    box-shadow: 0px 4px 12px rgba(0,0,0,0.3) !important;
    z-index: 999999 !important;
}
</style>
""", unsafe_allow_html=True)
