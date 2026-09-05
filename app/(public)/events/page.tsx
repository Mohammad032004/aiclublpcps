"use client";
import { useState, useEffect, useCallback } from "react";
import { ArrowRight, Calendar, MapPin, Users, RefreshCw, X, Check } from "lucide-react";
import { SectionHeader, Card, Modal, FormField, showToast, StatusBadge, Spinner } from "@/components/ui";

interface ClubEvent {
  _id: string;
  title: string;
  type: string;
  description?: string;
  date?: string;
  location?: string;
  maxAttendees?: number;
  maxTeamSize?: number;
  allowTeams?: boolean;
  status: "upcoming" | "ongoing" | "past" | "cancelled";
  registrationOpen: boolean;
  tags?: string[];
}
interface TeamMember {
  name: string;
  email: string;
  phone: string;
  branch: string;
  year: string;
}

interface RegForm {
  name: string;
  email: string;
  phone: string;
  branch: string;
  year: string;
  teamSize: string;
  teamMembers: TeamMember[];
}

const INIT: RegForm = {
  name: "",
  email: "",
  phone: "",
  branch: "",
  year: "",
  teamSize: "1",
  teamMembers: [],
};

const EMPTY_MEMBER: TeamMember = {
  name: "",
  email: "",
  phone: "",
  branch: "",
  year: "",
};
const TYPE_GRADS: Record<string, string> = {
  workshop: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  hackathon: "linear-gradient(135deg,#06b6d4,#6366f1)",
  talk: "linear-gradient(135deg,#10b981,#06b6d4)",
  meetup: "linear-gradient(135deg,#f59e0b,#ef4444)",
  competition: "linear-gradient(135deg,#8b5cf6,#ec4899)",
};

function RegModal({ event, onClose }: { event: ClubEvent; onClose: () => void }) {
  const [form, setForm] = useState<RegForm>(INIT);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const teamSize = event.allowTeams
    ? Math.max(1, Number(form.teamSize) || 1)
    : 1;

  const updateTeamSize = (value: string) => {
    const size = Math.max(1, Number(value) || 1);

    setForm(prev => ({
      ...prev,
      teamSize: value,
      teamMembers: Array.from(
        { length: Math.max(0, size - 1) },
        (_, index) => prev.teamMembers[index] || { ...EMPTY_MEMBER }
      ),
    }));

    setErrors(prev => ({ ...prev, teamSize: undefined }));
  };

  const updateTeamMember = (
    index: number,
    field: keyof TeamMember,
    value: string
  ) => {
    setForm(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, memberIndex) =>
        memberIndex === index
          ? { ...member, [field]: value }
          : member
      ),
    }));

    setErrors(prev => ({
      ...prev,
      [`teamMember_${index}_${field}`]: undefined,
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.branch.trim()) e.branch = "Branch is required";
    if (!form.year) e.year = "Please select your year";
    if (event.allowTeams && (!form.teamSize || Number(form.teamSize) < 1)) e.teamSize = "Please select team size";
    if (event.allowTeams && event.maxTeamSize && Number(form.teamSize) > event.maxTeamSize) {
      e.teamSize = `Maximum ${event.maxTeamSize} members allowed`;
    }

    if (event.allowTeams && teamSize > 1) {
      for (let i = 0; i < teamSize - 1; i++) {
        const member = form.teamMembers[i] || EMPTY_MEMBER;
        if (!member.name.trim()) e[`teamMember_${i}_name`] = `Member ${i + 2} name is required`;
        if (!member.email.trim()) e[`teamMember_${i}_email`] = `Member ${i + 2} email is required`;
        else if (!/^[^@]+@[^@]+\.[^@]+$/.test(member.email)) e[`teamMember_${i}_email`] = `Enter a valid email for Member ${i + 2}`;
        if (!member.phone.trim()) e[`teamMember_${i}_phone`] = `Member ${i + 2} phone is required`;
        if (!member.branch.trim()) e[`teamMember_${i}_branch`] = `Member ${i + 2} branch is required`;
        if (!member.year) e[`teamMember_${i}_year`] = `Select Member ${i + 2} year`;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/event-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event._id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          branch: form.branch,
          year: form.year,
          teamSize: event.allowTeams ? Number(form.teamSize) : 1,
          teamMembers: event.allowTeams
            ? form.teamMembers.slice(0, teamSize - 1).map((member) => ({
                name: member.name.trim(),
                email: member.email.trim(),
                phone: member.phone.trim(),
                branch: member.branch.trim(),
                year: member.year,
              }))
            : [],
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || data?.message || "Registration failed");
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
      {event.allowTeams && (
        <FormField
          label="Team Member Size"
          required
          error={errors.teamSize}
        >
          <select
            className={`input ${errors.teamSize ? "error" : ""}`}
            value={form.teamSize}
            onChange={e => {
              updateTeamSize(e.target.value);
            }}
          >
            {Array.from({ length: Math.max(1, event.maxTeamSize || 4) }, (_, i) => i + 1).map(size => (
              <option key={size} value={size}>
                {size} {size === 1 ? "Member" : "Members"}
              </option>
            ))}
          </select>
          <p style={{ fontSize: "0.72rem", color: "var(--text3)", marginTop: "0.35rem" }}>
            {event.maxTeamSize ? `This hackathon allows up to ${event.maxTeamSize} members per team.` : "Select the number of members in your team."}
          </p>
        </FormField>
      )}
      {event.allowTeams && teamSize > 1 && (
        <div
          style={{
            marginTop: "1rem",
            marginBottom: "1rem",
            padding: "1rem",
            border: "1px solid var(--border2)",
            borderRadius: "var(--radius)",
            background: "var(--bg2)",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>
              Team Member Details
            </h4>
            <p style={{ fontSize: "0.75rem", color: "var(--text3)", marginTop: "0.25rem" }}>
              Enter details for the other {teamSize - 1} member{teamSize - 1 === 1 ? "" : "s"}. The first person is the team leader.
            </p>
          </div>

          {form.teamMembers.slice(0, teamSize - 1).map((member, index) => {
            const memberNumber = index + 2;
            const fieldError = (field: keyof TeamMember): string | undefined =>
              errors[`teamMember_${index}_${field}`];

            return (
              <div
                key={index}
                style={{
                  marginBottom: index === teamSize - 2 ? 0 : "1.25rem",
                  padding: "1rem",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface)",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    marginBottom: "0.9rem",
                    color: "var(--accent2)",
                  }}
                >
                  Member {memberNumber}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0 1rem",
                  }}
                >
                  <FormField label="Full Name" required error={fieldError("name") as string | undefined}>
                    <input
                      className={`input ${fieldError("name") ? "error" : ""}`}
                      value={member.name}
                      onChange={e => updateTeamMember(index, "name", e.target.value)}
                      placeholder="Member full name"
                    />
                  </FormField>

                  <FormField label="Email Address" required error={fieldError("email") as string | undefined}>
                    <input
                      type="email"
                      className={`input ${fieldError("email") ? "error" : ""}`}
                      value={member.email}
                      onChange={e => updateTeamMember(index, "email", e.target.value)}
                      placeholder="member@college.edu.in"
                    />
                  </FormField>

                  <FormField label="Phone Number" required error={fieldError("phone") as string | undefined}>
                    <input
                      type="tel"
                      className={`input ${fieldError("phone") ? "error" : ""}`}
                      value={member.phone}
                      onChange={e => updateTeamMember(index, "phone", e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </FormField>

                  <FormField label="Branch / Program" required error={fieldError("branch") as string | undefined}>
                    <input
                      className={`input ${fieldError("branch") ? "error" : ""}`}
                      value={member.branch}
                      onChange={e => updateTeamMember(index, "branch", e.target.value)}
                      placeholder="B.Tech CSE"
                    />
                  </FormField>
                </div>

                <FormField label="Current Year" required error={fieldError("year") as string | undefined}>
                  <select
                    className={`input ${fieldError("year") ? "error" : ""}`}
                    value={member.year}
                    onChange={e => updateTeamMember(index, "year", e.target.value)}
                  >
                    <option value="">Select member year</option>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </FormField>
              </div>
            );
          })}
        </div>
      )}

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
      const r = await fetch("/api/events", {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(d?.error || d?.message || "Failed to load events");
      }

      // Support both:
      // { events: [...] }
      // and a direct [...] API response.
      const list = Array.isArray(d)
        ? d
        : Array.isArray(d?.events)
          ? d.events
          : Array.isArray(d?.data)
            ? d.data
            : [];

      setEvents(list);
    } catch (error) {
      setEvents([]);
      showToast.error(
        error instanceof Error ? error.message : "Failed to load events"
      );
    } finally {
      setLoading(false);
    }
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
                      {typeof e.maxAttendees === "number" && e.maxAttendees > 0 && (
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--text2)" }}>
                          <Users size={12}/>
                          Max {e.maxAttendees} attendees
                        </span>
                      )}
                      {e.allowTeams && typeof e.maxTeamSize === "number" && e.maxTeamSize > 1 && (
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--text2)" }}>
                          <Users size={12}/>
                          Teams up to {e.maxTeamSize}
                        </span>
                      )}
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
