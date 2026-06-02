"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/CartContext";
import Link from "next/link";



export default function Home() {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [quantities, setQuantities] = useState({});
  const [toast, setToast] = useState({ show: false, message: "" });

  const tel_whatsapp = "5493815156321";

  useEffect(() => {
    let retries = 0;
    const fetchData = () => {
      fetch("/api/catalogo")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            const onlyOfertas = data.filter((item) => item.CATEGORIA_WEB === "🔥 Ofertas");
            setOfertas(onlyOfertas);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Fetch attempt failed:', err);
          retries++;
          if (retries < 3) {
            setTimeout(fetchData, 1500);
          } else {
            setLoading(false);
          }
        });
    };
    fetchData();
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
        backgroundImage: 'linear-gradient(rgba(127, 0, 0, 0.82), rgba(26, 26, 46, 0.95)), url("/storefront_larural.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '120px 20px',
        textAlign: 'center',
        color: 'white',
        marginTop: '-30px',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeInUp 0.8s ease-out' }}>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            Todo para tu obra en un solo lugar
          </h1>
          <p style={{ fontSize: 'clamp(1.05rem, 2.5vw, 1.3rem)', opacity: 0.95, marginBottom: '32px', maxWidth: '650px', margin: '0 auto 32px', textShadow: '0 1px 5px rgba(0,0,0,0.3)' }}>
            Materiales de construcción, ferretería, plomería y más. Envíos con flota propia a toda la provincia de Tucumán.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/planilla" style={{
              background: 'white',
              color: '#b71c1c',
              padding: '14px 32px',
              borderRadius: '50px',
              fontWeight: 700,
              fontSize: '1.05rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
            }}>
              📄 Envía tu imagen o documento para asesorarte
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
              boxShadow: '0 4px 15px rgba(37,211,102,0.3)'
            }}>
              💬 Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* SECCIÓN INSTRUCTIVA — 4 Tarjetas Principales */}
      <style>{`
        .instructive-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-top: 48px;
          margin-bottom: 48px;
        }
        .instructive-card {
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-md);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          background: var(--surface-color);
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
        }
        .instructive-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.12);
        }
        .instructive-card img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          display: block;
        }
        .instructive-card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .instructive-card-body h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--secondary);
          margin: 0 0 8px;
        }
        .instructive-card-body p {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0 0 16px;
          line-height: 1.5;
          flex: 1;
        }
        .instructive-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.82rem;
          transition: opacity 0.2s;
          align-self: flex-start;
        }
        @media (max-width: 1024px) {
          .instructive-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }
        @media (max-width: 600px) {
          .instructive-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .instructive-card img {
            height: 160px;
          }
        }
      `}</style>
      <section>
        <div className="instructive-grid">
          {/* Card 1: Envía tu documento */}
          <Link href="/planilla" className="instructive-card">
            <img src="/asesor_planilla.png" alt="Asesor revisando tu planilla de materiales" />
            <div className="instructive-card-body">
              <h3>📄 Envía tu imagen o documento para asesorarte</h3>
              <p>Subí tu planilla de materiales, foto del presupuesto o cualquier documento y nuestro equipo lo revisará para darte la mejor cotización.</p>
              <span className="instructive-badge" style={{ background: 'rgba(192, 22, 14, 0.08)', color: '#b71c1c' }}>
                Subir Documento →
              </span>
            </div>
          </Link>

          {/* Card 2: Consultá por WhatsApp */}
          <a href={`https://wa.me/${tel_whatsapp}`} target="_blank" rel="noopener noreferrer" className="instructive-card">
            <img src="/whatsapp_instructivo.png" alt="Enviar consulta por WhatsApp" />
            <div className="instructive-card-body">
              <h3>💬 Consultá por WhatsApp</h3>
              <p>Envianos una foto de tu lista de materiales, plano o consulta directamente con un asesor. Respuesta inmediata en horario comercial.</p>
              <span className="instructive-badge" style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#128C7E' }}>
                Abrir WhatsApp →
              </span>
            </div>
          </a>

          {/* Card 3: Calculadora de Materiales */}
          <Link href="/calculadora" className="instructive-card">
            <img src="/calculadora_instructivo.png" alt="Calculadora de materiales de construcción" />
            <div className="instructive-card-body">
              <h3>🧮 Calculadora de Materiales</h3>
              <p>Ingresá las medidas de tu proyecto y obtené una estimación instantánea de los materiales necesarios para tu obra.</p>
              <span className="instructive-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#b45309' }}>
                Calcular Materiales →
              </span>
            </div>
          </Link>

          {/* Card 4: Ver Catálogo */}
          <Link href="/catalogo" className="instructive-card">
            <img src="/cat_obra_gruesa.png" alt="Catálogo de materiales de construcción" />
            <div className="instructive-card-body">
              <h3>🛒 Ver Catálogo Completo</h3>
              <p>Explorá nuestro catálogo completo de materiales de construcción, ferretería, plomería, electricidad y más.</p>
              <span className="instructive-badge" style={{ background: 'rgba(192, 22, 14, 0.08)', color: '#b71c1c' }}>
                Ver Catálogo →
              </span>
            </div>
          </Link>
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

      {/* ASESORAMIENTO Y LOGÍSTICA DE ENVÍOS */}
      <style>{`
        .asesor-card { display: flex; gap: 0; padding: 0; overflow: hidden; }
        .asesor-text { flex: 1 1 350px; padding: 40px; display: flex; flex-direction: column; justify-content: center; }
        .asesor-img { flex: 1 1 300px; min-height: 280px; position: relative; background-color: #eee; }
        @media (max-width: 768px) {
          .asesor-card { flex-direction: column-reverse; }
          .asesor-text { padding: 24px; flex: none; }
          .asesor-img { flex: none; min-height: 200px; max-height: 220px; }
          .asesor-card h3 { font-size: 1.2rem !important; }
        }
        @media (max-width: 480px) {
          .asesor-text { padding: 20px; }
          .asesor-img { max-height: 180px; }
        }
      `}</style>
      <section style={{ marginBottom: '60px' }}>
        <div className="card asesor-card" style={{
          background: 'var(--surface-color)',
          boxShadow: 'var(--shadow-md)',
          borderLeft: '4px solid var(--primary)',
        }}>
          {/* Text content column */}
          <div className="asesor-text">
            <h3 style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginBottom: '12px', marginTop: 0 }}>
              Asesoramiento Profesional y Envíos a Obra 🚚
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6, fontSize: '0.95rem' }}>
              Nuestro equipo te ayuda a calcular materiales y optimizar tu presupuesto sin cargo. Además, contamos con **flota propia de camiones planos y grúas** para llevar todo directo a tu obra de forma rápida y segura en cualquier punto de Tucumán.
            </p>
            <ul style={{ margin: '0 0 24px 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>
                ✔️ Entregas programadas en menos de 24hs
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>
                ✔️ Cobertura en toda la provincia (San Miguel, Yerba Buena, Tafí Viejo, etc.)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>
                ✔️ Asistencia directa de ingenieros en obra
              </li>
            </ul>
            <div>
              <a href={`https://wa.me/${tel_whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="btn" style={{ backgroundColor: '#25D366', display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '50px', padding: '12px 28px', fontSize: '0.95rem' }}>
                💬 Consultar con un Asesor
              </a>
            </div>
          </div>
          
          {/* Delivery truck image column */}
          <div className="asesor-img">
            <img
              src="/delivery_truck.png"
              alt="Camión de Reparto Corralón La Rural"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
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
          <p>Todo lo que necesitás para tu obra en un solo lugar</p>
        </div>

        {/* ── FEATURED: Materiales de Construcción ── */}
        <style>{`
          .featured-cat-pills { display: flex; flex-direction: column; gap: 12px; flex-shrink: 0; }
          .featured-cat-img { width: 100%; height: 280px; object-fit: cover; display: block; }
          .featured-cat-overlay { position: absolute; inset: 0; background: linear-gradient(100deg, rgba(140,10,6,0.88) 0%, rgba(180,22,14,0.65) 40%, rgba(0,0,0,0.25) 100%); }
          .featured-cat-content { position: absolute; inset: 0; display: flex; align-items: center; padding: 40px 48px; gap: 24px; }
          .featured-cat-desc { color: rgba(255,255,255,0.85); font-size: 1rem; max-width: 520px; margin: 0 0 20px; line-height: 1.6; }
          @media (max-width: 768px) {
            .featured-cat-pills { display: none; }
            .featured-cat-img { height: 220px; }
            .featured-cat-overlay { background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(140,10,6,0.92) 60%) !important; }
            .featured-cat-content { padding: 20px; align-items: flex-end; }
            .featured-cat-desc { font-size: 0.88rem; margin: 0 0 14px; }
          }
          @media (max-width: 480px) {
            .featured-cat-img { height: 200px; }
            .featured-cat-content { padding: 16px; }
          }
        `}</style>
        <Link href="/catalogo" style={{ textDecoration: 'none', display: 'block', marginBottom: '20px' }}>
          <div style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            cursor: 'pointer',
            boxShadow: '0 8px 40px rgba(192, 22, 14, 0.22)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            border: '3px solid #c0160e',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 50px rgba(192,22,14,0.30)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(192,22,14,0.22)'; }}
          >
            {/* Background image */}
            <img
              src="/cat_obra_gruesa.png"
              alt="Materiales de Construcción"
              className="featured-cat-img"
            />
            {/* Gradient overlay */}
            <div className="featured-cat-overlay" />
            {/* Content */}
            <div className="featured-cat-content">
              <div style={{ flex: 1 }}>
                {/* Badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '50px', padding: '5px 16px', marginBottom: '12px',
                  fontSize: '0.72rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px',
                }}>
                  ⭐ Nuestra Especialidad
                </div>
                <h3 style={{
                  fontSize: 'clamp(1.4rem, 3vw, 2.4rem)', fontWeight: 900, color: '#fff',
                  margin: '0 0 8px', textShadow: '0 2px 8px rgba(0,0,0,0.4)', lineHeight: 1.2,
                }}>
                  🧱 Materiales de Construcción
                </h3>
                <p className="featured-cat-desc">
                  Cemento, cal, áridos, hierros, chapas y todo para cimientos y estructura. La prioridad de tu obra con los mejores precios del mercado.
                </p>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: '#ffffff', color: '#c0160e',
                  padding: '10px 24px', borderRadius: '50px',
                  fontWeight: 700, fontSize: 'clamp(0.82rem, 2vw, 0.95rem)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }}>
                  Ver Catálogo Completo →
                </div>
              </div>
              {/* Right decorative stat pills — hidden on mobile */}
              <div className="featured-cat-pills">
                {[
                  { label: 'Cemento & Cal', icon: '🏗️' },
                  { label: 'Áridos & Arena', icon: '⚙️' },
                  { label: 'Hierros & Chapas', icon: '🔩' },
                  { label: 'Ladrillos & Bloques', icon: '🧱' },
                ].map(({ label, icon }) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px', padding: '8px 16px', color: '#fff',
                    fontSize: '0.85rem', fontWeight: 600,
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>{icon}</span> {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Link>

        {/* ── OTHER CATEGORIES — compact icon grid ── */}
        <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#aaa', marginBottom: '14px' }}>
          Otras Categorías
        </p>
        <style>{`
          .other-cats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 14px;
          }
          @media (max-width: 768px) {
            .other-cats-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }
            .other-cats-grid .other-cat-label {
              font-size: 0.78rem !important;
            }
          }
          @media (max-width: 380px) {
            .other-cats-grid {
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }
          }
        `}</style>
        <div className="other-cats-grid">
          {[
            { cat: '💧 Plomería', img: '/cat_plomeria.png', color: '#0284c7', bg: '#e0f2fe' },
            { cat: '⚡ Electricidad', img: '/cat_electricidad.png', color: '#ca8a04', bg: '#fef9c3' },
            { cat: '🛠️ Ferretería', img: '/cat_ferreteria.png', color: '#7c3aed', bg: '#ede9fe' },
            { cat: '🎨 Pintura', img: '/cat_general.png', color: '#059669', bg: '#d1fae5' },
            { cat: '⚙️ Hierros y Chapas', img: '/cat_hierros_chapas.png', color: '#b45309', bg: '#fef3c7' },
          ].map(({ cat, img, color, bg }) => (
            <Link href="/catalogo" key={cat} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                overflow: 'hidden',
                border: `2px solid ${bg}`,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}28`; e.currentTarget.style.borderColor = color; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = bg; }}
              >
                <div style={{ position: 'relative', height: '100px', overflow: 'hidden' }}>
                  <img src={img} alt={cat} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />
                </div>
                <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', flexShrink: 0,
                  }}>
                    {cat.split(' ')[0]}
                  </div>
                  <span className="other-cat-label" style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1c1917', lineHeight: 1.3 }}>
                    {cat.replace(/^[^ ]+ /, '')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
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
