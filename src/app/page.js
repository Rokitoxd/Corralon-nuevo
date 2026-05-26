"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/CartContext";
import Link from "next/link";

const CAT_IMAGENES = {
  '🧱 Materiales de Construcción': '/cat_obra_gruesa.png',
  '💧 Plomería': '/cat_plomeria.png',
  '⚡ Electricidad': '/cat_electricidad.png',
  '🛠️ Ferretería': '/cat_ferreteria.png',
  '🎨 Pintura': '/cat_general.png',
  '📦 General / Otros': '/cat_general.png',
  '⚙️ Hierros y Chapas': '/cat_hierros_chapas.png',
};

const BRANDS = ['Holcim', 'Amanco', 'Ferrum', 'Tersuave', 'Weber'];

export default function Home() {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [quantities, setQuantities] = useState({});
  const [toast, setToast] = useState({ show: false, message: "" });

  const tel_whatsapp = "5493815139567";

  useEffect(() => {
    fetch("/api/catalogo")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const onlyOfertas = data.filter((item) => item.CATEGORIA_WEB === "🔥 Ofertas");
          setOfertas(onlyOfertas);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2000);
  };

  const handleAdd = (item) => {
    const qty = quantities[item.ARTICULO] || 1;
    addToCart(item, qty);
    showToast(`✓ Agregado: ${qty} × ${item.ARTICULO}`);
  };

  const handleQtyChange = (art, val) => {
    setQuantities((prev) => ({ ...prev, [art]: parseInt(val) || 1 }));
  };

  return (
    <>
      <style>{`
        @keyframes heroGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(37, 211, 102, 0); }
        }
      `}</style>

      {/* HERO SECTION */}
      <section style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        background: 'linear-gradient(135deg, #7f0000 0%, #b71c1c 30%, #e53935 60%, #b71c1c 100%)',
        backgroundSize: '300% 300%',
        animation: 'heroGradient 8s ease infinite',
        padding: '80px 20px',
        textAlign: 'center',
        color: 'white',
        marginTop: '-30px',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeInUp 0.8s ease-out' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>
            Todo para tu obra en un solo lugar
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', opacity: 0.9, marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
            Materiales de construcción, ferretería, plomería y más. Envíos a toda la provincia de Tucumán.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/catalogo" style={{
              background: 'white',
              color: '#b71c1c',
              padding: '14px 32px',
              borderRadius: '50px',
              fontWeight: 700,
              fontSize: '1.05rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'inline-block',
            }}>
              Ver Catálogo
            </Link>
            <a href={`https://wa.me/${tel_whatsapp}`} target="_blank" rel="noopener noreferrer" style={{
              background: '#25D366',
              color: 'white',
              padding: '14px 32px',
              borderRadius: '50px',
              fontWeight: 700,
              fontSize: '1.05rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'pulseGlow 2s infinite',
            }}>
              💬 Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* CÓMO COMPRAR */}
      <section style={{ marginTop: '60px', marginBottom: '60px' }}>
        <div className="page-header">
          <h2>¿Cómo comprar?</h2>
          <p>3 pasos simples para hacer tu pedido</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {[
            { step: 1, emoji: '🛒', title: 'Elegí tus materiales', desc: 'Navegá el catálogo y agregá productos a tu pedido.' },
            { step: 2, emoji: '📋', title: 'Revisá tu pedido', desc: 'Verificá cantidades y materiales en tu carrito.' },
            { step: 3, emoji: '📱', title: 'Envialo por WhatsApp', desc: 'Enviá tu lista completa y un asesor te contactará.' },
          ].map(({ step, emoji, title, desc }) => (
            <div className="card" key={step} style={{ textAlign: 'center', padding: '32px 24px', position: 'relative' }}>
              <div style={{
                position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--primary)', color: 'white', width: '28px', height: '28px',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 700,
              }}>
                {step}
              </div>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{emoji}</div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--secondary)', marginBottom: '8px' }}>{title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ASESORAMIENTO PROFESIONAL */}
      <section style={{ marginBottom: '60px' }}>
        <div className="card" style={{
          display: 'flex', gap: '24px', alignItems: 'center', padding: '32px',
          borderLeft: '4px solid var(--primary)', flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: '3.5rem', flexShrink: 0 }}>👷</div>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary)', marginBottom: '8px' }}>
              Asesoramiento Profesional Gratuito
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
              Nuestro equipo de asesores te ayuda a calcular materiales, elegir la mejor opción para tu obra
              y optimizar tu presupuesto. Sin compromiso.
            </p>
            <a href={`https://wa.me/${tel_whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="btn" style={{ backgroundColor: '#25D366', display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '50px' }}>
              💬 Hablar con un asesor
            </a>
          </div>
        </div>
      </section>

      {/* OFERTAS DESTACADAS */}
      <section style={{ marginBottom: '60px' }}>
        <div className="page-header">
          <h2>🔥 Ofertas Destacadas</h2>
          <p>Los mejores precios para tu obra, por tiempo limitado.</p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ padding: '24px' }}>
                <div style={{ height: '20px', background: '#e9ecef', borderRadius: '8px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '14px', background: '#e9ecef', borderRadius: '6px', width: '60%' }} />
              </div>
            ))}
          </div>
        ) : ofertas.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>No hay productos en oferta en este momento.</p>
          </div>
        ) : (
          <div className="grid">
            {ofertas.map((item, idx) => (
              <div className="card item-card" key={idx} style={{ padding: '24px' }}>
                <div>
                  <div style={{
                    display: 'inline-block', background: '#fff3e0', color: '#e65100',
                    padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '12px',
                  }}>
                    🔥 Oferta
                  </div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--secondary)', marginBottom: '0' }}>{item.ARTICULO}</h3>
                </div>
                <div className="actions" style={{ marginTop: '16px' }}>
                  <input
                    type="number"
                    min="1"
                    value={quantities[item.ARTICULO] || 1}
                    onChange={(e) => handleQtyChange(item.ARTICULO, e.target.value)}
                    aria-label={`Cantidad de ${item.ARTICULO}`}
                  />
                  <button className="btn" onClick={() => handleAdd(item)}>
                    Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* NUESTRAS CATEGORÍAS */}
      <section style={{ marginBottom: '60px' }}>
        <div className="page-header">
          <h2>Nuestras Categorías</h2>
          <p>Explorá nuestra amplia variedad de productos</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {Object.entries(CAT_IMAGENES).map(([cat, img]) => (
            <Link href="/catalogo" key={cat} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ position: 'relative', height: '160px', backgroundColor: '#eee' }}>
                  <img
                    src={img}
                    alt={cat}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '14px 16px',
                    background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
                    color: 'white',
                  }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>{cat}</h4>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BRAND TRUST BAR */}
      <section style={{
        width: '100vw', marginLeft: 'calc(-50vw + 50%)',
        background: 'var(--bg-color)', padding: '48px 20px', textAlign: 'center',
        borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)',
        marginBottom: '-50px',
      }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)', marginBottom: '20px', fontWeight: 600 }}>
          Trabajamos con las mejores marcas
        </h3>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
          {BRANDS.map(brand => (
            <span key={brand} style={{
              background: 'white', border: '1px solid var(--border-color)',
              padding: '8px 20px', borderRadius: '50px', fontWeight: 600,
              color: 'var(--secondary)', fontSize: '0.95rem',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {brand}
            </span>
          ))}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Orgullosamente afiliados a <strong style={{ color: 'var(--primary)' }}>Disensa</strong>
        </p>
      </section>

      {/* TOAST */}
      {toast.show && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          background: 'var(--success)', color: 'white',
          padding: '16px 28px', borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          fontWeight: 600, fontSize: '0.95rem',
          animation: 'fadeInUp 0.3s ease-out',
        }}>
          {toast.message}
        </div>
      )}
    </>
  );
}
