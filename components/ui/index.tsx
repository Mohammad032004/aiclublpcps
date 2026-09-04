"use client";
import React, { useState, useEffect } from "react";
import { Sun, Moon, Check, X, AlertCircle, Info } from "lucide-react";

/* ─── Theme Toggle ─── */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };
  return (
    <button onClick={toggle} className={`btn btn-ghost btn-icon ${className}`}
      title={dark ? "Light mode" : "Dark mode"}
      style={{ color: "var(--text2)", borderRadius: "50%", transition: "all 0.2s" }}>
      {dark ? <Sun size={18}/> : <Moon size={18}/>}
    </button>
  );
}

/* ─── Section Header ─── */
export function SectionHeader({ tag, title, subtitle, center = true }: {
  tag?: string; title: string; subtitle?: string; center?: boolean;
}) {
  return (
    <div style={{ textAlign: center ? "center" : "left", marginBottom: "3rem" }}>
      {tag && <div className="section-tag">{tag}</div>}
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle" style={{ margin: center ? "0 auto" : undefined }}>{subtitle}</p>}
    </div>
  );
}

/* ─── Card ─── */
export function Card({ children, className = "", hover = false, style = {} }: {
  children: React.ReactNode; className?: string; hover?: boolean; style?: React.CSSProperties;
}) {
  return (
    <div className={`card ${hover ? "card-hover" : ""} ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ─── Status Badge ─── */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "badge-orange" },
    accepted: { label: "Accepted", cls: "badge-green" },
    rejected: { label: "Rejected", cls: "badge-red" },
    active: { label: "Active", cls: "badge-green" },
    inactive: { label: "Inactive", cls: "badge-gray" },
    alumni: { label: "Alumni", cls: "badge-purple" },
    upcoming: { label: "Upcoming", cls: "badge-blue" },
    ongoing: { label: "Ongoing", cls: "badge-cyan" },
    past: { label: "Past", cls: "badge-gray" },
    cancelled: { label: "Cancelled", cls: "badge-red" },
    public: { label: "Public", cls: "badge-green" },
    members: { label: "Members", cls: "badge-blue" },
  };
  const s = map[status] || { label: status, cls: "badge-gray" };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

/* ─── Loading Spinner ─── */
export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return <div className={`spinner spinner-${size}`}/>;
}

/* ─── Empty State ─── */
export function EmptyState({ icon, title, description }: { icon?: string; title: string; description?: string }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <p style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.4rem" }}>{title}</p>
      {description && <p style={{ fontSize: "0.85rem", color: "var(--text3)" }}>{description}</p>}
    </div>
  );
}

/* ─── Toast system ─── */
type ToastItem = { id: number; message: string; type: "success" | "error" | "info" | "warning" };
let toastId = 0;
let setToastsGlobal: React.Dispatch<React.SetStateAction<ToastItem[]>> | null = null;

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  useEffect(() => { setToastsGlobal = setToasts; return () => { setToastsGlobal = null; }; }, []);
  const remove = (id: number) => setToasts(p => p.filter(t => t.id !== id));
  const colors = { success: { bg: "var(--green-bg)", border: "rgba(16,185,129,0.3)", color: "var(--green)", icon: <Check size={14}/> }, error: { bg: "var(--red-bg)", border: "rgba(239,68,68,0.3)", color: "var(--red)", icon: <X size={14}/> }, info: { bg: "var(--accent-bg)", border: "var(--accent-border)", color: "var(--accent2)", icon: <Info size={14}/> }, warning: { bg: "var(--orange-bg)", border: "rgba(245,158,11,0.3)", color: "var(--orange)", icon: <AlertCircle size={14}/> } };
  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 9999, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {toasts.map(t => {
        const c = colors[t.type];
        return (
          <div key={t.id} onClick={() => remove(t.id)} style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color, padding: "0.7rem 1rem", borderRadius: "10px", fontSize: "0.875rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", animation: "slideInRight 0.3s ease", backdropFilter: "blur(8px)", boxShadow: "var(--shadow)", maxWidth: 320, minWidth: 200 }}>
            {c.icon}<span style={{ flex: 1 }}>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}

export const showToast = {
  success: (msg: string) => {
    if (!setToastsGlobal) return;
    const id = ++toastId;
    setToastsGlobal(p => [...p, { id, message: msg, type: "success" }]);
    setTimeout(() => setToastsGlobal?.(p => p.filter(t => t.id !== id)), 3500);
  },
  error: (msg: string) => {
    if (!setToastsGlobal) return;
    const id = ++toastId;
    setToastsGlobal(p => [...p, { id, message: msg, type: "error" }]);
    setTimeout(() => setToastsGlobal?.(p => p.filter(t => t.id !== id)), 4000);
  },
  info: (msg: string) => {
    if (!setToastsGlobal) return;
    const id = ++toastId;
    setToastsGlobal(p => [...p, { id, message: msg, type: "info" }]);
    setTimeout(() => setToastsGlobal?.(p => p.filter(t => t.id !== id)), 3000);
  },
};

/* ─── Modal ─── */
export function Modal({ open, onClose, title, children, size = "md" }: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode; size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  const maxW = size === "sm" ? 420 : size === "lg" ? 720 : 560;
  return (
    <div className="modal-backdrop animate-fade" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: maxW }} onClick={e => e.stopPropagation()}>
        {title && (
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm"><X size={16}/></button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ─── Confirm Dialog ─── */
export function useConfirm() {
  const [state, setState] = useState<{ open: boolean; message: string; resolve?: (v: boolean) => void }>({ open: false, message: "" });
  const confirm = (message: string): Promise<boolean> => new Promise(resolve => setState({ open: true, message, resolve }));
  const Dialog = () => !state.open ? null : (
    <div className="modal-backdrop animate-fade">
      <div className="modal-box" style={{ maxWidth: 380 }}>
        <p style={{ marginBottom: "1.5rem", color: "var(--text2)", lineHeight: 1.6 }}>{state.message}</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={() => { state.resolve?.(false); setState({ open: false, message: "" }); }}>Cancel</button>
          <button className="btn btn-danger" onClick={() => { state.resolve?.(true); setState({ open: false, message: "" }); }}>Delete</button>
        </div>
      </div>
    </div>
  );
  return { confirm, Dialog };
}

/* ─── FormField helper ─── */
export function FormField({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span style={{ color: "var(--red)", marginLeft: 3 }}>*</span>}</label>
      {children}
      {error && <span className="form-error">⚠ {error}</span>}
    </div>
  );
}

/* ─── Avatar ─── */
const GRAD_POOL = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#10b981,#06b6d4)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#8b5cf6,#ec4899)",
  "linear-gradient(135deg,#06b6d4,#6366f1)",
];
export function Avatar({ name, size = "md", index = 0 }: { name: string; size?: "sm" | "md" | "lg"; index?: number }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`avatar avatar-${size}`} style={{ background: GRAD_POOL[index % GRAD_POOL.length] }}>
      {initials}
    </div>
  );
}
