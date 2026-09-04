import Link from "next/link";
import { Brain, Globe, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ background: "var(--surface)", borderTop: "1px solid var(--border2)", padding: "3rem 1.5rem 2rem" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "2.5rem", marginBottom: "2.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.875rem" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Brain size={16} color="white"/>
              </div>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: "var(--text1)" }}>AI-CLUB</span>
            </div>
            <p style={{ color: "var(--text2)", fontSize: "0.875rem", lineHeight: 1.7, maxWidth: 280, marginBottom: "1.25rem" }}>
              Premier AI/ML and Cybersecurity student community at LPCPS, Lucknow.
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[{ icon: Globe, href: "#", label: "GitHub" }, { icon: Globe, href: "#", label: "LinkedIn" }, { icon: Mail, href: "mailto:aiclub@lpcps.org", label: "Email" }].map(s => (
                <a key={s.label} href={s.href} title={s.label} style={{ width: 34, height: 34, borderRadius: 8, background: "var(--bg2)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text2)", textDecoration: "none", transition: "all 0.2s" }}>
                  <s.icon size={15}/>
                </a>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "0.8rem", color: "var(--text1)", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Navigate</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[{ href: "/", l: "Home" }, { href: "/about", l: "About" }, { href: "/events", l: "Events" }, { href: "/projects", l: "Projects" }, { href: "/resources", l: "Resources" }].map(lk => (
                <Link key={lk.href} href={lk.href} style={{ color: "var(--text2)", fontSize: "0.875rem", textDecoration: "none" }}>{lk.l}</Link>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "0.8rem", color: "var(--text1)", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Join Us</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[{ href: "/apply", l: "Apply Now" }, { href: "/contact", l: "Contact Us" }, { href: "/about", l: "Meet the Team" }].map(lk => (
                <Link key={lk.href} href={lk.href} style={{ color: "var(--text2)", fontSize: "0.875rem", textDecoration: "none" }}>{lk.l}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="divider-gradient" style={{ marginBottom: "1.5rem" }}/>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <span style={{ color: "var(--text3)", fontSize: "0.8rem" }}>© 2025 AI-Club · LPCPS, Lucknow</span>
          <span style={{ color: "var(--text3)", fontSize: "0.8rem" }}>Built by the community, for the community</span>
        </div>
      </div>
    </footer>
  );
}
