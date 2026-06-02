"use client";

import { useState } from "react";

export default function Planilla() {
  const [nombre, setNombre] = useState("");
  const [nota, setNota] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [estado, setEstado] = useState("idle"); // idle | uploading | success | error
  const [blobUrl, setBlobUrl] = useState("");
  const tel_whatsapp = "5493815156321";

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!nombre || !archivo) {
      alert("⚠️ Completá tu nombre y seleccioná el archivo antes de continuar.");
      return;
    }

    setEstado("uploading");

    try {
      const formData = new FormData();
      formData.append("name", nombre);
      formData.append("note", nota);
      formData.append("file", archivo);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const url = data.url;
      setBlobUrl(url);

      // Build WhatsApp message with the real public URL
      let msg = `Hola Corralón La Rural, mi nombre es *${nombre}* y quiero cotizar materiales.\n`;
      if (nota.trim()) {
        msg += `\n- *Aclaración:* ${nota.trim()}\n`;
      }
      msg += `\n*Documento adjunto:*\n${url}`;

      setEstado("success");

      // Auto-open WhatsApp
      window.open(
        `https://wa.me/${tel_whatsapp}?text=${encodeURIComponent(msg)}`,
        "_blank"
      );
    } catch (err) {
      console.error(err);
      setEstado("error");
    }
  };

  const handleReintentar = () => {
    setEstado("idle");
    setNombre("");
    setNota("");
    setArchivo(null);
    setBlobUrl("");
  };

  const abrirWhatsApp = () => {
    let msg = `Hola Corralón La Rural, mi nombre es *${nombre}* y quiero cotizar materiales.\n`;
    if (nota.trim()) msg += `\n- *Aclaración:* ${nota.trim()}\n`;
    if (blobUrl) msg += `\n*Documento adjunto:*\n${blobUrl}`;
    window.open(`https://wa.me/${tel_whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes checkBounce {
          0%   { transform: scale(0); }
          50%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .upload-spinner {
          width: 48px; height: 48px;
          border: 4px solid #e0e0e0;
          border-top-color: #25D366;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px;
        }
        .blob-url-box {
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 0.78rem;
          word-break: break-all;
          color: var(--text-muted);
          margin-top: 16px;
        }
      `}</style>

      <div className="page-header">
        <h2>📂 Cotizaciones a Medida</h2>
        <p>Subí tu planilla o foto y la enviamos directo por WhatsApp. Nuestro equipo te responde rápido.</p>
      </div>

      {/* TRUST SIGNALS */}
      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px', marginBottom: '32px',
      }}>
        {[
          { emoji: '⚡', text: 'Respuesta rápida por WhatsApp' },
          { emoji: '💰', text: 'Descuentos por volumen' },
          { emoji: '👷', text: 'Asesoramiento incluido' },
        ].map(({ emoji, text }, i) => (
          <div key={i} className="card" style={{
            textAlign: 'center', padding: '20px 16px',
            background: 'var(--bg-color)', border: '1px solid var(--border-color)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{emoji}</div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: 'var(--secondary)' }}>{text}</p>
          </div>
        ))}
      </section>

      {/* MAIN CARD */}
      <div className="card" style={{
        maxWidth: '560px', margin: '0 auto', padding: 'clamp(16px, 5vw, 36px)',
        animation: 'fadeInUp 0.4s ease-out',
      }}>

        {/* ── IDLE / FORM ── */}
        {estado === "idle" && (
          <form onSubmit={handleEnviar}>

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
                required
              />
            </div>

            {/* Note */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, fontSize: '0.95rem' }}>
                <span>📝</span> Nota o aclaración{' '}
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85rem' }}>(opcional)</span>
              </label>
              <textarea
                className="search-input"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Ej: Necesito el material puesto en Yerba Buena, o cualquier indicación extra..."
                style={{
                  marginBottom: 0, minHeight: '90px', resize: 'vertical',
                  fontFamily: 'inherit', padding: '12px', lineHeight: '1.5',
                  display: 'block', width: '100%', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* File */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, fontSize: '0.95rem' }}>
                <span>📎</span> Adjuntá tu archivo
              </label>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '28px 20px', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius)',
                cursor: 'pointer', transition: 'all 0.2s',
                background: archivo ? '#e8f5e9' : 'var(--bg-color)',
                borderColor: archivo ? '#66bb6a' : 'var(--border-color)',
              }}>
                <input
                  type="file"
                  onChange={(e) => setArchivo(e.target.files[0])}
                  style={{ display: 'none' }}
                  accept=".xls,.xlsx,.pdf,.jpg,.jpeg,.png,.doc,.docx"
                  required
                />
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
                  {archivo ? '✅' : '📄'}
                </div>
                <p style={{ margin: 0, color: archivo ? '#2e7d32' : 'var(--text-muted)', fontWeight: 500, textAlign: 'center', fontSize: '0.95rem' }}>
                  {archivo ? archivo.name : 'Tocá para seleccionar el archivo'}
                </p>
                {!archivo && (
                  <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Excel · PDF · JPG · PNG · Word
                  </p>
                )}
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn"
              style={{
                width: '100%', padding: '14px', borderRadius: '10px',
                fontSize: '1.05rem', backgroundColor: '#25D366',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              📤 Subir y enviar por WhatsApp
            </button>
          </form>
        )}

        {/* ── UPLOADING ── */}
        {estado === "uploading" && (
          <div style={{ textAlign: 'center', padding: '32px 0', animation: 'fadeInUp 0.3s ease-out' }}>
            <div className="upload-spinner" />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Subiendo tu archivo...</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
              Un momento, esto tarda solo unos segundos.
            </p>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {estado === "success" && (
          <div style={{ textAlign: 'center', animation: 'fadeInUp 0.4s ease-out' }}>
            <div style={{ fontSize: '3.5rem', animation: 'checkBounce 0.5s ease-out', marginBottom: '12px' }}>✅</div>
            <h3 style={{ fontSize: '1.25rem', color: '#2e7d32', marginBottom: '8px' }}>
              ¡Archivo subido y WhatsApp abierto!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '8px' }}>
              Se envió el mensaje con el enlace de descarga de tu archivo. El local ya puede verlo con un clic.
            </p>
            {blobUrl && (
              <div className="blob-url-box">
                🔗 Enlace del archivo: <a href={blobUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>{blobUrl}</a>
              </div>
            )}
            <button
              className="btn"
              onClick={abrirWhatsApp}
              style={{
                width: '100%', backgroundColor: '#25D366', padding: '14px', marginTop: '20px',
                borderRadius: '50px', fontSize: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              🟢 Abrir WhatsApp de nuevo
            </button>
            <button
              onClick={handleReintentar}
              style={{
                width: '100%', marginTop: '12px', background: 'none', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem',
                textDecoration: 'underline', padding: '8px',
              }}
            >
              ← Enviar otra consulta
            </button>
          </div>
        )}

        {/* ── ERROR ── */}
        {estado === "error" && (
          <div style={{ textAlign: 'center', animation: 'fadeInUp 0.4s ease-out' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>❌</div>
            <h3 style={{ fontSize: '1.2rem', color: '#c62828', marginBottom: '8px' }}>
              Error al subir el archivo
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Revisá tu conexión e intentá de nuevo. Si el problema persiste, contactanos directamente por WhatsApp.
            </p>
            <button
              className="btn"
              onClick={() => setEstado("idle")}
              style={{ width: '100%', marginBottom: '12px' }}
            >
              Intentar de nuevo
            </button>
            <button
              className="btn"
              onClick={() => {
                let msg = `Hola Corralón La Rural 👋, mi nombre es *${nombre}* y quiero cotizar materiales.`;
                if (nota.trim()) msg += `\n\n📝 *Aclaración:* ${nota.trim()}`;
                window.open(`https://wa.me/${tel_whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
              }}
              style={{ width: '100%', backgroundColor: '#25D366' }}
            >
              🟢 Ir a WhatsApp de todas formas
            </button>
          </div>
        )}

      </div>
    </>
  );
}
