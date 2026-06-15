import "./globals.css";
import { Inter } from "next/font/google";
import { CartProvider } from "@/components/CartContext";
import HeaderClient from "@/components/HeaderClient";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "Corralon La Rural | Materiales de Construcción en Tucumán",
  description:
    "Tu corralón de confianza en Tucumán, Argentina. Materiales de construcción, ferretería, plomería y más. Envíos a obra. Afiliados a Disensa.",
  keywords: [
    "materiales de construcción",
    "corralón",
    "tucumán",
    "ferretería",
    "plomería",
    "Disensa",
    "envíos a obra",
  ],
  metadataBase: new URL("https://corralonlarural.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Corralon La Rural | Materiales de Construcción en Tucumán",
    description:
      "Tu corralón de confianza en Tucumán, Argentina. Materiales de construcción, ferretería, plomería y más. Envíos a obra.",
    url: "https://corralonlarural.com",
    siteName: "Corralon La Rural",
    locale: "es_AR",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#a00e08",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.variable} data-scroll-behavior="smooth">
      <body className={inter.className}>
        <CartProvider>
          {/* ── Header (client component for interactivity) ── */}
          <HeaderClient />

          {/* ── Info Strip ── */}
          <div className="info-strip" role="banner">
            <span>🚀</span> ¿Cómo comprar? <span>•</span>
            1️⃣ Elegí tus materiales <span>→</span>
            2️⃣ Revisá tu carrito <span>→</span>
            3️⃣ Enviá tu pedido por <strong>WhatsApp</strong>
          </div>

          {/* ── Brand Marquee Strip ── */}
          <div className="brand-strip" aria-label="Marcas que trabajamos">
            <div className="brand-marquee">
              {/* Two identical sets for seamless infinite scroll */}
              {[0, 1].map((set) => (
                <div key={set} style={{ display: 'contents' }}>
                  <div className="brand-marquee-label">Nuestras Marcas</div>
                  <div className="brand-marquee-item disensa">
                    <img src="/Logo-Disensa.png" alt="Disensa" />
                  </div>
                  <div className="brand-marquee-item">
                    <img src="/Holcim_Logo_2021_sRGB.png" alt="Holcim" />
                  </div>
                  <div className="brand-marquee-item">
                    <img src="/amanco-logo-png_seeklogo-203056.png" alt="Amanco" />
                  </div>
                  <div className="brand-marquee-item">
                    <img src="/ferrum-seeklogo.png" alt="Ferrum" />
                  </div>
                  <div className="brand-marquee-item">
                    <img src="/tersuave-seeklogo.png" alt="Tersuave" />
                  </div>
                  <div className="brand-marquee-item">
                    <img src="/Weber Saint Gobain.png" alt="Weber Saint-Gobain" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Main Content ── */}
          <main className="container main-content">{children}</main>

          {/* ── Footer ── */}
          <footer className="footer">
            <div className="footer-grid">
              {/* Column 1 — About */}
              <div className="footer-col">
                <div className="footer-logo">
                  <img
                    src="/WhatsApp Image 2026-03-18 at 16.45.55.jpeg"
                    alt="Corralon La Rural"
                    width={40}
                    height={40}
                  />
                  <span>Corralon La Rural</span>
                </div>
                <p>
                  Tu corralón de confianza en Tucumán. Materiales de construcción,
                  ferretería, plomería, electricidad y más. Calidad, precio y
                  atención personalizada para tu obra.
                </p>
              </div>

              {/* Column 2 — Navigation */}
              <div className="footer-col">
                <h3>Navegación</h3>
                <Link href="/">Inicio</Link>
                <Link href="/catalogo">Catálogo completo</Link>
                <Link href="/calculadora">Calculadora de materiales</Link>
                <Link href="/planilla">Enviar planilla</Link>
                <Link href="/carrito">Mi pedido</Link>
                <h3 style={{ marginTop: 24 }}>Legal</h3>
                <Link href="/terminos">Términos y Condiciones</Link>
                <Link href="/privacidad">Política de Privacidad</Link>
              </div>

              {/* Column 3 — Hours & Address */}
              <div className="footer-col">
                <h3>Horarios y Ubicación</h3>
                <p>
                  🕐 Lunes a Viernes<br />
                  08:00 a 17:00hs
                </p>
                <p style={{ marginTop: 4 }}>
                  🕐 Sábados<br />
                  08:00 a 12:30hs
                </p>
                <p style={{ marginTop: 12 }}>
                  📍 Av. Camino del Perú 1291<br />
                  Tucumán, Argentina
                </p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Av+Camino+del+Peru+1291+Tucuman+Argentina"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-map-link"
                >
                  📌 Ver en Google Maps →
                </a>
              </div>

              {/* Column 4 — Contact & Brands */}
              <div className="footer-col">
                <h3>Contacto</h3>
                <a
                  href="https://wa.me/5493815156321"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#25d366", fontWeight: 600 }}
                >
                  💬 WhatsApp: +54 9 3815 15-6321
                </a>
                <p style={{ marginTop: 8, fontSize: "0.82rem" }}>
                  💳 Efectivo · Transferencia · Débito/Crédito<br />
                  🚚 Envíos a obra
                </p>

                <h3 style={{ marginTop: 24 }}>Nuestras Marcas</h3>
                <div className="footer-brands">
                  <img
                    src="/Logo-Disensa.png"
                    alt="Disensa"
                    className="footer-disensa"
                  />
                  <img src="/Holcim_Logo_2021_sRGB.png" alt="Holcim" />
                  <img src="/amanco-logo-png_seeklogo-203056.png" alt="Amanco" />
                  <img src="/ferrum-seeklogo.png" alt="Ferrum" />
                  <img src="/tersuave-seeklogo.png" alt="Tersuave" />
                  <img src="/Weber Saint Gobain.png" alt="Weber Saint-Gobain" />
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <span>© {new Date().getFullYear()} Corralon La Rural. Todos los derechos reservados. Afiliados a Disensa.</span>
              <div className="footer-legal-links">
                <Link href="/terminos">Términos y Condiciones</Link>
                <span className="footer-legal-sep">·</span>
                <Link href="/privacidad">Política de Privacidad</Link>
              </div>
            </div>
          </footer>

          {/* ── Floating WhatsApp Button ── */}
          <a
            href="https://wa.me/5493815156321"
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-float"
            aria-label="Contactanos por WhatsApp"
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
        </CartProvider>
      </body>
    </html>
  );
}
