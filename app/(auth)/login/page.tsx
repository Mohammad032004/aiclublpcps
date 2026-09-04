"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";

/**
 * LOGIN PAGE — route: /login
 * Bare page, no Navbar/Footer (handled by (auth)/layout.tsx)
 */
export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid credentials. Please try again.");
        return;
      }
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/admin") ? next : "/admin/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      background: "#050a12",
      fontFamily: "'Space Grotesk', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* BG orbs */}
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "#3b82f6", top: -150, right: -150, filter: "blur(120px)", opacity: 0.08, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "#8b5cf6", bottom: -150, left: -150, filter: "blur(120px)", opacity: 0.08, pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        <div style={{ background: "rgba(10,21,37,0.92)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "2.5rem", backdropFilter: "blur(20px)" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <Zap size={24} color="white" fill="white" />
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.35rem", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Ai-Club</div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.3rem", marginTop: "0.5rem", color: "#e8f0fe" }}>Admin Panel</h2>
            <p style={{ color: "#8ba3c7", fontSize: "0.82rem", marginTop: "0.3rem" }}>Restricted access — authorized members only</p>
          </div>

          {/* Role selector */}
          <div style={{ display: "flex", gap: "0.4rem", background: "rgba(255,255,255,0.04)", padding: "0.3rem", borderRadius: 12, marginBottom: "1.5rem", border: "1px solid rgba(255,255,255,0.07)" }}>
            {["Admin", "Core Member", "Member"].map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                style={{ flex: 1, background: role === r ? "linear-gradient(135deg,#3b82f6,#8b5cf6)" : "transparent", color: role === r ? "white" : "#8ba3c7", border: "none", padding: "0.45rem 0.2rem", borderRadius: 9, fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#8ba3c7", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.45rem" }}>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#8ba3c7" }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@aiclub"
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8f0fe", padding: "0.7rem 1rem 0.7rem 38px", borderRadius: 10, fontSize: "0.875rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "1.4rem" }}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#8ba3c7", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.45rem" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#8ba3c7" }} />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8f0fe", padding: "0.7rem 40px 0.7rem 38px", borderRadius: 10, fontSize: "0.875rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#8ba3c7", cursor: "pointer", display: "flex" }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "0.65rem 1rem", marginBottom: "1.1rem", fontSize: "0.8rem", color: "#f87171" }}>
                <AlertCircle size={13} /> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: "100%", background: loading ? "rgba(59,130,246,0.4)" : "linear-gradient(135deg,#3b82f6,#8b5cf6)", color: "white", border: "none", padding: "0.825rem", borderRadius: 12, fontSize: "0.9rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {loading ? (
                <><span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite", display: "inline-block" }} /> Signing in...</>
              ) : "Sign In to Dashboard"}
            </button>
          </form>

          <p style={{ textAlign: "center", color: "#8ba3c7", fontSize: "0.72rem", marginTop: "1.5rem", lineHeight: 1.6 }}>
            🔒 This page is not publicly linked. Share only with authorized team members.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
