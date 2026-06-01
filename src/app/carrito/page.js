"use client";

import { useCart } from "@/components/CartContext";
import Link from "next/link";

export default function Carrito() {
  const { cart, removeFromCart, clearCart, updateQuantity, totalItems } = useCart();
  const tel_whatsapp = "5493815139567";

  const enviarWhatsApp = () => {
    let pedido_texto = "Hola Corralon La Rural, Preciso la cotizacion de los siguientes materiales:\n\n";
    cart.forEach(item => {
      pedido_texto += `- ${item.cantidad} u. de ${item.ARTICULO}\n`;
    });

    const msg_codificado = encodeURIComponent(pedido_texto);
    window.open(`https://wa.me/${tel_whatsapp}?text=${msg_codificado}`, "_blank");
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes emptyBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className="page-header">
        <h2>🛒 Mi Pedido</h2>
        <p>Revisá tus productos antes de solicitar cotización por WhatsApp.</p>
      </div>

      {cart.length === 0 ? (
        /* EMPTY STATE */
        <div className="card" style={{
          textAlign: 'center', padding: '60px 32px', maxWidth: '500px', margin: '0 auto',
          animation: 'fadeInUp 0.4s ease-out',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px', animation: 'emptyBounce 2s ease-in-out infinite' }}>
            🛒
          </div>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary)', marginBottom: '8px' }}>
            Tu carrito está vacío
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '1rem' }}>
            Explorá nuestro catálogo para encontrar todo lo que necesitás
          </p>
          <Link href="/catalogo" className="btn" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 28px', borderRadius: '50px', fontSize: '1rem',
          }}>
            🛍️ Ir al Catálogo
          </Link>
        </div>
      ) : (
        <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
          {/* ITEMS COUNT */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
          }}>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>
              {totalItems} artículo{totalItems !== 1 ? 's' : ''} en tu pedido
            </p>
          </div>

          {/* CART ITEMS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {cart.map((item, idx) => (
              <div key={idx} className="card" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 24px', gap: '16px', flexWrap: 'wrap',
              }}>
                {/* Item info */}
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--secondary)', margin: 0, fontWeight: 600 }}>
                    {item.ARTICULO}
                  </h4>
                  {item.CATEGORIA_WEB && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                      {item.CATEGORIA_WEB}
                    </p>
                  )}
                </div>

                {/* Quantity controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    onClick={() => updateQuantity(item.ARTICULO, item.cantidad - 1)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      border: '1px solid var(--border-color)', background: 'var(--bg-color)',
                      cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s', color: 'var(--text-main)',
                    }}
                    aria-label="Disminuir cantidad"
                  >
                    −
                  </button>
                  <span style={{
                    minWidth: '44px', textAlign: 'center', fontWeight: 700,
                    fontSize: '1.05rem', color: 'var(--text-main)',
                  }}>
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.ARTICULO, item.cantidad + 1)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      border: '1px solid var(--border-color)', background: 'var(--bg-color)',
                      cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s', color: 'var(--text-main)',
                    }}
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.ARTICULO)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    border: '1px solid var(--border-color)', background: 'white',
                    cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  aria-label={`Quitar ${item.ARTICULO}`}
                  title="Quitar del pedido"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={clearCart}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 20px', borderRadius: '50px',
                }}
              >
                🗑️ Vaciar Pedido
              </button>
              <Link
                href="/catalogo"
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 20px', borderRadius: '50px',
                }}
              >
                ← Seguir comprando
              </Link>
              <button
                className="btn"
                onClick={enviarWhatsApp}
                style={{
                  flex: 1, minWidth: '220px',
                  backgroundColor: '#25D366', padding: '14px 24px',
                  borderRadius: '50px', fontSize: '1.05rem', fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 12px rgba(37,211,102,0.3)',
                }}
              >
                🟩 Enviar a WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
