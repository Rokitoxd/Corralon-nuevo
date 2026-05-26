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

  const [aridoTipo, setAridoTipo] = useState("Arena Mediana");
  const [aridoUnidad, setAridoUnidad] = useState("m3");
  const [aridoQty, setAridoQty] = useState(1);

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

  useEffect(() => {
    fetch("/api/catalogo")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setArticulos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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
    <div className="card animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '24px',
      padding: '0',
      overflow: 'hidden',
      borderLeft: '4px solid var(--primary)',
      marginBottom: '32px',
      flexWrap: 'wrap',
      background: 'var(--surface-color)',
      boxShadow: 'var(--shadow-md)',
      width: '100%',
      animation: 'fadeInUp 0.4s ease-out'
    }}>
      {/* Image container */}
      <div style={{
        flex: '1 1 300px',
        minHeight: '240px',
        position: 'relative',
        backgroundColor: '#eee'
      }}>
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
      <div style={{
        flex: '1 1 350px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
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
      `}</style>

      <div className="page-header">
        <h2>🛒 Catálogo Minorista</h2>
        <p>Encontrá todo lo que necesitás para tu obra.</p>
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
          {/* Banner */}
          <div style={{
            position: 'relative', borderRadius: '16px', overflow: 'hidden',
            marginBottom: '30px', boxShadow: 'var(--shadow-md)',
          }}>
            <img
              src="/banner_marcas_larural.jpg"
              alt="Marcas Líderes"
              style={{ width: '100%', display: 'block', maxHeight: '280px', objectFit: 'cover' }}
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

          <h3 style={{ marginBottom: '20px', color: 'var(--secondary)', fontSize: '1.3rem', fontWeight: 600 }}>
            Explorar Familias
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {categorias.map(([cat, count]) => (
              <div
                key={cat}
                className="card"
                style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }}
                onClick={() => handleCategoryClick(cat)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(cat)}
              >
                <div style={{ height: '150px', width: '100%', position: 'relative', backgroundColor: '#eee' }}>
                  <img
                    src={CAT_IMAGENES[cat] || '/cat_general.png'}
                    alt={cat}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '12px 16px',
                    background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
                    color: 'white',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>{cat}</h4>
                    <span style={{
                      background: 'rgba(255,255,255,0.2)', padding: '2px 10px',
                      borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600,
                    }}>
                      {count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
