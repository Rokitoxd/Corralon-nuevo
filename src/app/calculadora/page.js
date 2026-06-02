"use client";

import { useState, useMemo } from "react";

// Material metadata (Column H and J of Excel)
const MATERIAL_METADATA = {
  cemento: { name: "Cemento (Bolsas x 25kg)", unit: "bol.", emoji: "🏗️", category: "Bolsas" },
  hercal: { name: "Cemento de albañilería (Bolsas)", unit: "bol.", emoji: "⚪", category: "Bolsas" },
  arena: { name: "Arena Mediana (m³)", unit: "m³", emoji: "⏳", category: "Áridos" },
  ripio: { name: "Ripio Lavado / Cantera (m³)", unit: "m³", emoji: "🪨", category: "Áridos" },
  ripioBruto: { name: "Ripio Bruto / Estabilizado (m³)", unit: "m³", emoji: "⚙️", category: "Áridos" },
  ladrilloComun: { name: "Ladrillo Común (unidades)", unit: "ud.", emoji: "🧱", category: "Ladrillos" },
  hueco12: { name: "Ladrillo Hueco de 12 (unidades)", unit: "ud.", emoji: "🧱", category: "Ladrillos" },
  hueco18: { name: "Ladrillo Hueco de 18 (unidades)", unit: "ud.", emoji: "🧱", category: "Ladrillos" },
  malla: { name: "Malla de Acero (unidades de 12m²)", unit: "ud.", emoji: "🔗", category: "Hierros" },
  bovedilla12: { name: "Bovedilla de 12 (unidades)", unit: "ud.", emoji: "📦", category: "Ladrillos" },
  bovedilla16: { name: "Bovedilla de 16 (unidades)", unit: "ud.", emoji: "📦", category: "Ladrillos" },
  fino: { name: "Revoque Fino (Bolsas)", unit: "bol.", emoji: "✨", category: "Bolsas" },
  adhesivo: { name: "Pegamento / Adhesivo Cerámico (Bolsas)", unit: "bol.", emoji: "🥣", category: "Bolsas" },
  stopkal: { name: "Stopkal Impermeabilizante (litros)", unit: "lts.", emoji: "💧", category: "Aditivos" },
  hierro6: { name: "Hierro del 6 (barras x 12m)", unit: "ud.", emoji: "🔩", category: "Hierros" },
  hierro10: { name: "Hierro del 10 (barras x 12m)", unit: "ud.", emoji: "🔩", category: "Hierros" },
  hueco8: { name: "Ladrillo Hueco de 8 (unidades)", unit: "ud.", emoji: "🧱", category: "Ladrillos" },
};

// Input categories and labels
const SECTIONS = [
  {
    id: "hormigon",
    title: "🧱 Hormigón y Soportes",
    inputs: [
      { id: "hArmado", label: "Hormigón Armado (vigas/columnas)", unit: "m³", placeholder: "m³ a colar", desc: "12 sacos cemento, arena, ripio y hierros 6/10" },
      { id: "hBrutoFino", label: "Hormigón Bruto Fino", unit: "m³", placeholder: "m³ a colar", desc: "12 sacos cemento, ripio bruto y hierros 6/10" },
      { id: "cimientos", label: "Cimientos / Zapatas", unit: "m³", placeholder: "m³ de cimiento", desc: "6 sacos cemento y ripio bruto por m³" },
      { id: "losa13", label: "Losa Bovedilla 12 (Espesor 13cm)", unit: "m²", placeholder: "m² de losa", desc: "Cemento, arena, ripio, malla y bovedillas del 12" },
      { id: "losa17", label: "Losa Bovedilla 16 (Espesor 17cm)", unit: "m²", placeholder: "m² de losa", desc: "Cemento, arena, ripio, malla y bovedillas del 16" },
    ]
  },
  {
    id: "contrapisos",
    title: "🏗️ Contrapisos y Capas",
    inputs: [
      { id: "contrapisoCement", label: "Contrapiso 8cm (con Cemento)", unit: "m²", placeholder: "m² de contrapiso", desc: "Cemento y ripio bruto (1 bolsa / 3 m²)" },
      { id: "contrapisoHercal", label: "Contrapiso 8cm (con Cemento de albañilería)", unit: "m²", placeholder: "m² de contrapiso", desc: "Cemento de albañilería y ripio bruto (1 bolsa / 3 m²)" },
      { id: "capaAisladora", label: "Capa Aisladora", unit: "m²", placeholder: "m² a impermeabilizar", desc: "Cemento y arena fina (1 bolsa / 4 m²)" },
    ]
  },
  {
    id: "mamposteria",
    title: "🏠 Mampostería y Paredes",
    inputs: [
      { id: "mamposteria15", label: "Pared Ladrillo Común de 15", unit: "m²", placeholder: "m² de pared", desc: "Ladrillos comunes (50 u/m²) y Cemento de albañilería" },
      { id: "mamposteria12", label: "Pared Ladrillo Hueco de 12", unit: "m²", placeholder: "m² de pared", desc: "Huecos de 12x18x33 (15 u/m²) y Cemento de albañilería" },
      { id: "mamposteria18", label: "Pared Ladrillo Hueco de 18", unit: "m²", placeholder: "m² de pared", desc: "Huecos de 18x18x33 (15 u/m²) y Cemento de albañilería" },
      { id: "mamposteria08", label: "Pared Ladrillo Hueco de 8", unit: "m²", placeholder: "m² de pared", desc: "Huecos de 8x18x33 (15 u/m²) y Cemento de albañilería" },
    ]
  },
  {
    id: "revoques",
    title: "✨ Revoques y Capas Finas",
    inputs: [
      { id: "azotadoCement", label: "Azotado Impermeable (con Cemento)", unit: "m²", placeholder: "m² a azotar", desc: "Cemento y arena (1 bolsa / 9 m²)" },
      { id: "azotadoHercal", label: "Azotado Impermeable (con Cemento de albañilería)", unit: "m²", placeholder: "m² a azotar", desc: "Cemento de albañilería y arena (1 bolsa / 9 m²)" },
      { id: "revoqueGrueso", label: "Revoque Grueso (con Cemento de albañilería)", unit: "m²", placeholder: "m² a revocar", desc: "Cemento de albañilería y arena mediana (1 bolsa / 5 m²)" },
      { id: "revoqueFino", label: "Revoque Fino", unit: "m²", placeholder: "m² a lucir", desc: "Bolsa de fino para terminación (1 bolsa / 9 m²)" },
      { id: "adhesivo", label: "Pegamento / Adhesivo Cerámico", unit: "m²", placeholder: "m² a colocar", desc: "Pegamento impermeable (1 bolsa / 8.5 m²)" },
      { id: "revoqueStopkal", label: "Revoque con Stopkal", unit: "m²", placeholder: "m² de revoque", desc: "Cemento (1.5kg/m²) y Stopkal aditivo (0.075L/m²)" },
    ]
  }
];

const INITIAL_INPUTS = {
  hArmado: 0,
  hBrutoFino: 0,
  cimientos: 0,
  losa13: 0,
  losa17: 0,
  contrapisoCement: 0,
  contrapisoHercal: 0,
  capaAisladora: 0,
  mamposteria15: 0,
  mamposteria12: 0,
  mamposteria18: 0,
  mamposteria08: 0,
  azotadoCement: 0,
  azotadoHercal: 0,
  revoqueGrueso: 0,
  revoqueFino: 0,
  adhesivo: 0,
  revoqueStopkal: 0,
  mamposteria08: 0
};

export default function Calculadora() {
  const [inputs, setInputs] = useState(INITIAL_INPUTS);
  const [activeTab, setActiveTab] = useState("hormigon");
  const tel_whatsapp = "5493815156321";

  const handleInputChange = (id, val) => {
    const num = Math.max(0, parseFloat(val) || 0);
    setInputs(prev => ({ ...prev, [id]: num }));
  };

  const handleClear = () => {
    setInputs(INITIAL_INPUTS);
  };

  const handleLoadExample = () => {
    setInputs({
      ...INITIAL_INPUTS,
      hArmado: 3,
      cimientos: 4,
      azotadoCement: 25,
      revoqueGrueso: 50,
      revoqueFino: 50,
      mamposteria12: 30
    });
    setActiveTab("hormigon");
  };

  // Recalculate material quantities in real-time
  const { results, activeInputCount } = useMemo(() => {
    const B24 = inputs.hArmado || 0;
    const B25 = inputs.hBrutoFino || 0;
    const B26 = inputs.cimientos || 0;
    const B27 = inputs.contrapisoCement || 0;
    const B28 = inputs.contrapisoHercal || 0;
    const B29 = inputs.azotadoCement || 0;
    const B30 = inputs.azotadoHercal || 0;
    const B31 = inputs.revoqueGrueso || 0;
    const B32 = inputs.capaAisladora || 0;
    const B33 = inputs.carpetaCement || 0;
    const B34 = inputs.carpetaHercal || 0;
    const B35 = inputs.revoqueFino || 0;
    const B36 = inputs.adhesivo || 0;
    const B37 = inputs.mamposteria15 || 0;
    const B38 = inputs.mamposteria12 || 0;
    const B39 = inputs.mamposteria18 || 0;
    const B40 = inputs.losa13 || 0;
    const B41 = inputs.losa17 || 0;
    const B42 = inputs.revoqueStopkal || 0;
    const B45 = inputs.mamposteria08 || 0;

    // Excel Math Logic for Quantities
    const rawQty = {
      cemento: (B24*12 + B25*12 + B26*6 + B27/3 + B29/9 + B32/4 + B33/2.5 + B40/2 + B41/1.5 + B42*1.5/25),
      hercal: (B28/3 + B30/9 + B31/5 + B34/2.5 + B37/3.6 + B38/7 + B39/5 + B45/9),
      arena: (B24*0.65 + B29*0.006 + B30*0.006 + B31*0.025 + B32*0.02 + B33*0.025 + B34*0.025 + B37*0.06 + B38*0.025 + B39*0.036 + B40*0.045/2 + B41*0.054/2 + B45*0.15),
      ripio: (B24*0.65 + B40*0.045/2 + B41*0.054/2),
      ripioBruto: (B26 + B27*0.08 + B28*0.08 + B25),
      ladrilloComun: B37*50,
      hueco12: B38*15,
      hueco18: B39*15,
      malla: B40/12 + B41/12,
      bovedilla12: B40*2,
      bovedilla16: B41*2,
      fino: B35/9,
      adhesivo: B36/8.5,
      stopkal: 0.075*B42,
      hierro6: B24*8.33 + B25*8.33,
      hierro10: B24*8.33 + B25*8.33,
      hueco8: B45*15
    };

    const computedResults = [];

    let countActive = 0;
    Object.values(inputs).forEach(v => { if (v > 0) countActive++; });

    for (const [key, rawVal] of Object.entries(rawQty)) {
      if (rawVal > 0) {
        const meta = MATERIAL_METADATA[key];
        // Round bags/units up to nearest integer. Round aggregates to 2 decimals.
        const isBagOrUnit = meta.unit === "bol." || meta.unit === "ud.";
        const qtyFormatted = isBagOrUnit ? Math.ceil(rawVal) : parseFloat(rawVal.toFixed(2));

        computedResults.push({
          key,
          qty: qtyFormatted,
          ...meta
        });
      }
    }

    return {
      results: computedResults,
      activeInputCount: countActive
    };
  }, [inputs]);

  const sendWhatsApp = () => {
    let msg = `Hola Corralón La Rural, calculé los materiales de mi obra con el estimador de la web.\n\n`;
    msg += `*Trabajos ingresados:*\n`;
    
    SECTIONS.forEach(sec => {
      sec.inputs.forEach(inp => {
        const val = inputs[inp.id];
        if (val > 0) {
          msg += `• ${inp.label}: *${val} ${inp.unit}*\n`;
        }
      });
    });

    msg += `\n*Materiales Calculados:*\n`;
    results.forEach(res => {
      msg += `• ${res.qty} ${res.unit} - ${res.name}\n`;
    });

    msg += `\nSolicito presupuesto formal y cotización con envío a obra de este listado comercial. Gracias.`;

    window.open(`https://wa.me/${tel_whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .calculator-grid {
          display: flex;
          gap: 32px;
          align-items: flex-start;
          width: 100%;
        }
        .calculator-inputs {
          flex: 1 1 60%;
        }
        .calculator-summary {
          flex: 1 1 40%;
          position: sticky;
          top: 80px;
        }
        .tabs-header {
          display: flex;
          gap: 6px;
          border-bottom: 2px solid var(--border-color);
          margin-bottom: 24px;
          overflow-x: auto;
          padding-bottom: 6px;
          white-space: nowrap;
        }
        .tab-btn {
          padding: 10px 18px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          border-radius: var(--radius);
          transition: all 0.2s;
        }
        .tab-btn.active {
          color: var(--primary);
          background: rgba(192, 22, 14, 0.08);
        }
        .calc-input-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid var(--border-color);
          gap: 16px;
        }
        .calc-input-row:last-child {
          border-bottom: none;
        }
        .calc-input-field {
          position: relative;
          display: flex;
          align-items: center;
          width: 130px;
          flex-shrink: 0;
        }
        .calc-input-field input {
          width: 100%;
          padding: 10px 32px 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          text-align: right;
          font-weight: 700;
          color: var(--secondary);
          outline: none;
          box-shadow: var(--shadow-sm);
        }
        .calc-input-field span {
          position: absolute;
          right: 12px;
          font-size: 0.8rem;
          color: var(--text-muted);
          pointer-events: none;
          font-weight: 600;
        }
        .btn-print {
          background: white;
          border: 1px solid var(--border-color);
          color: var(--secondary);
        }
        .btn-print:hover {
          background: #fafafa;
          border-color: #bbb;
        }
        .warning-box {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          border-radius: 12px;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          color: #b45309;
          font-size: 0.88rem;
          line-height: 1.4;
          margin-top: 12px;
          max-width: 100%;
          text-align: left;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
          animation: fadeInUp 0.4s ease-out;
        }
        .warning-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        .warning-content strong {
          font-weight: 700;
          color: #92400e;
        }
        
        /* PRINT MODE CLEAN STYLING */
        .print-invoice {
          display: none;
        }
        @media print {
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .header, .info-strip, .brand-strip, .footer, .whatsapp-float, .page-header, .tabs-header, .inputs-card, .btn, .tip-box, .btn-print, .action-btns {
            display: none !important;
          }
          .main-content {
            margin-top: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
          .calculator-grid {
            display: block !important;
          }
          .calculator-summary {
            width: 100% !important;
            position: static !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            background: transparent !important;
          }
          .print-invoice {
            display: block !important;
            border-bottom: 2px solid #333;
            padding-bottom: 24px;
            margin-bottom: 24px;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .invoice-logo-title {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .invoice-title h1 {
            font-size: 1.6rem;
            margin: 0;
            color: #b41e1e;
          }
          .invoice-title p {
            margin: 2px 0 0;
            font-size: 0.85rem;
            color: #666;
          }
          .invoice-meta {
            text-align: right;
            font-size: 0.82rem;
            color: #666;
            line-height: 1.4;
          }
          .card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            background: transparent !important;
          }
          .print-materials-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 24px;
            font-size: 0.9rem;
          }
          .print-materials-table th {
            background: #f2f2f2;
            border-bottom: 2px solid #ccc;
            padding: 10px;
            text-align: left;
            font-weight: 700;
          }
          .print-materials-table td {
            border-bottom: 1px solid #eee;
            padding: 10px;
            vertical-align: middle;
          }
        }

        @media (max-width: 991px) {
          .calculator-grid {
            flex-direction: column;
            gap: 24px;
          }
          .calculator-inputs, .calculator-summary {
            width: 100%;
            flex: none;
          }
          .calculator-summary {
            position: static;
          }
        }
      `}</style>

      {/* PRINT LAYOUT (Hidden on screen, visible on PDF/print) */}
      <div className="print-invoice">
        <div className="invoice-header">
          <div className="invoice-logo-title">
            <img src="/WhatsApp Image 2026-03-18 at 16.45.55.jpeg" alt="Corralón La Rural" width={56} height={56} style={{ borderRadius: '8px' }} />
            <div className="invoice-title">
              <h1>Corralón La Rural</h1>
              <p>Av. Camino del Perú 1291, Tucumán · WhatsApp: +54 9 3815 15-6321</p>
            </div>
          </div>
          <div className="invoice-meta">
            <strong>Cómputo Métrico de Materiales</strong><br />
            Fecha: {new Date().toLocaleDateString('es-AR')}<br />
          </div>
        </div>

        <div style={{ marginTop: '24px', fontSize: '0.85rem', color: '#444' }}>
          <strong>Trabajos y Cantidades Estimadas:</strong><br />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: '6px' }}>
            {SECTIONS.flatMap(s => s.inputs).map(inp => {
              const val = inputs[inp.id];
              if (val > 0) {
                return (
                  <span key={inp.id} style={{ background: '#f5f5f5', padding: '3px 8px', borderRadius: '4px' }}>
                    • {inp.label}: <strong>{val} {inp.unit}</strong>
                  </span>
                );
              }
              return null;
            }).filter(Boolean)}
          </div>
        </div>

        <table className="print-materials-table">
          <thead>
            <tr>
              <th style={{ width: '70%' }}>Material Requerido</th>
              <th style={{ width: '30%', textAlign: 'right' }}>Cantidad sugerida</th>
            </tr>
          </thead>
          <tbody>
            {results.map(res => (
              <tr key={res.key}>
                <td>{res.name}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{res.qty} {res.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '40px', borderTop: '2px solid #333', paddingTop: '16px', fontSize: '0.78rem', color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
          Nota: Este cómputo es una estimación técnica del consumo de materiales según la planilla de obra. Las cantidades son sugeridas para las medidas ingresadas. Para solicitar un presupuesto formal con precios actuales, flete y formas de pago, presente este documento por WhatsApp a nuestros asesores.
        </div>
      </div>

      {/* SCREEN LAYOUT */}
      <div className="page-header">
        <h2>🧮 Estimador técnico de Materiales</h2>
        <p>Ingrese las medidas de tu proyecto y obtiene una estimacion de los materiales necesario</p>
        <div className="warning-box">
          <span className="warning-icon">⚠️</span>
          <div className="warning-content">
            <strong>Nota:</strong> Siempre consultar con un profesional estos datos.
          </div>
        </div>
      </div>

      <div className="calculator-grid animate-fade-in">
        {/* LEFT COLUMN: INPUTS */}
        <div className="calculator-inputs">
          {/* CONTROL BAR */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button className="btn" onClick={handleLoadExample} style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '0.85rem' }}>
              📋 Cargar Ejemplo de Obra
            </button>
            {activeInputCount > 0 && (
              <button className="btn btn-secondary" onClick={handleClear} style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '0.85rem' }}>
                🗑️ Limpiar Todo
              </button>
            )}
          </div>

          {/* TABS CONTAINER */}
          <div className="card inputs-card" style={{ padding: '24px 32px' }}>
            <div className="tabs-header">
              {SECTIONS.map(sec => (
                <button
                  key={sec.id}
                  className={`tab-btn${activeTab === sec.id ? " active" : ""}`}
                  onClick={() => setActiveTab(sec.id)}
                >
                  {sec.title}
                </button>
              ))}
            </div>

            {/* TAB INPUTS */}
            {SECTIONS.map(sec => {
              if (activeTab !== sec.id) return null;
              return (
                <div key={sec.id} style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                  {sec.inputs.map(inp => (
                    <div className="calc-input-row" key={inp.id}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontWeight: 600, color: 'var(--secondary)', fontSize: '0.95rem', marginBottom: '3px' }}>
                          {inp.label}
                        </label>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {inp.desc}
                        </span>
                      </div>
                      <div className="calc-input-field">
                        <input
                          type="number"
                          min="0"
                          value={inputs[inp.id] || ""}
                          placeholder="0"
                          onChange={(e) => handleInputChange(inp.id, e.target.value)}
                          aria-label={inp.label}
                        />
                        <span>{inp.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: SUMMARY */}
        <div className="calculator-summary">
          <div className="card" style={{
            background: 'var(--surface-color)',
            boxShadow: 'var(--shadow-lg)',
            borderLeft: '4px solid var(--primary)',
            padding: '28px 24px'
          }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)', marginBottom: '16px', fontWeight: 700 }}>
              Resumen de Consumo 📊
            </h3>

            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🧮</div>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                  Ingresá cantidades en las pestañas para ver la lista de materiales sugeridos al instante.
                </p>
              </div>
            ) : (
              <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                
                {/* Visual Header */}
                <div style={{
                  background: 'var(--bg-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                    Cómputo Técnico Listo
                  </span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                    Estimación exacta de bolsas, metros cúbicos y unidades calculada según tu proyecto.
                  </p>
                </div>

                {/* List of materials */}
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontWeight: 700 }}>
                  Materiales Calculados ({results.length})
                </h4>
                <ul style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '4px', marginBottom: '24px', listStyle: 'none', padding: 0 }}>
                  {results.map(res => (
                    <li key={res.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      marginBottom: '8px',
                      borderRadius: '8px',
                      background: 'var(--bg-color)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.9rem'
                    }}>
                      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{res.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={res.name}>
                          {res.name}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Categoría: {res.category}
                        </span>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--primary)', fontWeight: 700 }}>
                          {res.qty} {res.unit}
                        </strong>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* ACTIONS */}
                <div className="action-btns" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    className="btn"
                    onClick={sendWhatsApp}
                    style={{
                      width: '100%',
                      backgroundColor: '#25D366',
                      padding: '14px',
                      borderRadius: '50px',
                      fontSize: '1.02rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(37,211,102,0.3)',
                    }}
                  >
                    🟢 Solicitar Cotización por WhatsApp
                  </button>
                  <button
                    className="btn btn-print"
                    onClick={handlePrint}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '50px',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    📄 Guardar / Imprimir PDF de Materiales
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
