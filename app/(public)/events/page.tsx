"use client";
import { useState, useEffect, useCallback } from "react";
import { ArrowRight, Calendar, MapPin, Users, RefreshCw, X, Check } from "lucide-react";
import { SectionHeader, Card, Modal, FormField, showToast, StatusBadge, Spinner } from "@/components/ui";

interface ClubEvent { _id: string; title: string; type: string; description?: string; date?: string; location?: string; maxAttendees?: number; status: "upcoming"|"ongoing"|"past"|"cancelled"; registrationOpen: boolean; tags?: string[]; }
interface RegForm { name: string; email: string; phone: string; branch: string; year: string; }
const INIT: RegForm = { name: "", email: "", phone: "", branch: "", year: "" };
const TYPE_GRADS: Record<string, string> = {
  workshop: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  hackathon: "linear-gradient(135deg,#06b6d4,#6366f1)",
  talk: "linear-gradient(135deg,#10b981,#06b6d4)",
  meetup: "linear-gradient(135deg,#f59e0b,#ef4444)",
  competition: "linear-gradient(135deg,#8b5cf6,#ec4899)",
};

function RegModal({ event, onClose }: { event: ClubEvent; onClose: () => void }) {
  const [form, setForm] = useState<RegForm>(INIT);
  const [errors, setErrors] = useState<Partial<RegForm>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const e: Partial<RegForm> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.branch.trim()) e.branch = "Branch is required";
    if (!form.year) e.year = "Please select your year";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await fetch("/api/event-registrations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event._id, ...form }),
      });
      setDone(true);
    } catch { showToast.error("Registration failed. Please try again."); }
    finally { setLoading(false); }
  };

  if (done) return (
    <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--green-bg)", border: "2px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
        <Check size={30} color="var(--green)"/>
      </div>
      <h3 style={{ fontSize: "1.3rem", marginBottom: "0.75rem" }}>You're Registered!</h3>
      <p style={{ color: "var(--text2)", lineHeight: 1.7, marginBottom: "0.5rem" }}>Thanks, <strong style={{ color: "var(--text1)" }}>{form.name}</strong>!</p>
      <p style={{ color: "var(--text2)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>Confirmation sent to <strong style={{ color: "var(--accent2)" }}>{form.email}</strong></p>
      <button className="btn btn-primary" onClick={onClose}>Done</button>
    </div>
  );

  return (
    <>
      <div style={{ marginBottom: "1.25rem", padding: "0.875rem 1rem", background: "var(--accent-bg)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-sm)" }}>
        <p style={{ fontSize: "0.82rem", color: "var(--accent2)", fontWeight: 600 }}>{event.title}</p>
        {event.date && <p style={{ fontSize: "0.78rem", color: "var(--text2)", marginTop: "0.2rem" }}>📅 {new Date(event.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
        <FormField label="Full Name" required error={errors.name}>
          <input className={`input ${errors.name ? "error" : ""}`} value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: undefined })); }} placeholder="Rahul Sharma"/>
        </FormField>
        <FormField label="Email Address" required error={errors.email}>
          <input type="email" className={`input ${errors.email ? "error" : ""}`} value={form.email} onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: undefined })); }} placeholder="rahul@college.edu.in"/>
        </FormField>
        <FormField label="Phone Number" required error={errors.phone}>
          <input type="tel" className={`input ${errors.phone ? "error" : ""}`} value={form.phone} onChange={e => { setForm(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: undefined })); }} placeholder="+91 98765 43210"/>
        </FormField>
        <FormField label="Branch / Program" required error={errors.branch}>
          <input className={`input ${errors.branch ? "error" : ""}`} value={form.branch} onChange={e => { setForm(p => ({ ...p, branch: e.target.value })); setErrors(p => ({ ...p, branch: undefined })); }} placeholder="B.Tech CSE (AI/ML)"/>
        </FormField>
      </div>
      <FormField label="Current Year" required error={errors.year}>
        <select className={`input ${errors.year ? "error" : ""}`} value={form.year} onChange={e => { setForm(p => ({ ...p, year: e.target.value })); setErrors(p => ({ ...p, year: undefined })); }}>
          <option value="">Select your year</option>
          <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
        </select>
      </FormField>
      <div style={{ marginTop: "0.5rem" }}>
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={submit} disabled={loading}>
          {loading ? <><Spinner size="sm"/> Registering…</> : <>Confirm Registration <ArrowRight size={14}/></>}
        </button>
      </div>
    </>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [regTarget, setRegTarget] = useState<ClubEvent | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/events", { cache: "no-store" });
      const d = await r.json();
      setEvents(d.events || []);
    } catch { showToast.error("Failed to load events"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = events.filter(e =>
    (statusFilter === "all" || e.status === statusFilter) &&
    (typeFilter === "all" || e.type === typeFilter)
  );

  const types = ["all", ...Array.from(new Set(events.map(e => e.type)))];

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <SectionHeader tag="Events" title="Workshops, Hackathons & Talks" subtitle="From beginner workshops to national hackathons — something for everyone."/>

          {/* Stats */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
            {[{ label: "Total Events", value: events.length, color: "var(--accent)" }, { label: "Upcoming", value: events.filter(e => e.status === "upcoming").length, color: "var(--green)" }, { label: "Past Events", value: events.filter(e => e.status === "past").length, color: "var(--purple)" }].map(s => (
              <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--radius)", padding: "1rem 1.75rem", textAlign: "center", minWidth: 120 }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text2)", marginTop: "0.3rem", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2.5rem", alignItems: "center" }}>
            {["all", "upcoming", "ongoing", "past"].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)} className={`btn btn-sm ${statusFilter === f ? "btn-primary" : "btn-ghost"}`} style={{ textTransform: "capitalize" }}>
                {f === "all" ? "All Events" : f}
              </button>
            ))}
            <div style={{ width: 1, height: 24, background: "var(--border)" }}/>
            {types.map(f => (
              <button key={f} onClick={() => setTypeFilter(f)} className="btn btn-sm" style={{ textTransform: "capitalize", background: typeFilter === f ? "var(--accent-bg)" : "var(--bg2)", color: typeFilter === f ? "var(--accent2)" : "var(--text2)", border: `1px solid ${typeFilter === f ? "var(--accent-border)" : "var(--border)"}` }}>
                {f === "all" ? "All Types" : f}
              </button>
            ))}
            <button onClick={load} className="btn btn-ghost btn-sm btn-icon" title="Refresh">
              <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }}/>
            </button>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.5rem" }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: "var(--radius-lg)" }}/>)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "var(--text2)" }}>
              <Calendar size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }}/>
              <p style={{ fontWeight: 600, marginBottom: "0.4rem" }}>No events found</p>
              <p style={{ fontSize: "0.875rem", color: "var(--text3)" }}>{events.length === 0 ? "Events will appear here once created by admin." : "Try different filters."}</p>
            </div>
          ) : (
            <div className="grid-auto">
              {filtered.map(e => (
                <Card key={e._id} hover style={{ overflow: "hidden" }}>
                  <div style={{ height: 100, background: TYPE_GRADS[e.type] || TYPE_GRADS.workshop, padding: "1rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", padding: "0.22rem 0.65rem", borderRadius: 100, fontSize: "0.72rem", fontWeight: 600, backdropFilter: "blur(8px)", textTransform: "capitalize" }}>{e.type}</span>
                    <StatusBadge status={e.status}/>
                  </div>
                  <div className="card-p">
                    <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>{e.title}</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "0.875rem" }}>
                      {e.date && <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--text2)" }}><Calendar size={12}/>{new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                      {e.location && <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--text2)" }}><MapPin size={12}/>{e.location}</span>}
                      {e.maxAttendees && <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--text2)" }}><Users size={12}/>Max {e.maxAttendees} attendees</span>}
                    </div>
                    {e.description && <p style={{ fontSize: "0.85rem", color: "var(--text2)", lineHeight: 1.65, marginBottom: "1rem" }}>{e.description.slice(0, 120)}{e.description.length > 120 ? "…" : ""}</p>}
                    {e.tags && e.tags.length > 0 && <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                      {e.tags.map(t => <span key={t} style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text2)", fontSize: "0.7rem", padding: "0.15rem 0.55rem", borderRadius: 6 }}>{t}</span>)}
                    </div>}
                    {e.status === "upcoming" && e.registrationOpen
                      ? <button className="btn btn-primary btn-sm" onClick={() => setRegTarget(e)}>Register Now <ArrowRight size={13}/></button>
                      : <button className="btn btn-ghost btn-sm" style={{ cursor: "default" }}>Registration {e.registrationOpen ? "Opens Soon" : "Closed"}</button>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={!!regTarget} onClose={() => setRegTarget(null)} title="Event Registration" size="md">
        {regTarget && <RegModal event={regTarget} onClose={() => setRegTarget(null)}/>}
      </Modal>
    </>
  );
}
