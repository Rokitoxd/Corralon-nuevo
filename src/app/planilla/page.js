"use client";

import { useState } from "react";
import Link from "next/link";

export default function Planilla() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [estado, setEstado] = useState("");
  const [uploading, setUploading] = useState(false);
  const tel_whatsapp = "5493815139567";

  const handleSubir = async (e) => {
    e.preventDefault();
    if (!nombre || !telefono || !archivo) {
      setEstado("⚠️ Completá tu nombre, teléfono y adjuntá el archivo.");
      return;
    }

    setUploading(true);
    setEstado("⏳ Subiendo...");

    const formData = new FormData();
    formData.append("name", nombre);
    formData.append("phone", telefono);
    formData.append("file", archivo);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setEstado("✅ ¡Documento procesado! Un ejecutivo comercial lo está revisando.");
      } else {
        setEstado("❌ Error al subir el archivo.");
      }
    } catch (err) {
      setEstado("❌ Error de red.");
    } finally {
      setUploading(false);
    }
  };

  const avisarWhatsApp = () => {
    const msg = `Hola Corralon La Rural, subí mi planilla de materiales a nombre de ${nombre} (${telefono}). Aguardo respuesta para avanzar.`;
    window.open(`https://wa.me/${tel_whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const isSuccess = estado.startsWith("✅");
  const isError = estado.startsWith("❌");

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressStripe {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
        @keyframes checkBounce {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div className="page-header">
        <h2>📂 Cotizaciones a Medida</h2>
        <p>Subí tu Excel o plano en PDF y recibí un presupuesto exacto con descuentos por volumen.</p>
      </div>

      {/* TRUST SIGNALS */}
      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px', marginBottom: '32px',
      }}>
        {[
          { emoji: '⏱️', text: 'Respuesta en menos de 2 horas' },
          { emoji: '💰', text: 'Descuentos por volumen' },
          { emoji: '👷', text: 'Asesoramiento incluido' },
        ].map(({ emoji, text }, i) => (
          <div key={i} className="card" style={{
            textAlign: 'center', padding: '20px 16px',
            background: 'var(--bg-color)', border: '1px solid var(--border-color)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{emoji}</div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: 'var(--secondary)' }}>{text}</p>
          </div>
        ))}
      </section>

      {/* FORM CARD */}
      <div className="card" style={{
        maxWidth: '560px', margin: '0 auto', padding: '36px',
        animation: 'fadeInUp 0.4s ease-out',
      }}>
        {!isSuccess ? (
          <form onSubmit={handleSubir}>
            {/* Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, fontSize: '0.95rem' }}>
                <span>👤</span> Tu Nombre o Empresa
              </label>
              <input
                type="text"
                className="search-input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Juan Pérez / Constructora XYZ"
                style={{ marginBottom: 0 }}
              />
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, fontSize: '0.95rem' }}>
                <span>📞</span> Teléfono de contacto
              </label>
              <input
                type="text"
                className="search-input"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: 381-555-1234"
                style={{ marginBottom: 0 }}
              />
            </div>

            {/* File */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, fontSize: '0.95rem' }}>
                <span>📎</span> Adjuntá tu Excel, PDF o Foto
              </label>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '28px 20px', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius)',
                cursor: 'pointer', transition: 'all 0.2s',
                background: archivo ? 'var(--success-light)' : 'var(--bg-color)',
                borderColor: archivo ? 'var(--success)' : 'var(--border-color)',
              }}>
                <input
                  type="file"
                  onChange={(e) => setArchivo(e.target.files[0])}
                  style={{ display: 'none' }}
                />
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
                  {archivo ? '✅' : '📄'}
                </div>
                <p style={{ margin: 0, color: archivo ? 'var(--success)' : 'var(--text-muted)', fontWeight: 500, textAlign: 'center' }}>
                  {archivo ? archivo.name : 'Arrastrá o hacé clic para adjuntar'}
                </p>
                {!archivo && (
                  <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Excel, PDF, JPG, PNG
                  </p>
                )}
              </label>
            </div>

            {/* PROGRESS BAR */}
            {uploading && (
              <div style={{
                height: '6px', borderRadius: '3px', overflow: 'hidden',
                marginBottom: '16px', background: 'var(--border-color)',
              }}>
                <div style={{
                  height: '100%', width: '100%',
                  background: 'repeating-linear-gradient(45deg, var(--primary), var(--primary) 10px, var(--primary-light) 10px, var(--primary-light) 20px)',
                  backgroundSize: '40px 40px',
                  animation: 'progressStripe 0.8s linear infinite',
                }} />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn"
              disabled={uploading}
              style={{
                width: '100%', padding: '14px', borderRadius: '10px',
                fontSize: '1.05rem', opacity: uploading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              📤 {uploading ? 'Subiendo...' : 'Subir Documentos'}
            </button>

            {/* Warning/Error status */}
            {estado && !isSuccess && (
              <div style={{
                marginTop: '16px', padding: '14px 16px', borderRadius: '10px',
                background: isError ? '#ffebee' : '#fff3e0',
                border: `1px solid ${isError ? '#ef9a9a' : '#ffcc80'}`,
                textAlign: 'center', fontWeight: 500,
                color: isError ? '#c62828' : '#e65100',
              }}>
                {estado}
              </div>
            )}
          </form>
        ) : (
          /* SUCCESS STATE */
          <div style={{ textAlign: 'center', animation: 'fadeInUp 0.5s ease-out' }}>
            <div style={{
              fontSize: '4rem', marginBottom: '16px',
              animation: 'checkBounce 0.5s ease-out',
            }}>
              ✅
            </div>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--success)', marginBottom: '8px' }}>
              ¡Documento procesado!
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '1rem' }}>
              Un ejecutivo comercial lo está revisando.
            </p>
            <button
              className="btn"
              onClick={avisarWhatsApp}
              style={{
                width: '100%', backgroundColor: '#25D366', padding: '14px',
                borderRadius: '50px', fontSize: '1.05rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              🟢 Avisar al local por WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}
