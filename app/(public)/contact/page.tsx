"use client";
import { useState } from "react";
import { SectionHeader, FormField, Spinner, showToast } from "@/components/ui";
import { Mail, MapPin, Clock, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.subject.trim()) e.subject = "Required";
    if (!form.message.trim() || form.message.length < 10) e.message = "Message too short";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const r = await fetch("/api/messages", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setSent(true);
    } catch(e: unknown) { showToast.error(e instanceof Error ? e.message : "Failed to send"); }
    finally { setLoading(false); }
  };

  if (sent) return (
    <div style={{ minHeight:"calc(100vh - 64px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
      <div style={{ textAlign:"center", maxWidth:480 }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"var(--green-bg)", border:"2px solid var(--green)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.5rem" }}><CheckCircle size={36} color="var(--green)"/></div>
        <h2 style={{ fontSize:"1.75rem", marginBottom:"0.875rem" }}>Message Sent!</h2>
        <p style={{ color:"var(--text2)", lineHeight:1.7, marginBottom:"2rem" }}>Thanks for reaching out, <strong>{form.name}</strong>! We'll reply to <strong style={{ color:"var(--accent2)" }}>{form.email}</strong> within 2 working days.</p>
        <button className="btn btn-outline" onClick={()=>{ setSent(false); setForm({name:"",email:"",subject:"",message:""}); }}>Send Another</button>
      </div>
    </div>
  );

  return (
    <div className="page-hero">
      <div className="container">
        <SectionHeader tag="Contact" title="Get in Touch" subtitle="Have a question, idea, or want to collaborate? We'd love to hear from you."/>
        <div className="grid-2" style={{ maxWidth:1000, margin:"0 auto" }}>
          {/* Info */}
          <div>
            {[{ icon:MapPin, label:"Location", value:"LPCPS, Lucknow, Uttar Pradesh" },{ icon:Mail, label:"Email", value:"aiclublpcps01@gmail.com" },{ icon:Clock, label:"Response Time", value:"Within 2 working days" }].map(item=>(
              <div key={item.label} style={{ display:"flex", gap:"1rem", marginBottom:"1.75rem" }}>
                <div style={{ width:44, height:44, borderRadius:12, background:"var(--accent-bg)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><item.icon size={20} color="var(--accent)"/></div>
                <div><p style={{ fontWeight:600, marginBottom:"0.2rem" }}>{item.label}</p><p style={{ color:"var(--text2)", fontSize:"0.875rem" }}>{item.value}</p></div>
              </div>
            ))}
            <div style={{ background:"var(--accent-bg)", border:"1px solid var(--accent-border)", borderRadius:"var(--radius)", padding:"1.25rem" }}>
              <p style={{ fontWeight:600, marginBottom:"0.5rem", color:"var(--accent2)" }}>💡 Quick Links</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
                {[["Apply for AI-Club","/apply"],["View upcoming events","/events"],["Explore projects","/projects"]].map(([label,href])=>(
                  <a key={href} href={href} style={{ color:"var(--text2)", fontSize:"0.875rem", textDecoration:"none" }}>→ {label}</a>
                ))}
              </div>
            </div>
          </div>
          {/* Form */}
          <div className="card card-p-lg">
            <div className="grid-2">
              <FormField label="Name" required error={errors.name}><input className={`input ${errors.name?"error":""}`} value={form.name} onChange={e=>{setForm(p=>({...p,name:e.target.value}));setErrors(p=>({...p,name:""}));}} placeholder="Your name"/></FormField>
              <FormField label="Email" required error={errors.email}><input type="email" className={`input ${errors.email?"error":""}`} value={form.email} onChange={e=>{setForm(p=>({...p,email:e.target.value}));setErrors(p=>({...p,email:""}));}} placeholder="you@example.com"/></FormField>
            </div>
            <FormField label="Subject" required error={errors.subject}><input className={`input ${errors.subject?"error":""}`} value={form.subject} onChange={e=>{setForm(p=>({...p,subject:e.target.value}));setErrors(p=>({...p,subject:""}));}} placeholder="What's this about?"/></FormField>
            <FormField label="Message" required error={errors.message}><textarea className={`input ${errors.message?"error":""}`} style={{ minHeight:140 }} value={form.message} onChange={e=>{setForm(p=>({...p,message:e.target.value}));setErrors(p=>({...p,message:""}));}} placeholder="Tell us more…"/></FormField>
            <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={submit} disabled={loading}>
              {loading ? <><Spinner size="sm"/> Sending…</> : "Send Message"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
