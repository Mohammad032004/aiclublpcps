"use client";
import { useState } from "react";
import { ArrowRight, ArrowLeft, CheckCircle, User, BookOpen, Code2, FileText } from "lucide-react";
import { SectionHeader, FormField, showToast, Spinner } from "@/components/ui";

interface F {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  github: string;
  linkedin: string;
  branch: string;
  year: string;
  certifications: string;
  skills: string[];
  domains: string[];
  experience: string;
  projectDesc: string;
  whyJoin: string;
  contribution: string;
  goals: string;
}

const INIT: F = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "",
  github: "",
  linkedin: "",
  branch: "",
  year: "",
  certifications: "",
  skills: [],
  domains: [],
  experience: "",
  projectDesc: "",
  whyJoin: "",
  contribution: "",
  goals: ""
};

const SKILLS = [
  "Python",
  "JavaScript",
  "TypeScript",
  "C++",
  "Java",
  "R",
  "SQL",
  "TensorFlow",
  "PyTorch",
  "Scikit-learn",
  "HuggingFace",
  "LangChain",
  "React",
  "Next.js",
  "Docker",
  "Git",
  "Linux",
  "CUDA"
];

const DOMAINS = [
  "Machine Learning",
  "Deep Learning",
  "NLP & LLMs",
  "Computer Vision",
  "Reinforcement Learning",
  "Cybersecurity",
  "Web Development",
  "Data Science",
  "MLOps",
  "Research"
];

const STEPS = [
  { label: "Personal", icon: User },
  { label: "Academics", icon: BookOpen },
  { label: "Skills", icon: Code2 },
  { label: "Statement", icon: FileText }
];

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<F>(INIT);
  const [errors, setErrors] = useState<Partial<F>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const up = (k: keyof F, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: undefined })); };
  const toggle = (k: "skills"|"domains", v: string) => setForm(p => ({ ...p, [k]: p[k].includes(v) ? p[k].filter(x => x !== v) : [...p[k], v] }));

  const validate = () => {
    const e: Partial<Record<keyof F, string>> = {};
    if (step === 0) {
      if (!form.firstName.trim()) e.firstName = "Required";
      if (!form.lastName.trim()) e.lastName = "Required";
      if (!form.email.trim()) e.email = "Required";
      else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = "Valid email required";
      if (!form.phone.trim()) e.phone = "Required";
    }
    if (step === 1) {
  if (!form.branch.trim()) e.branch = "Required";
  if (!form.year) e.year = "Required";
}
    if (step === 3) {
      if (form.whyJoin.trim().length < 30) e.whyJoin = "Please write at least 30 characters";
      if (form.contribution.trim().length < 30) e.contribution = "Please write at least 30 characters";
    }
    setErrors(e as Partial<F>);
    return Object.keys(e).length === 0;
  };

  const next = async () => {
    if (!validate()) { showToast.error("Please fill all required fields before continuing."); return; }
    if (step < 3) { setStep(s => s + 1); return; }
    setLoading(true);
    try {
  const res = await fetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form)
  });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Submission failed");
      setSubmitted(true);
    } catch (e: unknown) { showToast.error(e instanceof Error ? e.message : "Submission failed"); }
    finally { setLoading(false); }
  };

  if (submitted) return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: 520 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--green-bg)", border: "2px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.75rem" }}>
          <CheckCircle size={40} color="var(--green)"/>
        </div>
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Application Submitted!</h2>
        <p style={{ color: "var(--text2)", lineHeight: 1.75, marginBottom: "0.75rem" }}>Thank you, <strong style={{ color: "var(--text1)" }}>{form.firstName}</strong>! Your application for Batch 2026 has been received.</p>
        <p style={{ color: "var(--text2)", lineHeight: 1.75, marginBottom: "2rem" }}>We'll review and respond to <strong style={{ color: "var(--accent2)" }}>{form.email}</strong> within 7 working days.</p>
        <div style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius)", padding: "1rem 1.25rem", marginBottom: "2rem", fontSize: "0.875rem", color: "var(--text2)", lineHeight: 1.7, textAlign: "left" }}>
          <strong style={{ color: "var(--accent2)" }}>What's next?</strong> Shortlisted candidates will be invited for a brief technical/cultural interview over the next 2 weeks.
        </div>
        <button className="btn btn-outline" onClick={() => { setSubmitted(false); setStep(0); setForm(INIT); }}>Submit Another</button>
      </div>
    </div>
  );

  const inp = (k: keyof F, ph: string, t = "text") => (
    <input type={t} className={`input ${errors[k] ? "error" : ""}`} value={form[k] as string} onChange={e => up(k, e.target.value)} placeholder={ph}/>
  );

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "6rem 1.5rem 4rem" }}>
      <SectionHeader tag="Join AI-Club" title="Learn. Build. Innovate." subtitle="Batch 2026 · Applications close on September 10, 2026" center={false}/>

      {/* Stepper */}
      <div className="stepper">
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" as const }}>
            <div className={`step-item ${i < step ? "done" : i === step ? "active" : ""}`}>
              <div className="step-circle">
                {i < step ? <CheckCircle size={18}/> : <s.icon size={16}/>}
              </div>
              <span className="step-label">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`step-line ${i < step ? "done" : ""}`}/>}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="card card-p-lg" style={{ marginBottom: "1.5rem" }}>
        {/* Step 0: Personal */}
        {step === 0 && <>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1.75rem" }}>Personal Information</h3>
          <div className="grid-2">
            <FormField label="First Name" required error={errors.firstName}>{inp("firstName", "Enter Your First Name")}</FormField>
            <FormField label="Last Name" required error={errors.lastName}>{inp("lastName","Enter Your Last Name")}</FormField>
          </div>
          <div className="grid-2">
            <FormField label="Email" required error={errors.email}>{inp("email","user@gmail.com","email")}</FormField>
            <FormField label="Phone" required error={errors.phone}>{inp("phone","+91 98765 43210","tel")}</FormField>
          </div>
          <div className="grid-2">
            <FormField label="Gender">
              <select className="input" value={form.gender} onChange={e => up("gender",e.target.value)}><option value="">Prefer not to say</option><option>Male</option><option>Female</option></select>
            </FormField>
            <FormField label="GitHub">{inp("github","github.com/username")}</FormField>
          </div>
          <FormField label="LinkedIn">{inp("linkedin","linkedin.com/in/username")}</FormField>
        </>}

        {/* Step 1: Academics */}

{step === 1 && <>
  <h3 style={{ fontSize: "1.1rem", marginBottom: "1.75rem" }}>
    Academic Background
  </h3>

  <div className="grid-2">
    <FormField label="Branch / Program" required error={errors.branch}>
      {inp("branch", "B.Tech CSE (AI/ML)")}
    </FormField>

    <FormField label="Current Year" required error={errors.year}>
      <select
        className={`input ${errors.year ? "error" : ""}`}
        value={form.year}
        onChange={e => up("year", e.target.value)}
      >
        <option value="">Select</option>
        <option>1st Year</option>
        <option>2nd Year</option>
        <option>3rd Year</option>
        <option>4th Year</option>
      </select>
    </FormField>
  </div>

  <FormField label="Relevant Courses & Certifications">
    <textarea
      className="input"
      value={form.certifications}
      onChange={e => up("certifications", e.target.value)}
      placeholder="List any AI/ML certifications, online courses…"
    />
  </FormField>
</>}

        {/* Step 2: Skills */}
        {step === 2 && <>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1.75rem" }}>Skills & Interests</h3>
          <div className="form-group">
            <label className="form-label">Technical Skills (select all that apply)</label>
            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", paddingTop: "0.35rem" }}>
              {SKILLS.map(s => (
                <button key={s} type="button" onClick={() => toggle("skills",s)} style={{ background: form.skills.includes(s) ? "var(--accent-bg)" : "var(--bg2)", border: `1.5px solid ${form.skills.includes(s) ? "var(--accent)" : "var(--border)"}`, color: form.skills.includes(s) ? "var(--accent2)" : "var(--text2)", padding: "0.32rem 0.85rem", borderRadius: 100, fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}>{s}</button>
              ))}
            </div>
          </div>
          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label className="form-label">Domains of Interest</label>
            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", paddingTop: "0.35rem" }}>
              {DOMAINS.map(d => (
                <button key={d} type="button" onClick={() => toggle("domains",d)} style={{ background: form.domains.includes(d) ? "var(--purple-bg)" : "var(--bg2)", border: `1.5px solid ${form.domains.includes(d) ? "var(--purple)" : "var(--border)"}`, color: form.domains.includes(d) ? "var(--purple)" : "var(--text2)", padding: "0.32rem 0.85rem", borderRadius: 100, fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}>{d}</button>
              ))}
            </div>
          </div>
          <div className="grid-2" style={{ marginTop: "1rem" }}>
            <FormField label="Experience Level">
              <select className="input" value={form.experience} onChange={e => up("experience",e.target.value)}><option value="">Select</option><option>Beginner — Just starting out</option><option>Intermediate — Some projects done</option><option>Advanced — Multiple projects & competitions</option></select>
            </FormField>
          </div>
          <FormField label="Describe a Project You've Built (or Want to Build)">
            <textarea className="input" value={form.projectDesc} onChange={e => up("projectDesc",e.target.value)} placeholder="What it does, tech used, what you learned…"/>
          </FormField>
        </>}

        {/* Step 3: SOP */}
        {step === 3 && <>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1.75rem" }}>Statement of Purpose</h3>
          <FormField label="Why do you want to join AI-Club?" required error={errors.whyJoin}>
            <textarea className={`input ${errors.whyJoin ? "error" : ""}`} style={{ minHeight: 130 }} value={form.whyJoin} onChange={e => up("whyJoin",e.target.value)} placeholder="What draws you to AI-Club and AI/ML in general…"/>
            <span style={{ fontSize: "0.72rem", color: form.whyJoin.length < 30 ? "var(--text3)" : "var(--green)" }}>{form.whyJoin.length} chars {form.whyJoin.length < 30 && "(min 30)"}</span>
          </FormField>
          <FormField label="How will you contribute?" required error={errors.contribution}>
            <textarea className={`input ${errors.contribution ? "error" : ""}`} style={{ minHeight: 130 }} value={form.contribution} onChange={e => up("contribution",e.target.value)} placeholder="Skills, ideas, or projects you'd like to bring…"/>
            <span style={{ fontSize: "0.72rem", color: form.contribution.length < 30 ? "var(--text3)" : "var(--green)" }}>{form.contribution.length} chars {form.contribution.length < 30 && "(min 30)"}</span>
          </FormField>
          <FormField label="Your 2-year goals">
            <textarea className="input" value={form.goals} onChange={e => up("goals",e.target.value)} placeholder="Research, internships, startup, publications…"/>
          </FormField>
          <div className="alert alert-info" style={{ marginTop: "0.5rem" }}>
            <span>ℹ</span><span>By submitting, you confirm all information is accurate. Reviewed within 7 working days.</span>
          </div>
        </>}
      </div>

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>{step > 0 && <button className="btn btn-ghost" onClick={() => { setStep(s => s - 1); setErrors({}); }}><ArrowLeft size={16}/> Previous</button>}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text3)" }}>Step {step + 1} of {STEPS.length}</span>
          <button className="btn btn-primary" onClick={next} disabled={loading}>
            {loading ? <><Spinner size="sm"/> Submitting…</> : step < 3 ? <>Continue <ArrowRight size={15}/></> : <>Submit Application 🚀</>}
          </button>
        </div>
      </div>
    </div>
  );
}
