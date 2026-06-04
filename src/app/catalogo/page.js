"use client";

import { useEffect, useState, useMemo } from "react";
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

export default function Catalogo() {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const { addToCart } = useCart();
  const [quantities, setQuantities] = useState({});
  const [toast, setToast] = useState({ show: false, message: "" });
  const [error, setError] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [aridoTipo, setAridoTipo] = useState("Arena Mediana");
  const [aridoUnidad, setAridoUnidad] = useState("m3");
  const [aridoQty, setAridoQty] = useState(1);

  const [chapaTipo, setChapaTipo] = useState("");
  const [chapaMetros, setChapaMetros] = useState("");
  const [chapaQty, setChapaQty] = useState(1);

  const [chapaLisaCalibre, setChapaLisaCalibre] = useState("");
  const [chapaLisaAncho, setChapaLisaAncho] = useState("");
  const [chapaLisaLargo, setChapaLisaLargo] = useState("");
  const [chapaLisaQty, setChapaLisaQty] = useState(1);

  const [viguetaTipo, setViguetaTipo] = useState("");
  const [viguetaMedida, setViguetaMedida] = useState("");
  const [viguetaQty, setViguetaQty] = useState(1);

  const [ladrilloCompraPor, setLadrilloCompraPor] = useState("unidad");
  const [ladrilloTipo, setLadrilloTipo] = useState("");
  const [ladrilloMedida, setLadrilloMedida] = useState("");
  const [ladrilloQty, setLadrilloQty] = useState(1);

  useEffect(() => {
    setViguetaMedida("");
  }, [viguetaTipo]);

  useEffect(() => {
    setLadrilloTipo("");
    setLadrilloMedida("");
  }, [ladrilloCompraPor]);

  useEffect(() => {
    setLadrilloMedida("");
  }, [ladrilloTipo]);

  useEffect(() => {
    setChapaLisaAncho("");
    setChapaLisaLargo("");
  }, [chapaLisaCalibre]);

  useEffect(() => {
    setChapaLisaLargo("");
  }, [chapaLisaAncho]);

  useEffect(() => {
    if (aridoTipo === "Ripio Bruto Fino") {
      setAridoUnidad("m3");
    }
  }, [aridoTipo]);

  const matchedArido = useMemo(() => {
    let searchTerms = [];
    if (aridoTipo === "Arena Mediana") {
      searchTerms = ["arena mediana", aridoUnidad === "m3" ? "m3" : "bolsa"];
    } else if (aridoTipo === "Ripio Bruto") {
      if (aridoUnidad === "m3") {
        searchTerms = ["ripio bruto mediano", "m3"];
      } else {
        searchTerms = ["ripio bruto", "bolsa"];
      }
    } else if (aridoTipo === "Ripio Bruto Fino") {
      searchTerms = ["ripio bruto fino", "m3"];
    } else if (aridoTipo === "Ripio Lavado") {
      searchTerms = ["ripio lavado", aridoUnidad === "m3" ? "m3" : "bolsa"];
    }

    return articulos.find(a => {
      const nameLower = a.ARTICULO.toLowerCase();
      if (nameLower.includes("viaje") || nameLower.includes("carretilla")) return false;
      return searchTerms.every(term => nameLower.includes(term));
    });
  }, [aridoTipo, aridoUnidad, articulos]);

  const handleAddArido = () => {
    if (matchedArido) {
      addToCart(matchedArido, aridoQty);
      showToast(`✓ Agregado: ${aridoQty} × ${matchedArido.ARTICULO}`);
    } else {
      showToast(`⚠️ Este producto no se encuentra disponible.`);
    }
  };

  // ── Chapas Widget Logic ──
  const chapaMetrosOptions = useMemo(() => {
    const options = [];
    for (let m = 0.5; m <= 15; m += 0.5) {
      options.push(m % 1 === 0 ? `${m.toFixed(1)}` : `${m.toFixed(2)}`);
    }
    return options;
  }, []);

  const chapaProductName = useMemo(() => {
    if (!chapaTipo || !chapaMetros) return "";
    const metrosNum = parseFloat(chapaMetros);
    const metrosLabel = metrosNum % 1 === 0 ? `${metrosNum.toFixed(0)}` : `${metrosNum}`;
    const names = {
      "Cinc Cal 25 Acanalada": `CHAPA ZINC CAL 25 DE ${metrosLabel} MTS`,
      "Cinc Cal 27 Acanalada": `CHAPA ZINC CAL 27 DE ${metrosLabel} MTS`,
      "Traslúcida": `CHAPA TRASLUCIDA DE ${metrosLabel} MTS`,
      "Trapezoidal": `CHAPA TRAPEZOIDAL DE ${metrosLabel} MTS`,
    };
    return names[chapaTipo] || "";
  }, [chapaTipo, chapaMetros]);

  const chapaReady = chapaTipo !== "" && chapaMetros !== "";

  const handleAddChapa = () => {
    if (!chapaReady) {
      showToast(`⚠️ Seleccioná tipo de chapa y metros.`);
      return;
    }
    const chapaItem = { ARTICULO: chapaProductName, CATEGORIA_WEB: "⚙️ Hierros y Chapas" };
    addToCart(chapaItem, chapaQty);
    showToast(`✓ Agregado: ${chapaQty} × ${chapaProductName}`);
    // Reset para agregar otra medida
    setChapaTipo("");
    setChapaMetros("");
    setChapaQty(1);
  };

  // ── Chapas Lisas (Negras) Widget Logic ──
  const matchedChapaLisa = useMemo(() => {
    if (!chapaLisaCalibre || !chapaLisaAncho || !chapaLisaLargo) return null;
    return articulos.find(a => {
      const nameLower = a.ARTICULO.toLowerCase();
      
      if (chapaLisaCalibre === "25" || chapaLisaCalibre === "27") {
        if (!nameLower.includes("chapa") || !nameLower.includes("lisa")) return false;
        if (!nameLower.includes(`cal ${chapaLisaCalibre}`)) return false;
        if (chapaLisaAncho === "0.61" && (nameLower.includes("061") || nameLower.includes("0.61"))) return true;
        if (chapaLisaAncho === "1.22" && nameLower.includes("1.22")) return true;
        return false;
      }
      
      if (!nameLower.includes("chapa") || !nameLower.includes("dd")) return false;
      
      const calibreTerm = `dd ${chapaLisaCalibre}`;
      if (!nameLower.includes(calibreTerm)) return false;
      
      const widthVal = parseFloat(chapaLisaAncho);
      const lengthVal = parseFloat(chapaLisaLargo);
      
      if (widthVal === 1.0 && lengthVal === 2.0) {
        return nameLower.includes("1 x 2") || nameLower.includes("1x2");
      } else if (widthVal === 1.22 && lengthVal === 2.44) {
        return nameLower.includes("1.22") || nameLower.includes("1,22");
      }
      return false;
    });
  }, [chapaLisaCalibre, chapaLisaAncho, chapaLisaLargo, articulos]);

  const chapaLisaProductName = useMemo(() => {
    if (!chapaLisaCalibre || !chapaLisaAncho || !chapaLisaLargo) return "";
    const typeLabel = (chapaLisaCalibre === "25" || chapaLisaCalibre === "27") ? "Lisa" : "Lisa (Negra) DD";
    return `Chapa ${typeLabel} Calibre ${chapaLisaCalibre} de ${chapaLisaAncho} x ${chapaLisaLargo} Mts`;
  }, [chapaLisaCalibre, chapaLisaAncho, chapaLisaLargo]);

  const chapaLisaReady = chapaLisaCalibre !== "" && chapaLisaAncho !== "" && chapaLisaLargo !== "";

  const handleAddChapaLisa = () => {
    if (!chapaLisaReady) {
      showToast(`⚠️ Seleccioná calibre, ancho y metros.`);
      return;
    }
    const finalItem = matchedChapaLisa
      ? { ...matchedChapaLisa, ARTICULO: chapaLisaProductName }
      : { ARTICULO: chapaLisaProductName, CATEGORIA_WEB: "⚙️ Hierros y Chapas" };

    addToCart(finalItem, chapaLisaQty);
    showToast(`✓ Agregado: ${chapaLisaQty} × ${chapaLisaProductName}`);
    setChapaLisaCalibre("");
    setChapaLisaAncho("");
    setChapaLisaLargo("");
    setChapaLisaQty(1);
  };

  // ── Viguetas Widget Logic ──
  const matchedViguetaItem = useMemo(() => {
    if (!viguetaTipo || !viguetaMedida) return null;
    return articulos.find(a => {
      const nameLower = a.ARTICULO.toLowerCase();
      if (viguetaTipo === "Vigueta") {
        if (!nameLower.includes("vigueta")) return false;
        if (viguetaMedida === "1.00") {
          return nameLower.includes(" 1 m") || nameLower.includes(" 1.00");
        }
        return nameLower.includes(`de ${viguetaMedida}`);
      } else if (viguetaTipo === "Bovedilla") {
        return nameLower.includes("bovedilla") && nameLower.includes(viguetaMedida.toLowerCase());
      }
      return false;
    });
  }, [viguetaTipo, viguetaMedida, articulos]);

  const viguetaReady = viguetaTipo !== "" && viguetaMedida !== "";

  const handleAddVigueta = () => {
    if (!viguetaReady) {
      showToast(`⚠️ Seleccioná tipo de material y medida.`);
      return;
    }
    if (matchedViguetaItem) {
      addToCart(matchedViguetaItem, viguetaQty);
      showToast(`✓ Agregado: ${viguetaQty} × ${matchedViguetaItem.ARTICULO}`);
    } else {
      const fallbackName = viguetaTipo === "Vigueta"
        ? `Vigueta De ${viguetaMedida} Mts`
        : `Bovedilla Telgopor ${viguetaMedida}`;
      const fallbackItem = { ARTICULO: fallbackName, CATEGORIA_WEB: "⚙️ Hierros y Chapas" };
      addToCart(fallbackItem, viguetaQty);
      showToast(`✓ Agregado: ${viguetaQty} × ${fallbackName}`);
    }
    setViguetaTipo("");
    setViguetaMedida("");
    setViguetaQty(1);
  };

  // ── Ladrillos Widget Logic ──
  const matchedLadrilloItem = useMemo(() => {
    if (!ladrilloTipo) return null;
    if (ladrilloTipo === "Hueco" && !ladrilloMedida) return null;

    return articulos.find(a => {
      const nameLower = a.ARTICULO.toLowerCase();
      if (!nameLower.includes("ladrillo")) return false;
      
      if (ladrilloTipo === "Común") {
        if (!nameLower.includes("comun")) return false;
        if (ladrilloCompraPor === "unidad") return nameLower.includes("unidad");
        if (ladrilloCompraPor === "millar") return nameLower.includes("1000");
      } else if (ladrilloTipo === "Hueco") {
        if (!nameLower.includes("hueco")) return false;
        const cleanName = nameLower.replace("ladrillo hueco", "").trim();
        return cleanName === ladrilloMedida.toLowerCase();
      } else if (ladrilloTipo === "Semi Vista") {
        if (!nameLower.includes("semi vista")) return false;
        if (ladrilloCompraPor === "unidad") return nameLower.includes("unidad");
        if (ladrilloCompraPor === "millar") return nameLower.includes("1000");
      }
      return false;
    });
  }, [ladrilloCompraPor, ladrilloTipo, ladrilloMedida, articulos]);

  const ladrilloReady = ladrilloTipo !== "" && (ladrilloTipo !== "Hueco" || ladrilloMedida !== "");

  const handleAddLadrillo = () => {
    if (!ladrilloReady) {
      showToast(`⚠️ Seleccioná tipo de ladrillo y presentación.`);
      return;
    }
    
    if (ladrilloCompraPor === "millar" && ladrilloTipo === "Hueco") {
      const finalItemName = `Ladrillo Hueco ${ladrilloMedida} (X 1000)`;
      const finalItem = matchedLadrilloItem
        ? { ...matchedLadrilloItem, ARTICULO: finalItemName }
        : { ARTICULO: finalItemName, CATEGORIA_WEB: "🧱 Materiales de Construcción" };
        
      addToCart(finalItem, ladrilloQty);
      showToast(`✓ Agregado: ${ladrilloQty} × ${finalItemName}`);
    } else {
      if (matchedLadrilloItem) {
        addToCart(matchedLadrilloItem, ladrilloQty);
        showToast(`✓ Agregado: ${ladrilloQty} × ${matchedLadrilloItem.ARTICULO}`);
      } else {
        const displayDetail = ladrilloTipo === "Hueco" ? ladrilloMedida : (ladrilloCompraPor === "unidad" ? "x Unidad" : "x Millar");
        const fallbackName = `Ladrillo ${ladrilloTipo} (${displayDetail})`;
        const fallbackItem = { ARTICULO: fallbackName, CATEGORIA_WEB: "🧱 Materiales de Construcción" };
        addToCart(fallbackItem, ladrilloQty);
        showToast(`✓ Agregado: ${ladrilloQty} × ${fallbackName}`);
      }
    }
    setLadrilloTipo("");
    setLadrilloMedida("");
    setLadrilloQty(1);
  };

  useEffect(() => {
    let retries = 0;
    const fetchData = () => {
      setError(false);
      setLoading(true);
      fetch("/api/catalogo")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setArticulos(data);
            setError(false);
          } else {
            throw new Error("Invalid data format");
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Fetch attempt failed:', err);
          retries++;
          if (retries < 3) {
            setTimeout(fetchData, 1500);
          } else {
            setError(true);
            setLoading(false);
          }
        });
    };
    fetchData();
  }, [reloadTrigger]);

  const handleRetry = () => {
    setReloadTrigger(prev => prev + 1);
  };

  const categorias = useMemo(() => {
    const catMap = {};
    articulos.filter(a => a.CATEGORIA_WEB !== "🔥 Ofertas").forEach(a => {
      catMap[a.CATEGORIA_WEB] = (catMap[a.CATEGORIA_WEB] || 0) + 1;
    });
    return Object.entries(catMap).sort(([a], [b]) => a.localeCompare(b));
  }, [articulos]);

  const subcategorias = useMemo(() => {
    if (!selectedCategory) return [];
    const subMap = {};
    articulos.filter(a => a.CATEGORIA_WEB === selectedCategory).forEach(a => {
      const sub = a.SUBCATEGORIA_WEB || "Otros";
      subMap[sub] = (subMap[sub] || 0) + 1;
    });
    return Object.entries(subMap).sort(([a], [b]) => a.localeCompare(b));
  }, [articulos, selectedCategory]);

  const filteredItems = useMemo(() => {
    return articulos.filter(a => {
      const matchSearch = a.ARTICULO.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = a.CATEGORIA_WEB === selectedCategory;
      const matchSub = !selectedSubcategory || (a.SUBCATEGORIA_WEB || "Otros") === selectedSubcategory;
      return matchSearch && matchCat && matchSub;
    });
  }, [articulos, searchTerm, selectedCategory, selectedSubcategory]);

  const itemsBySubcategory = useMemo(() => {
    const grouped = {};
    for (const item of filteredItems) {
      const sub = item.SUBCATEGORIA_WEB || "Otros";
      if (!grouped[sub]) grouped[sub] = [];
      grouped[sub].push(item);
    }
    return grouped;
  }, [filteredItems]);

  const globalSearchItems = useMemo(() => {
    if (searchTerm.length < 3) return [];
    return articulos.filter(a =>
      a.CATEGORIA_WEB !== "🔥 Ofertas" &&
      a.ARTICULO.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [articulos, searchTerm]);

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

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(null);
    setSearchTerm("");
  };

  const resetToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchTerm("");
  };

  const renderProductCard = (item, idx) => (
    <div className="card item-card" key={idx} style={{ padding: '24px' }}>
      <div>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--secondary)', marginBottom: '4px' }}>{item.ARTICULO}</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          {item.CATEGORIA_WEB}
        </p>
      </div>
      <div className="actions" style={{ marginTop: '16px' }}>
        <input
          type="number"
          min="1"
          value={quantities[item.ARTICULO] || 1}
          onChange={(e) => handleQtyChange(item.ARTICULO, e.target.value)}
          aria-label={`Cantidad de ${item.ARTICULO}`}
        />
        <button className="btn" onClick={() => handleAdd(item)}>Agregar</button>
      </div>
    </div>
  );

  const renderAridosWidget = () => (
    <div className="card animate-fade-in aridos-widget" style={{
      borderLeft: '4px solid var(--primary)',
      marginBottom: '32px',
      background: 'var(--surface-color)',
      boxShadow: 'var(--shadow-md)',
      animation: 'fadeInUp 0.4s ease-out'
    }}>
      {/* Image container */}
      <div className="aridos-widget-img">
        <img
          src="/aridos_display.png"
          alt="Áridos y Cantera"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          background: 'var(--primary)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '50px',
          fontSize: '0.8rem',
          fontWeight: 700,
          boxShadow: 'var(--shadow-sm)'
        }}>
          Directo de Cantera ⛰️
        </div>
      </div>

      {/* Control panel */}
      <div className="aridos-widget-controls">
        <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary)', marginBottom: '8px', marginTop: 0 }}>
          Selector de Áridos Premium ⏳
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
          Elegí el material y la presentación que necesitás para tu obra. Venta en metros cúbicos y bolsas únicamente.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {/* Material Select */}
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--secondary)' }}>
              Material
            </label>
            <select
              value={aridoTipo}
              onChange={(e) => setAridoTipo(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'white',
                fontWeight: 500,
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <option value="Arena Mediana">Arena Mediana ⏳</option>
              <option value="Ripio Bruto">Ripio Bruto 🪨</option>
              <option value="Ripio Bruto Fino">Ripio Bruto Fino 🪨</option>
              <option value="Ripio Lavado">Ripio Lavado ✨</option>
            </select>
          </div>

          {/* Unit Select */}
          <div style={{ flex: 1, minWidth: '120px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--secondary)' }}>
              Presentación
            </label>
            <select
              value={aridoUnidad}
              onChange={(e) => setAridoUnidad(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'white',
                fontWeight: 500,
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <option value="m3">Metro Cúbico (m³)</option>
              {aridoTipo !== "Ripio Bruto Fino" && <option value="bolsa">Bolsa</option>}
            </select>
          </div>
        </div>

        {/* Price display and CTA */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '8px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
              Producto Seleccionado:
            </span>
            <span style={{ fontWeight: 600, color: 'var(--secondary)', fontSize: '0.95rem' }}>
              {matchedArido ? matchedArido.ARTICULO : "No disponible"}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="number"
              min="1"
              value={aridoQty}
              onChange={(e) => setAridoQty(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '70px',
                padding: '12px',
                textAlign: 'center',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontWeight: 600,
                boxShadow: 'var(--shadow-sm)'
              }}
            />
            <button
              className="btn"
              onClick={handleAddArido}
              disabled={!matchedArido}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                opacity: matchedArido ? 1 : 0.6,
                cursor: matchedArido ? 'pointer' : 'not-allowed',
                boxShadow: matchedArido ? '0 4px 12px rgba(183,28,28,0.2)' : 'none',
              }}
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChapasWidget = () => (
    <div className="card animate-fade-in aridos-widget" style={{
      borderLeft: '4px solid #6366f1',
      marginBottom: '32px',
      background: 'var(--surface-color)',
      boxShadow: 'var(--shadow-md)',
      animation: 'fadeInUp 0.4s ease-out'
    }}>
      {/* Image container */}
      <div className="aridos-widget-img">
        <img
          src="/cat_hierros_chapas.png"
          alt="Chapas de Zinc y Traslúcidas"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          background: '#6366f1',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '50px',
          fontSize: '0.8rem',
          fontWeight: 700,
          boxShadow: 'var(--shadow-sm)'
        }}>
          Cortamos a Medida 📏
        </div>
      </div>

      {/* Control panel */}
      <div className="aridos-widget-controls">
        <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary)', marginBottom: '8px', marginTop: 0 }}>
          Selector de Chapas 🏗️
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
          Elegí el tipo de chapa y los metros lineales que necesitás. Agregá al carrito y el tablero se reinicia para pedir otra medida.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {/* Tipo de Chapa */}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--secondary)' }}>
              Tipo de Chapa
            </label>
            <select
              value={chapaTipo}
              onChange={(e) => setChapaTipo(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'white',
                fontWeight: 500,
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <option value="" disabled>— Seleccionar tipo —</option>
              <option value="Cinc Cal 25 Acanalada">Chapa Cinc Calibre 25 Acanalada</option>
              <option value="Cinc Cal 27 Acanalada">Chapa Cinc Calibre 27 Acanalada</option>
              <option value="Traslúcida">Chapa Traslúcida</option>
              <option value="Trapezoidal">Chapa Trapezoidal</option>
            </select>
          </div>

          {/* Metros Lineales */}
          <div style={{ flex: 1, minWidth: '140px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--secondary)' }}>
              Metros Lineales
            </label>
            <select
              value={chapaMetros}
              onChange={(e) => setChapaMetros(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'white',
                fontWeight: 500,
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <option value="" disabled>— Seleccionar metros —</option>
              {chapaMetrosOptions.map(m => (
                <option key={m} value={m}>{m} mts</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product display and CTA */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '8px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
              Producto Seleccionado:
            </span>
            <span style={{ fontWeight: 600, color: chapaReady ? 'var(--secondary)' : 'var(--text-muted)', fontSize: '0.95rem' }}>
              {chapaReady ? chapaProductName : "Seleccioná tipo y metros"}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="number"
              min="1"
              value={chapaQty}
              onChange={(e) => setChapaQty(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '70px',
                padding: '12px',
                textAlign: 'center',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontWeight: 600,
                boxShadow: 'var(--shadow-sm)'
              }}
            />
            <button
              className="btn"
              onClick={handleAddChapa}
              disabled={!chapaReady}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                opacity: chapaReady ? 1 : 0.6,
                cursor: chapaReady ? 'pointer' : 'not-allowed',
                boxShadow: chapaReady ? '0 4px 12px rgba(183,28,28,0.2)' : 'none',
              }}
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChapasLisasWidget = () => {
    const largoOptions = [];
    for (let m = 0.5; m <= 15; m += 0.5) {
      largoOptions.push(m % 1 === 0 ? `${m.toFixed(1)}` : `${m.toFixed(2)}`);
    }
    if (chapaLisaAncho === "1.22" && !largoOptions.includes("2.44")) {
      largoOptions.push("2.44");
    }
    largoOptions.sort((a, b) => parseFloat(a) - parseFloat(b));

    return (
      <div className="card animate-fade-in aridos-widget" style={{
        borderLeft: '4px solid #475569',
        marginBottom: '32px',
        background: 'var(--surface-color)',
        boxShadow: 'var(--shadow-md)',
        animation: 'fadeInUp 0.4s ease-out'
      }}>
        {/* Image container */}
        <div className="aridos-widget-img">
          <img
            src="/cat_hierros_chapas.png"
            alt="Chapas Lisas Doble Decapadas"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: '#475569',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '50px',
            fontSize: '0.8rem',
            fontWeight: 700,
            boxShadow: 'var(--shadow-sm)'
          }}>
            Chapa Lisa DD / Lisa ⚙️
          </div>
        </div>

        {/* Control panel */}
        <div className="aridos-widget-controls">
          <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary)', marginBottom: '8px', marginTop: 0 }}>
            Selector de Chapas Lisas 🏗️
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
            Elegí el calibre, ancho de la chapa y el largo en metros lineales que necesitás.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {/* Calibre */}
            <div style={{ flex: 1, minWidth: '120px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--secondary)' }}>
                Calibre
              </label>
              <select
                value={chapaLisaCalibre}
                onChange={(e) => setChapaLisaCalibre(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'white',
                  fontWeight: 500,
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <option value="" disabled>— Calibre —</option>
                <option value="16">Calibre 16 (1.6 mm)</option>
                <option value="18">Calibre 18 (1.2 mm)</option>
                <option value="20">Calibre 20 (0.9 mm)</option>
                <option value="24">Calibre 24 (0.56 mm)</option>
                <option value="25">Calibre 25 (0.50 mm)</option>
                <option value="27">Calibre 27 (0.40 mm)</option>
              </select>
            </div>

            {/* Ancho */}
            <div style={{ flex: 1, minWidth: '120px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--secondary)' }}>
                Ancho (mts)
              </label>
              <select
                value={chapaLisaAncho}
                onChange={(e) => setChapaLisaAncho(e.target.value)}
                disabled={!chapaLisaCalibre}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'white',
                  fontWeight: 500,
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: 'var(--shadow-sm)',
                  opacity: chapaLisaCalibre ? 1 : 0.6
                }}
              >
                <option value="" disabled>— Ancho —</option>
                {(chapaLisaCalibre === "16" || chapaLisaCalibre === "18" || chapaLisaCalibre === "20") && (
                  <>
                    <option value="1.00">1.00 mt de ancho</option>
                    <option value="1.22">1.22 mt de ancho</option>
                  </>
                )}
                {chapaLisaCalibre === "24" && (
                  <option value="1.22">1.22 mt de ancho</option>
                )}
                {chapaLisaCalibre === "25" && (
                  <>
                    <option value="0.61">0.61 mt de ancho</option>
                    <option value="1.22">1.22 mt de ancho</option>
                  </>
                )}
                {chapaLisaCalibre === "27" && (
                  <option value="1.22">1.22 mt de ancho</option>
                )}
              </select>
            </div>

            {/* Largo (Metros Lineales) */}
            <div style={{ flex: 1, minWidth: '120px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--secondary)' }}>
                Largo (mts)
              </label>
              <select
                value={chapaLisaLargo}
                onChange={(e) => setChapaLisaLargo(e.target.value)}
                disabled={!chapaLisaAncho}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'white',
                  fontWeight: 500,
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: 'var(--shadow-sm)',
                  opacity: chapaLisaAncho ? 1 : 0.6
                }}
              >
                <option value="" disabled>— Largo —</option>
                {largoOptions.map(l => (
                  <option key={l} value={l}>{l} mts</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product display and CTA */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '20px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                Producto Seleccionado:
              </span>
              <span style={{ fontWeight: 600, color: chapaLisaReady ? 'var(--secondary)' : 'var(--text-muted)', fontSize: '0.95rem' }}>
                {chapaLisaReady ? chapaLisaProductName : "Seleccioná calibre, ancho y largo"}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="number"
                min="1"
                value={chapaLisaQty}
                onChange={(e) => setChapaLisaQty(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: '70px',
                  padding: '12px',
                  textAlign: 'center',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-sm)'
                }}
              />
              <button
                className="btn btn-primary"
                onClick={handleAddChapaLisa}
                disabled={!chapaLisaReady}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  backgroundColor: '#475569',
                  border: 'none',
                  opacity: chapaLisaReady ? 1 : 0.6,
                  cursor: chapaLisaReady ? 'pointer' : 'not-allowed',
                  boxShadow: chapaLisaReady ? '0 4px 12px rgba(71,85,105,0.2)' : 'none',
                }}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderViguetasWidget = () => {
    const viguetaLengths = [
      "1.00", "1.20", "1.40", "1.60", "1.80", "2.00", "2.20", "2.40", "2.60", "2.80",
      "3.00", "3.20", "3.40", "3.60", "3.80", "4.00", "4.20", "4.40", "4.60", "4.80",
      "5.00", "5.20", "5.40", "5.60", "5.80", "6.00", "6.20", "6.40", "6.60", "6.80",
      "7.00", "7.20"
    ];

    return (
      <div className="card animate-fade-in aridos-widget" style={{
        borderLeft: '4px solid #b71c1c',
        marginBottom: '32px',
        background: 'var(--surface-color)',
        boxShadow: 'var(--shadow-md)',
        animation: 'fadeInUp 0.4s ease-out'
      }}>
        {/* Image container */}
        <div className="aridos-widget-img">
          <img
            src="/cat_obra_gruesa.png"
            alt="Losa y Viguetas"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: '#b71c1c',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '50px',
            fontSize: '0.8rem',
            fontWeight: 700,
            boxShadow: 'var(--shadow-sm)'
          }}>
            Viguetas Tensolite 🧱
          </div>
        </div>

        {/* Control panel */}
        <div className="aridos-widget-controls">
          <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary)', marginBottom: '8px', marginTop: 0 }}>
            Selector de Viguetas y Bovedillas 🏗️
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
            Elegí el tipo de material (Vigueta o Bovedilla) y la medida requerida. Agregá al carrito y el tablero se reinicia para pedir otra medida.
          </p>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {/* Tipo de Material */}
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--secondary)' }}>
                Tipo de Material
              </label>
              <select
                value={viguetaTipo}
                onChange={(e) => setViguetaTipo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'white',
                  fontWeight: 500,
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <option value="" disabled>— Seleccionar tipo —</option>
                <option value="Vigueta">Vigueta de Hormigón</option>
                <option value="Bovedilla">Bovedilla de Telgopor</option>
              </select>
            </div>

            {/* Medida / Modelo */}
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--secondary)' }}>
                Medida / Modelo
              </label>
              <select
                value={viguetaMedida}
                onChange={(e) => setViguetaMedida(e.target.value)}
                disabled={!viguetaTipo}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'white',
                  fontWeight: 500,
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: 'var(--shadow-sm)',
                  opacity: viguetaTipo ? 1 : 0.6
                }}
              >
                <option value="" disabled>— Seleccionar medida —</option>
                {viguetaTipo === "Vigueta" && viguetaLengths.map(m => (
                  <option key={m} value={m}>{parseFloat(m).toFixed(2)} mts</option>
                ))}
                {viguetaTipo === "Bovedilla" && (
                  <>
                    <option value="10 x T1">10 x T1 (10cm alto)</option>
                    <option value="12 x T2">12 x T2 (12cm alto)</option>
                    <option value="16 x T3">16 x T3 (16cm alto)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Product display and CTA */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '20px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                Producto Seleccionado:
              </span>
              <span style={{ fontWeight: 600, color: viguetaReady ? 'var(--secondary)' : 'var(--text-muted)', fontSize: '0.95rem' }}>
                {viguetaReady ? (matchedViguetaItem ? matchedViguetaItem.ARTICULO : "No disponible") : "Seleccioná tipo y medida"}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="number"
                min="1"
                value={viguetaQty}
                onChange={(e) => setViguetaQty(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: '70px',
                  padding: '12px',
                  textAlign: 'center',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-sm)'
                }}
              />
              <button
                className="btn btn-primary"
                onClick={handleAddVigueta}
                disabled={!viguetaReady}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  opacity: viguetaReady ? 1 : 0.6,
                  cursor: viguetaReady ? 'pointer' : 'not-allowed',
                  boxShadow: viguetaReady ? '0 4px 12px rgba(183,28,28,0.2)' : 'none',
                }}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLadrillosWidget = () => (
    <div className="card animate-fade-in aridos-widget" style={{
      borderLeft: '4px solid #f97316',
      marginBottom: '32px',
      background: 'var(--surface-color)',
      boxShadow: 'var(--shadow-md)',
      animation: 'fadeInUp 0.4s ease-out'
    }}>
      {/* Image container */}
      <div className="aridos-widget-img">
        <img
          src="/cat_obra_gruesa.png"
          alt="Ladrillos y Bloques"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          background: '#f97316',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '50px',
          fontSize: '0.8rem',
          fontWeight: 700,
          boxShadow: 'var(--shadow-sm)'
        }}>
          Ladrillos de Obra 🧱
        </div>
      </div>

      {/* Control panel */}
      <div className="aridos-widget-controls">
        <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary)', marginBottom: '8px', marginTop: 0 }}>
          Selector de Ladrillos 🏗️
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
          Elegí la modalidad de compra (por unidad o millar) y luego el tipo de ladrillo que necesitás.
        </p>

        {/* Compra Por Tab Selector */}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '24px', gap: '8px' }}>
          <button
            onClick={() => setLadrilloCompraPor("unidad")}
            style={{
              padding: '10px 16px',
              fontWeight: 600,
              fontSize: '0.88rem',
              color: ladrilloCompraPor === "unidad" ? '#f97316' : 'var(--text-muted)',
              borderBottom: ladrilloCompraPor === "unidad" ? '3px solid #f97316' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px',
              background: 'transparent',
              outline: 'none'
            }}
          >
            🧱 Compra por Unidad
          </button>
          <button
            onClick={() => setLadrilloCompraPor("millar")}
            style={{
              padding: '10px 16px',
              fontWeight: 600,
              fontSize: '0.88rem',
              color: ladrilloCompraPor === "millar" ? '#f97316' : 'var(--text-muted)',
              borderBottom: ladrilloCompraPor === "millar" ? '3px solid #f97316' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px',
              background: 'transparent',
              outline: 'none'
            }}
          >
            📦 Compra por Millar (x1000)
          </button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {/* Tipo de Ladrillo */}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--secondary)' }}>
              Tipo de Ladrillo
            </label>
            <select
              value={ladrilloTipo}
              onChange={(e) => setLadrilloTipo(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'white',
                fontWeight: 500,
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <option value="" disabled>— Seleccionar tipo —</option>
              <option value="Común">Ladrillo Común</option>
              <option value="Hueco">Ladrillo Hueco (Cerámico)</option>
              <option value="Semi Vista">Ladrillo Semi Vista</option>
            </select>
          </div>

          {/* Medida / Dimensión (Only shown for Hueco) */}
          {ladrilloTipo === "Hueco" && (
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--secondary)' }}>
                Medida / Dimensión
              </label>
              <select
                value={ladrilloMedida}
                onChange={(e) => setLadrilloMedida(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'white',
                  fontWeight: 500,
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <option value="" disabled>— Seleccionar medida —</option>
                <option value="8 x 18 x 33">8 x 18 x 33 cm</option>
                <option value="12 x 18 x 33">12 x 18 x 33 cm</option>
                <option value="18 x 18 x 33">18 x 18 x 33 cm</option>
              </select>
            </div>
          )}
        </div>

        {/* Product display and CTA */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '8px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
              Producto Seleccionado:
            </span>
            <span style={{ fontWeight: 600, color: ladrilloReady ? 'var(--secondary)' : 'var(--text-muted)', fontSize: '0.95rem' }}>
              {ladrilloReady ? (matchedLadrilloItem ? matchedLadrilloItem.ARTICULO : "No disponible") : "Seleccioná tipo de ladrillo"}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="number"
              min="1"
              value={ladrilloQty}
              onChange={(e) => setLadrilloQty(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '70px',
                padding: '12px',
                textAlign: 'center',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontWeight: 600,
                boxShadow: 'var(--shadow-sm)'
              }}
            />
            <button
              className="btn btn-primary"
              onClick={handleAddLadrillo}
              disabled={!ladrilloReady}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                backgroundColor: '#f97316',
                border: 'none',
                opacity: ladrilloReady ? 1 : 0.6,
                cursor: ladrilloReady ? 'pointer' : 'not-allowed',
                boxShadow: ladrilloReady ? '0 4px 12px rgba(249,115,22,0.2)' : 'none',
              }}
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .aridos-widget {
          display: flex;
          flex-direction: row;
          gap: 24px;
          padding: 0;
          overflow: hidden;
          width: 100%;
        }
        .aridos-widget-img {
          flex: 1 1 300px;
          min-height: 240px;
          position: relative;
          background-color: #eee;
        }
        .aridos-widget-controls {
          flex: 1 1 350px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .cat-featured-card { transition: transform 0.2s, box-shadow 0.2s; }
        .cat-featured-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(192,22,14,0.18) !important; }
        .cat-other-card { transition: transform 0.2s, box-shadow 0.2s; }
        .cat-other-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; }
        
        /* WhatsApp Reminder Banner Styles */
        .whatsapp-reminder-banner {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          margin-bottom: 24px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(37,211,102,0.08) 0%, rgba(37,211,102,0.03) 100%);
          border: 1px solid rgba(37,211,102,0.25);
          animation: fadeInUp 0.5s ease-out;
        }
        .whatsapp-banner-title {
          margin: 0;
          font-weight: 600;
          color: var(--secondary);
          font-size: 0.95rem;
          line-height: 1.4;
        }
        .whatsapp-banner-desc {
          margin: 4px 0 0;
          color: var(--text-muted);
          font-size: 0.88rem;
          line-height: 1.4;
        }
        .whatsapp-banner-btn {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border-radius: 50px;
          background: #25D366;
          color: white;
          font-weight: 700;
          font-size: 0.88rem;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(37,211,102,0.25);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        @media (max-width: 768px) {
          .aridos-widget {
            flex-direction: column;
          }
          .aridos-widget-img {
            flex: none;
            min-height: 180px;
            max-height: 200px;
          }
          .aridos-widget-controls {
            flex: none;
            padding: 20px;
          }
          .aridos-widget-controls h3 {
            font-size: 1.15rem !important;
          }
          .cat-featured-card > div:first-child {
            height: 180px !important;
          }
          
          /* Mobile WhatsApp Reminder Banner */
          .whatsapp-reminder-banner {
            padding: 10px 14px;
            gap: 10px;
            margin-bottom: 16px;
          }
          .whatsapp-banner-desc {
            display: none; /* Hide description on mobile to save space */
          }
          .whatsapp-banner-title {
            font-size: 0.82rem;
          }
          .whatsapp-banner-btn {
            padding: 8px 14px;
            font-size: 0.78rem;
          }
          .whatsapp-reminder-banner span {
            font-size: 1.3rem !important;
          }
        }
        @media (max-width: 480px) {
          .aridos-widget-controls {
            padding: 16px;
          }
          .aridos-widget-img {
            max-height: 160px;
          }
        }
      `}</style>

      <div className="page-header">
        <h2>🛒 Catálogo Minorista</h2>
        <p>Encontrá todo lo que necesitás para tu obra.</p>
      </div>

      {/* WHATSAPP REMINDER BANNER */}
      <div className="whatsapp-reminder-banner">
        <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>📲</span>
        <div style={{ flex: 1 }}>
          <p className="whatsapp-banner-title">
            ¿No encontrás lo que buscás?
          </p>
          <p className="whatsapp-banner-desc">
            Consultanos por <strong style={{ color: '#25D366' }}>WhatsApp</strong> la disponibilidad de cualquier material o artículo que no figure en el catálogo.
          </p>
        </div>
        <a
          href="https://wa.me/5493815156321?text=Hola%2C%20quiero%20consultar%20la%20disponibilidad%20de%20un%20producto%20que%20no%20encontr%C3%A9%20en%20el%20cat%C3%A1logo."
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-banner-btn"
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,211,102,0.35)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,211,102,0.25)'; }}
        >
          💬 Consultar
        </a>
      </div>

      {/* BREADCRUMB */}
      <nav style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }} aria-label="Breadcrumb">
        <span
          onClick={resetToCategories}
          style={{
            cursor: 'pointer',
            color: selectedCategory ? 'var(--primary)' : 'var(--text-main)',
            fontWeight: selectedCategory ? 400 : 600,
            transition: 'color 0.2s',
          }}
        >
          Catálogo
        </span>
        {selectedCategory && (
          <>
            <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>›</span>
            <span
              onClick={() => setSelectedSubcategory(null)}
              style={{
                cursor: selectedSubcategory ? 'pointer' : 'default',
                color: selectedSubcategory ? 'var(--primary)' : 'var(--text-main)',
                fontWeight: selectedSubcategory ? 400 : 600,
                transition: 'color 0.2s',
              }}
            >
              {selectedCategory}
            </span>
          </>
        )}
        {selectedSubcategory && (
          <>
            <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>›</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{selectedSubcategory}</span>
          </>
        )}
      </nav>

      {/* SEARCH BAR */}
      <input
        type="text"
        className="search-input"
        placeholder="🔍 Buscar productos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Buscar productos"
      />

      {loading ? (
        /* LOADING SKELETON */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                height: '150px',
                background: 'linear-gradient(90deg, #e9ecef 25%, #f5f5f5 50%, #e9ecef 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }} />
              <div style={{ padding: '16px' }}>
                <div style={{ height: '16px', background: '#e9ecef', borderRadius: '8px', marginBottom: '8px', width: '70%' }} />
                <div style={{ height: '12px', background: '#e9ecef', borderRadius: '6px', width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* ERROR STATE */
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', maxWidth: '500px', margin: '32px auto', animation: 'fadeInUp 0.4s ease-out' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--secondary)', marginBottom: '12px' }}>
            No se pudo cargar el catálogo
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
            Hubo un problema de conexión al obtener los productos del servidor. Por favor, reintentá.
          </p>
          <button className="btn" onClick={handleRetry} style={{ padding: '12px 32px', borderRadius: '50px', fontWeight: 700 }}>
            🔄 Reintentar Carga
          </button>
        </div>
      ) : searchTerm.length >= 3 && !selectedCategory ? (
        /* GLOBAL SEARCH RESULTS */
        <section style={{ animation: 'fadeInUp 0.4s ease-out' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '20px', padding: '12px 16px',
            background: 'var(--bg-color)', borderRadius: 'var(--radius)',
          }}>
            <span style={{ fontSize: '1.2rem' }}>🔍</span>
            <span style={{ color: 'var(--text-muted)' }}>
              {globalSearchItems.length} resultado{globalSearchItems.length !== 1 ? 's' : ''} para &quot;{searchTerm}&quot;
            </span>
          </div>
          {globalSearchItems.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No se encontraron productos.</p>
            </div>
          ) : (
            <div className="grid">
              {globalSearchItems.map((item, idx) => renderProductCard(item, idx))}
            </div>
          )}
        </section>
      ) : !selectedCategory ? (
        /* CATEGORY GRID VIEW */
        <section style={{ animation: 'fadeInUp 0.4s ease-out' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--secondary)', fontSize: '1.3rem', fontWeight: 600 }}>
            Explorar Familias
          </h3>

          {/* FEATURED CATEGORY (Materiales de Construcción) */}
          {(() => {
            const featCat = "🧱 Materiales de Construcción";
            const featItem = categorias.find(([cat]) => cat === featCat);
            if (!featItem) return null;
            const [cat, count] = featItem;
            return (
              <div
                className="card"
                style={{
                  cursor: 'pointer',
                  padding: 0,
                  overflow: 'hidden',
                  marginBottom: '28px',
                  borderLeft: '4px solid var(--primary)',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  animation: 'fadeInUp 0.4s ease-out',
                }}
                onClick={() => handleCategoryClick(cat)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(cat)}
              >
                <div style={{ height: '240px', width: '100%', position: 'relative', backgroundColor: '#eee' }}>
                  <img
                    src={CAT_IMAGENES[cat] || '/cat_obra_gruesa.png'}
                    alt={cat}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '4px 14px',
                    borderRadius: '50px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    ⭐ Especialidad de la Casa
                  </div>
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '24px',
                    background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)',
                    color: 'white',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <h4 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                        {cat}
                      </h4>
                      <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '0.92rem', lineHeight: 1.4, maxWidth: '600px' }}>
                        Nuestra prioridad número uno. Cemento, cal, áridos, hierros, ladrillos y todo lo necesario para cimientos, estructura y obra gruesa.
                      </p>
                    </div>
                    <span style={{
                      background: 'var(--primary)', padding: '6px 16px',
                      borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700,
                      boxShadow: 'var(--shadow-sm)', whiteSpace: 'nowrap'
                    }}>
                      {count} productos
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* OTHER CATEGORIES GRID */}
          <h4 style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Otras Categorías
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {categorias
              .filter(([cat]) => cat !== "🧱 Materiales de Construcción")
              .map(([cat, count]) => (
                <div
                  key={cat}
                  className="card"
                  style={{ cursor: 'pointer', padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onClick={() => handleCategoryClick(cat)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(cat)}
                >
                  <div style={{ height: '120px', width: '100%', position: 'relative', backgroundColor: '#eee' }}>
                    <img
                      src={CAT_IMAGENES[cat] || '/cat_general.png'}
                      alt={cat}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      padding: '10px 14px',
                      background: 'linear-gradient(0deg, rgba(0,0,0,0.75) 0%, transparent 100%)',
                      color: 'white',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{cat}</h5>
                      <span style={{
                        background: 'rgba(255,255,255,0.2)', padding: '2px 8px',
                        borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600,
                      }}>
                        {count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Banner */}
          <div style={{
            position: 'relative', borderRadius: '16px', overflow: 'hidden',
            marginTop: '40px', marginBottom: '10px', boxShadow: 'var(--shadow-md)',
          }}>
            <img
              src="/banner_marcas_larural.jpg"
              alt="Marcas Líderes"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '32px 24px',
              background: 'linear-gradient(0deg, rgba(127,0,0,0.9) 0%, transparent 100%)',
              color: 'white',
            }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '6px', fontWeight: 700 }}>
                🏠 Todo para tu Obra en un Solo Lugar
              </h3>
              <p style={{ opacity: 0.9 }}>Holcim · Amanco · Ferrum · Tersuave · Weber — Orgullosamente afiliados a Disensa</p>
            </div>
          </div>
        </section>
      ) : (
        /* CATEGORY DETAIL VIEW */
        <section style={{ animation: 'fadeInUp 0.4s ease-out' }}>
          <button
            className="btn btn-secondary"
            style={{
              marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px',
              borderRadius: '50px', padding: '10px 20px',
            }}
            onClick={resetToCategories}
          >
            ← Volver a Categorías
          </button>

          <h3 style={{ fontSize: '1.8rem', marginBottom: '8px', color: 'var(--secondary)' }}>
            {selectedCategory}
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            {filteredItems.length} producto{filteredItems.length !== 1 ? 's' : ''}
          </p>

          {/* SUBCATEGORY PILLS */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <button
              onClick={() => setSelectedSubcategory(null)}
              style={{
                padding: '8px 18px', borderRadius: '50px', cursor: 'pointer',
                border: '1px solid var(--border-color)', fontWeight: 500, fontSize: '0.9rem',
                transition: 'all 0.2s',
                background: !selectedSubcategory ? 'var(--primary)' : 'white',
                color: !selectedSubcategory ? 'white' : 'var(--text-main)',
              }}
            >
              Todos
            </button>
            {subcategorias.map(([sub, count]) => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                style={{
                  padding: '8px 18px', borderRadius: '50px', cursor: 'pointer',
                  border: '1px solid var(--border-color)', fontWeight: 500, fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  background: selectedSubcategory === sub ? 'var(--primary)' : 'white',
                  color: selectedSubcategory === sub ? 'white' : 'var(--text-main)',
                }}
              >
                {sub} ({count})
              </button>
            ))}
          </div>

          {/* PRODUCTS BY SUBCATEGORY */}
          {Object.keys(itemsBySubcategory).length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No se encontraron productos.</p>
            </div>
          ) : (
            Object.entries(itemsBySubcategory)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([subcat, items]) => {
                const isAridos = subcat.toLowerCase().includes("arido");
                const isChapas = subcat.toLowerCase() === "chapas";
                const isViguetas = subcat.toLowerCase() === "viguetas";
                const isLadrillos = subcat.toLowerCase() === "ladrillos";
                return (
                  <div key={subcat} style={{ marginBottom: '40px' }}>
                    <h4 style={{
                      fontSize: '1.2rem', color: 'var(--primary)',
                      borderLeft: '3px solid var(--primary)',
                      paddingLeft: '15px', paddingBottom: '8px', marginBottom: '20px',
                    }}>
                      {subcat} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.9rem' }}>· {items.length} productos</span>
                    </h4>
                    
                    {isAridos ? (
                      renderAridosWidget()
                    ) : isChapas ? (
                      <>
                        {renderChapasWidget()}
                        {renderChapasLisasWidget()}
                      </>
                    ) : isViguetas ? (
                      renderViguetasWidget()
                    ) : isLadrillos ? (
                      renderLadrillosWidget()
                    ) : (
                      <div className="grid">
                        {items.map((item, idx) => renderProductCard(item, `${subcat}-${idx}`))}
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </section>
      )}

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
