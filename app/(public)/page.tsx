"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Brain, Zap, Trophy, Users, Calendar, FlaskConical, ChevronRight } from "lucide-react";
import { Card, SectionHeader } from "@/components/ui";

interface ClubEvent { _id: string; title: string; type: string; description?: string; date?: string; location?: string; status: string; registrationOpen: boolean; tags?: string[]; }
interface Project { _id: string; title: string; description: string; category: string; tags?: string[]; builtBy?: string[]; featured?: boolean; }

function Counter({ target, suffix = "+" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let cur = 0; const step = target / 60;
      const t = setInterval(() => { cur = Math.min(cur + step, target); setVal(Math.floor(cur)); if (cur >= target) clearInterval(t); }, 16);
      obs.disconnect();
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  workshop: { bg: "var(--accent-bg)", text: "var(--accent2)", border: "var(--accent-border)" },
  hackathon: { bg: "var(--cyan-bg)", text: "var(--cyan)", border: "rgba(6,182,212,0.2)" },
  talk: { bg: "var(--green-bg)", text: "var(--green)", border: "rgba(16,185,129,0.2)" },
  meetup: { bg: "var(--orange-bg)", text: "var(--orange)", border: "rgba(245,158,11,0.2)" },
  competition: { bg: "var(--purple-bg)", text: "var(--purple)", border: "rgba(139,92,246,0.2)" },
};
const GRADS = ["linear-gradient(135deg,#6366f1,#8b5cf6)", "linear-gradient(135deg,#06b6d4,#6366f1)", "linear-gradient(135deg,#10b981,#06b6d4)", "linear-gradient(135deg,#f59e0b,#ef4444)"];

export default function HomePage() {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetch("/api/events?status=upcoming").then(r => r.json()),
      fetch("/api/projects?admin=false").then(r => r.json()),
    ]).then(([evtRes, prjRes]) => {
      if (evtRes.status === "fulfilled") setEvents(evtRes.value.events?.slice(0, 3) || []);
      if (prjRes.status === "fulfilled") setProjects(prjRes.value.projects?.filter((p: Project & { featured?: boolean }) => p.featured).slice(0, 3) || []);
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { icon: Users, value: 100, label: "Active Members", color: "var(--accent)", bg: "var(--accent-bg)" },
    { icon: FlaskConical, value: 50, label: "Projects Built", color: "var(--purple)", bg: "var(--purple-bg)" },
    { icon: Trophy, value: 20, label: "Awards Won", color: "var(--cyan)", bg: "var(--cyan-bg)" },
    { icon: Calendar, value: 30, label: "Events Held", color: "var(--green)", bg: "var(--green-bg)" },
  ];

  const domains = [
    { icon: Brain, title: "Machine Learning", desc: "Neural networks, transformers, and real-world AI systems.", color: "var(--accent)", bg: "var(--accent-bg)" },
    { icon: Zap, title: "Hackathons", desc: "Competitive coding — local, national, and international.", color: "var(--cyan)", bg: "var(--cyan-bg)" },
    { icon: Calendar, title: "Workshops & Talks", desc: "Weekly sessions, guest lectures, and hands-on sprints.", color: "var(--green)", bg: "var(--green-bg)" },
    { icon: FlaskConical, title: "Research Projects", desc: "Publication-quality work with industry collaboration.", color: "var(--purple)", bg: "var(--purple-bg)" },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <section style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "4rem 1.5rem" }}>
        {/* bg blobs */}
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08))", top: -200, right: -100, filter: "blur(80px)", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "rgba(6,182,212,0.06)", bottom: -150, left: -100, filter: "blur(80px)", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,var(--border2) 1px,transparent 1px)", backgroundSize: "36px 36px", pointerEvents: "none" }}/>

        <div style={{ textAlign: "center", maxWidth: 820, position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--green-bg)", border: "1px solid rgba(16,185,129,0.25)", padding: "0.3rem 1rem", borderRadius: 100, fontSize: "0.78rem", color: "var(--green)", fontWeight: 600, marginBottom: "1.75rem" }}>
            <span className="status-dot green"/> Applications Open · Batch 2026
          </div>

          <h1 style={{ fontSize: "clamp(2.5rem,7vw,5rem)", fontWeight: 800, lineHeight: 1.05, marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>
            Building the Future<br/>
            <span className="gradient-text">with Artificial Intelligence</span>
          </h1>

          <p style={{ fontSize: "1.1rem", color: "var(--text2)", maxWidth: 560, margin: "0 auto 2.5rem", lineHeight: 1.75 }}>
            A community of AI/ML enthusiasts, hackers, and researchers at LPCPS. We build intelligent systems, win hackathons, and push what's possible.
          </p>

          <div style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2.5rem" }}>
            <Link href="/apply" className="btn btn-primary btn-lg">Join AI-Club <ArrowRight size={18}/></Link>
            <Link href="/projects" className="btn btn-outline btn-lg">Explore Projects</Link>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            {["AI & ML", "Deep Learning", "NLP & LLMs", "Computer Vision", "Cybersecurity", "MLOps"].map(t => (
              <span key={t} style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text2)", fontSize: "0.78rem", padding: "0.3rem 0.85rem", borderRadius: 100 }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: "3rem 1.5rem", background: "var(--surface)", borderTop: "1px solid var(--border2)", borderBottom: "1px solid var(--border2)" }}>
        <div className="container grid-4">
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: "center", padding: "1.5rem 1rem", background: s.bg, border: `1px solid ${s.color}22`, borderRadius: "var(--radius-lg)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.875rem" }}>
                <s.icon size={20} color={s.color}/>
              </div>
              <div style={{ fontSize: "2.2rem", fontWeight: 800, color: s.color, lineHeight: 1, fontFamily: "'Space Grotesk',sans-serif", marginBottom: "0.3rem" }}>
                <Counter target={s.value}/>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--text2)", fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What we do ── */}
      <section className="section">
        <div className="container">
          <SectionHeader tag="What We Do" title="Where Curiosity Meets Capability" subtitle="From ML research to competitive hacking — we build, learn, and grow together."/>
          <div className="grid-4">
            {domains.map(d => (
              <Card key={d.title} hover className="card-p-lg">
                <div style={{ width: 46, height: 46, borderRadius: 12, background: d.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.1rem" }}>
                  <d.icon size={22} color={d.color}/>
                </div>
                <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>{d.title}</h3>
                <p style={{ color: "var(--text2)", fontSize: "0.875rem", lineHeight: 1.65 }}>{d.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming Events ── */}
      <section className="section" style={{ background: "var(--bg2)", borderTop: "1px solid var(--border2)" }}>
        <div className="container">
          <SectionHeader tag="Events" title="What's Coming Up" subtitle="Register early — spots fill fast."/>
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.5rem" }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 260, borderRadius: "var(--radius-lg)" }}/>)}
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text2)" }}>
              <Calendar size={40} style={{ margin: "0 auto 1rem", opacity: 0.4 }}/>
              <p>No upcoming events — check back soon!</p>
            </div>
          ) : (
            <div className="grid-auto">
              {events.map((e, i) => {
                const tc = TYPE_COLORS[e.type] || TYPE_COLORS.workshop;
                return (
                  <Card key={e._id} hover style={{ overflow: "hidden" }}>
                    <div style={{ height: 100, background: GRADS[i % GRADS.length], padding: "1rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <span style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`, padding: "0.22rem 0.65rem", borderRadius: 100, fontSize: "0.72rem", fontWeight: 600, backdropFilter: "blur(8px)" }}>{e.type}</span>
                      {e.registrationOpen && <span style={{ background: "rgba(16,185,129,0.2)", color: "#10b981", padding: "0.2rem 0.55rem", borderRadius: 100, fontSize: "0.68rem", fontWeight: 600 }}>Open</span>}
                    </div>
                    <div className="card-p">
                      <h3 style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}>{e.title}</h3>
                      {e.date && <p style={{ fontSize: "0.8rem", color: "var(--text2)", marginBottom: "0.5rem" }}>📅 {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>}
                      {e.location && <p style={{ fontSize: "0.8rem", color: "var(--text2)", marginBottom: "0.875rem" }}>📍 {e.location}</p>}
                      {e.description && <p style={{ fontSize: "0.85rem", color: "var(--text2)", lineHeight: 1.65, marginBottom: "1rem" }}>{e.description.slice(0, 100)}{e.description.length > 100 ? "…" : ""}</p>}
                      <Link href="/events" className="btn btn-primary btn-sm">
                        {e.registrationOpen ? "Register" : "View Details"} <ArrowRight size={13}/>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link href="/events" className="btn btn-outline">All Events <ChevronRight size={16}/></Link>
          </div>
        </div>
      </section>

      {/* ── Featured Projects ── */}
      {(projects.length > 0 || !loading) && (
        <section className="section">
          <div className="container">
            <SectionHeader tag="Projects" title="What We've Built" subtitle="A snapshot of work by our members."/>
            <div className="grid-auto">
              {projects.map(p => (
                <Card key={p._id} hover className="card-p-lg">
                  <h3 style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}>{p.title}</h3>
                  <span style={{ background: "var(--accent-bg)", color: "var(--accent2)", border: "1px solid var(--accent-border)", padding: "0.18rem 0.6rem", borderRadius: 100, fontSize: "0.7rem", fontWeight: 600, display: "inline-block", marginBottom: "0.75rem" }}>{p.category}</span>
                  <p style={{ color: "var(--text2)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>{p.description}</p>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {p.tags?.slice(0, 3).map(t => <span key={t} style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text2)", fontSize: "0.72rem", padding: "0.15rem 0.55rem", borderRadius: 6 }}>{t}</span>)}
                  </div>
                  {p.builtBy && <div style={{ marginTop: "1rem", paddingTop: "0.875rem", borderTop: "1px solid var(--border2)", fontSize: "0.75rem", color: "var(--text3)" }}>by {p.builtBy.join(", ")}</div>}
                </Card>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
              <Link href="/projects" className="btn btn-outline">All Projects <ChevronRight size={16}/></Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section style={{ padding: "5rem 1.5rem", background: "linear-gradient(135deg,var(--accent-bg),var(--purple-bg))", borderTop: "1px solid var(--accent-border)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚀</div>
          <h2 style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)", marginBottom: "1rem" }}>Ready to build the future?</h2>
          <p style={{ color: "var(--text2)", fontSize: "1.05rem", lineHeight: 1.75, marginBottom: "2rem" }}>Join 10+ members who are learning, building, and competing. Batch 2026 applications are open.</p>
          <div style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/apply" className="btn btn-primary btn-lg">Apply Now <ArrowRight size={18}/></Link>
            <Link href="/contact" className="btn btn-outline btn-lg">Get in Touch</Link>
          </div>
        </div>
      </section>
    </>
  );
}
