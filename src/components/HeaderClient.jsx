"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartContext";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/calculadora", label: "Calculadora" },
  { href: "/planilla", label: "Enviar Planilla" },
];

export default function HeaderClient() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* Track scroll for header style change */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  /* Prevent body scroll when menu open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header className={`header${scrolled ? " scrolled" : ""}`}>
        <div className="container header-content">
          {/* Logo */}
          <Link href="/" className="logo" aria-label="Inicio - Corralon La Rural">
            <img
              src="/WhatsApp Image 2026-03-18 at 16.45.55.jpeg"
              alt="Corralon La Rural logo"
              className="logo-img"
              width={44}
              height={44}
            />
            <div className="logo-text">
              <h1>Corralon La Rural</h1>
              <p>Tu Corralón de Confianza</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className={`nav${menuOpen ? " open" : ""}`} aria-label="Navegación principal">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Cart button */}
          <Link href="/carrito" className="header-cart-btn" aria-label={`Carrito: ${totalItems} artículos`}>
            🛒 <span className="cart-text">Mi Pedido</span>
            <span className={`cart-badge${totalItems === 0 ? " empty" : ""}`}>
              {totalItems}
            </span>
          </Link>

          {/* Hamburger */}
          <button
            className={`hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {menuOpen && (
        <div
          className="nav-overlay show"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
