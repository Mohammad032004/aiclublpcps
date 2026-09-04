"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Brain } from "lucide-react";
import { ThemeToggle } from "@/components/ui";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/projects", label: "Projects" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/login")) return null;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <nav className="navbar" style={{
        background: scrolled ? "var(--surface)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--border2)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        transition: "all 0.3s ease",
      }}>
        <div className="navbar-inner">
          {/* Logo */}
<Link
  href="/"
  style={{
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "0.6rem"
  }}
>
  <img
    src="/ai-club-logo.png"
    alt="AI Club"
    style={{
      width: 42,
      height: 42,
      objectFit: "contain"
    }}
  />

  <span
    style={{
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 700,
      fontSize: "1.15rem",
      color: "var(--text1)"
    }}
  >
    AI-CLUB
  </span>
</Link>

          {/* Desktop nav */}
          <div className="hidden-mobile" style={{ display: "flex", gap: "1.75rem", alignItems: "center" }}>
            {NAV.map(l => (
              <Link key={l.href} href={l.href} className={`nav-link ${pathname === l.href ? "active" : ""}`}>{l.label}</Link>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ThemeToggle/>
            <Link href="/apply" className="btn btn-primary btn-sm hidden-mobile">Apply Now</Link>
            <button className="btn btn-ghost btn-icon" style={{ display: "none" }} id="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: "fixed", top: 64, left: 0, right: 0, background: "var(--surface)", borderBottom: "1px solid var(--border2)", padding: "1.25rem 1.5rem", zIndex: 199, animation: "slideUp 0.2s ease" }}>
          {NAV.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              style={{ display: "block", padding: "0.6rem 0", color: pathname === l.href ? "var(--accent)" : "var(--text2)", textDecoration: "none", fontWeight: 500, fontSize: "0.95rem", borderBottom: "1px solid var(--border2)" }}>
              {l.label}
            </Link>
          ))}
          <Link href="/apply" onClick={() => setMenuOpen(false)} className="btn btn-primary" style={{ marginTop: "1rem", width: "100%", justifyContent: "center" }}>Apply Now</Link>
        </div>
      )}

      <style>{`@media(max-width:768px){.hidden-mobile{display:none!important;}#mobile-menu-btn{display:flex!important;}}`}</style>
    </>
  );
}
