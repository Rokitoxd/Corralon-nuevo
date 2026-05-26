"use client";

import { useState } from "react";

const proyectos = [
  { id: "pared18", emoji: "🧱", name: "Pared de Ladrillo Hueco 18x18x33" },
  { id: "pared12", emoji: "🧱", name: "Pared de Ladrillo Hueco 12x18x33" },
  { id: "contrapiso", emoji: "🏗️", name: "Contrapiso Estándar" },
  { id: "carpeta", emoji: "📐", name: "Carpeta de Nivelación" },
  { id: "revgrueso", emoji: "🏠", name: "Revoque Grueso (Jaharro)" },
  { id: "revfino", emoji: "✨", name: "Revoque Fino" },
  { id: "losa", emoji: "🏢", name: "Losa / Cubierta de Hormigón" },
  { id: "membrana", emoji: "💧", name: "Impermeabilización con Membrana" },
];

function calcularMateriales(proyectoId, metros, espesor) {
  const m = parseFloat(metros) || 0;

  switch (proyectoId) {
    case "pared18":
      return [
        { n: "Ladrillo Hueco 18x18x33", c: Math.round(m * 16), u: "u.", e: "🧱" },
        { n: "Cemento Holcim x 25kg", c: (m * 0.60).toFixed(1), u: "bol.", e: "🏗️" },
        { n: "Arena Mediana x m³", c: (m * 0.05).toFixed(2), u: "m³", e: "⏳" },
        { n: "Cal Hidratada x 25kg", c: (m * 0.15).toFixed(1), u: "bol.", e: "⚪" },
      ];
    case "pared12":
      return [
        { n: "Ladrillo Hueco 12x18x33", c: Math.round(m * 16), u: "u.", e: "🧱" },
        { n: "Cemento Holcim x 25kg", c: (m * 0.60).toFixed(1), u: "bol.", e: "🏗️" },
        { n: "Arena Mediana x m³", c: (m * 0.05).toFixed(2), u: "m³", e: "⏳" },
        { n: "Cal Hidratada x 25kg", c: (m * 0.15).toFixed(1), u: "bol.", e: "⚪" },
      ];
    case "contrapiso":
      return [
        { n: "Cemento Holcim x 25kg", c: (m * 0.70).toFixed(1), u: "bol.", e: "🏗️" },
        { n: "Arena Mediana x m³", c: (m * 0.05).toFixed(2), u: "m³", e: "⏳" },
        { n: "Piedra / Ripio x m³", c: (m * 0.05).toFixed(2), u: "m³", e: "🪨" },
      ];
    case "carpeta":
      return [
        { n: "Cemento Holcim x 25kg", c: (m * 0.50).toFixed(1), u: "bol.", e: "🏗️" },
        { n: "Arena Mediana x m³", c: (m * 0.03).toFixed(2), u: "m³", e: "⏳" },
      ];
    case "revgrueso":
      return [
        { n: "Cemento Holcim x 25kg", c: (m * 0.40).toFixed(1), u: "bol.", e: "🏗️" },
        { n: "Arena Mediana x m³", c: (m * 0.03).toFixed(2), u: "m³", e: "⏳" },
        { n: "Cal Hidratada x 25kg", c: (m * 0.10).toFixed(1), u: "bol.", e: "⚪" },
      ];
    case "revfino":
      return [
        { n: "Cal Hidratada x 25kg", c: (m * 0.15).toFixed(1), u: "bol.", e: "⚪" },
        { n: "Arena Fina x m³", c: (m * 0.02).toFixed(2), u: "m³", e: "⏳" },
        { n: "Cemento Holcim x 25kg", c: (m * 0.10).toFixed(1), u: "bol.", e: "🏗️" },
      ];
    case "losa": {
      const factor = espesor === "12 cm" ? 1.2 : espesor === "15 cm" ? 1.5 : 1.0;
      return [
        { n: "Cemento Holcim x 25kg", c: (m * 1.0 * factor).toFixed(1), u: "bol.", e: "🏗️" },
        { n: "Arena Mediana x m³", c: (m * 0.065 * factor).toFixed(2), u: "m³", e: "⏳" },
        { n: "Piedra / Ripio x m³", c: (m * 0.085 * factor).toFixed(2), u: "m³", e: "🪨" },
        { n: "Hierro Aletado 8mm x 12m", c: Math.round(m * 1.8 * factor), u: "barras", e: "🔩" },
        { n: "Malla / Alambre", c: (m * 1.1).toFixed(1), u: "m²", e: "🔗" },
      ];
    }
    case "membrana":
      return [
        { n: "Membrana Asfáltica x rollo", c: (m * 1.1 / 10).toFixed(1), u: "rollos", e: "🛡️" },
        { n: "Pintura Asfáltica", c: (m * 0.3 / 4).toFixed(1), u: "latas", e: "🖌️" },
      ];
    default:
      return [];
  }
}

export default function Calculadora() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [metros, setMetros] = useState(15);
  const [espesor, setEspesor] = useState("10 cm (estándar)");
  const tel_whatsapp = "5493815139567";

  const materiales = selectedProject ? calcularMateriales(selectedProject.id, metros, espesor) : [];

  const enviarWhatsApp = () => {
    let texto = `Hola Corralon La Rural, usé la calculadora web y necesito presupuesto para ${metros}m² de ${selectedProject.emoji} ${selectedProject.name}.\n\nMateriales sugeridos:\n`;
    materiales.forEach(m => {
      texto += `- ${m.c} ${m.u} de ${m.n}\n`;
    });
    window.open(`https://wa.me/${tel_whatsapp}?text=${encodeURIComponent(texto)}`, "_blank");
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="page-header">
        <h2>🧮 Calculadora de Materiales</h2>
        <p>Seleccioná tu proyecto, ingresá los m² y obtené una estimación al instante.</p>
      </div>

      {/* PROJECT SELECTOR GRID */}
      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--secondary)', marginBottom: '16px', fontWeight: 600 }}>
          Tipo de trabajo
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {proyectos.map((p) => {
            const isSelected = selectedProject?.id === p.id;
            return (
              <div
                key={p.id}
                className="card"
                onClick={() => setSelectedProject(p)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedProject(p)}
                style={{
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '24px 16px',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: isSelected ? 'rgba(183,28,28,0.05)' : 'var(--surface-color)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{p.emoji}</div>
                <h4 style={{
                  fontSize: '0.95rem',
                  color: isSelected ? 'var(--primary)' : 'var(--secondary)',
                  fontWeight: isSelected ? 700 : 500,
                  margin: 0,
                }}>
                  {p.name}
                </h4>
              </div>
            );
          })}
        </div>
      </section>

      {/* INPUTS */}
      {selectedProject && (
        <section style={{ animation: 'fadeInUp 0.4s ease-out', marginBottom: '32px' }}>
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--secondary)', marginBottom: '20px', fontWeight: 600 }}>
              Configuración
            </h3>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.95rem' }}>
                Metros Cuadrados (m²)
              </label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={metros}
                  onChange={(e) => setMetros(e.target.value)}
                  style={{ flex: 1, accentColor: 'var(--primary)' }}
                  aria-label="Metros cuadrados"
                />
                <input
                  type="number"
                  className="search-input"
                  value={metros}
                  min="1"
                  onChange={(e) => setMetros(e.target.value)}
                  style={{ width: '100px', marginBottom: 0, textAlign: 'center' }}
                  aria-label="Metros cuadrados"
                />
              </div>
            </div>

            {selectedProject.id === "losa" && (
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '0.95rem' }}>
                  Espesor
                </label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {["10 cm (estándar)", "12 cm", "15 cm"].map((esp) => (
                    <label
                      key={esp}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 18px', borderRadius: '50px', cursor: 'pointer',
                        border: espesor === esp ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: espesor === esp ? 'rgba(183,28,28,0.05)' : 'white',
                        fontWeight: espesor === esp ? 600 : 400,
                        color: espesor === esp ? 'var(--primary)' : 'var(--text-main)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <input
                        type="radio"
                        name="espesor"
                        value={esp}
                        checked={espesor === esp}
                        onChange={(e) => setEspesor(e.target.value)}
                        style={{ display: 'none' }}
                      />
                      {esp}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* RESULTS */}
      {selectedProject && materiales.length > 0 && (
        <section style={{ animation: 'fadeInUp 0.4s ease-out' }}>
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>
            <h3 style={{
              fontSize: '1.3rem', color: 'var(--secondary)', marginBottom: '20px',
              paddingBottom: '12px', borderBottom: '2px solid var(--primary)',
            }}>
              Estimación para {metros} m²
            </h3>

            <ul style={{ marginBottom: '24px' }}>
              {materiales.map((m, i) => (
                <li key={i} style={{
                  padding: '14px 16px', marginBottom: '8px', borderRadius: '10px',
                  background: 'var(--surface-color)', display: 'flex', alignItems: 'center', gap: '14px',
                  borderLeft: '3px solid var(--success)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.2s',
                }}>
                  <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{m.e}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>{m.n}</div>
                  </div>
                  <div style={{
                    fontWeight: 700, color: 'var(--success)', fontSize: '1.05rem',
                    whiteSpace: 'nowrap',
                  }}>
                    {m.c} {m.u}
                  </div>
                </li>
              ))}
            </ul>

            {/* TIP */}
            <div style={{
              background: '#e3f2fd', borderRadius: '10px', padding: '16px 20px',
              marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start',
              border: '1px solid #bbdefb',
            }}>
              <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>💡</span>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#1565c0', lineHeight: 1.5 }}>
                Envianos esta estimación para que un asesor ajuste los cálculos y te ofrezca el mejor precio.
              </p>
            </div>

            {/* WHATSAPP CTA */}
            <button
              className="btn"
              onClick={enviarWhatsApp}
              style={{
                width: '100%', backgroundColor: '#25D366', padding: '14px',
                borderRadius: '50px', fontSize: '1.05rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              🟢 Consultar Presupuesto por WhatsApp
            </button>
          </div>
        </section>
      )}
    </>
  );
}
