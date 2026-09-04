"use client";
import { useState, useEffect } from "react";
import { SectionHeader, Card, Spinner, EmptyState } from "@/components/ui";
import { Search, ExternalLink } from "lucide-react";

interface Project { _id:string; title:string; description:string; category:string; tags?:string[]; github?:string; liveDemo?:string; builtBy?:string[]; year?:number; featured?:boolean; award?:string; }
const CATS = ["All","Machine Learning","Deep Learning","NLP","Computer Vision","Cybersecurity","Web Development","Data Science","Reinforcement Learning"];
const STATIC: Project[] = [
  {_id:"s1",title:"MediScan AI",category:"Computer Vision",description:"CNN-based chest X-ray analyzer. 94% accuracy for pneumonia & TB detection.",tags:["PyTorch","FastAPI","React"],builtBy:["Aryan Kumar","Priya Sharma"],year:2025,featured:true,award:"🏆 Best Project 2024"},
  {_id:"s2",title:"Hindi Sentiment NLP",category:"NLP",description:"BERT fine-tuned on 100K Hindi social posts. 91% F1. HuggingFace deployed.",tags:["HuggingFace","Python","Flask"],builtBy:["Sneha Rao"],year:2025,featured:true},
  {_id:"s3",title:"CyberShield Dashboard",category:"Cybersecurity",description:"Real-time network anomaly detection using LSTM. 96% precision on zero-day classification.",tags:["TensorFlow","Next.js","PostgreSQL"],builtBy:["Vikram Agarwal"],year:2024},
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/projects", { cache:"no-store" }).then(r => r.json())
      .then(d => { setProjects(d.projects?.length ? d.projects : STATIC); })
      .catch(() => setProjects(STATIC))
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p =>
    (cat === "All" || p.category === cat) &&
    `${p.title} ${p.description} ${p.tags?.join(" ") || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-hero">
      <div className="container">
        <SectionHeader tag="Projects" title="What We've Built" subtitle={`${projects.length}+ projects by our members — from research prototypes to production systems.`}/>

        <div style={{ display:"flex", gap:"1rem", marginBottom:"2rem", flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ position:"relative", flex:"1 1 240px", maxWidth:320 }}>
            <Search size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--text3)" }}/>
            <input className="input" style={{ paddingLeft:36 }} placeholder="Search projects…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
            {CATS.map(c => <button key={c} onClick={()=>setCat(c)} className={`btn btn-sm ${cat===c?"btn-primary":"btn-ghost"}`}>{c}</button>)}
          </div>
        </div>

        {loading ? <div style={{ display:"flex", justifyContent:"center", padding:"4rem" }}><Spinner size="lg"/></div>
        : filtered.length === 0 ? <EmptyState icon="🔍" title="No projects found" description="Try different filters."/>
        : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:"1.5rem" }}>
            {filtered.map(p => (
              <Card key={p._id} hover className="card-p-lg">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.75rem" }}>
                  <span style={{ background:"var(--accent-bg)", color:"var(--accent2)", border:"1px solid var(--accent-border)", padding:"0.2rem 0.65rem", borderRadius:100, fontSize:"0.72rem", fontWeight:600 }}>{p.category}</span>
                  {p.award && <span style={{ background:"var(--orange-bg)", color:"var(--orange)", padding:"0.2rem 0.65rem", borderRadius:100, fontSize:"0.72rem", fontWeight:600, border:"1px solid rgba(245,158,11,0.2)" }}>{p.award}</span>}
                </div>
                <h3 style={{ fontSize:"1.05rem", marginBottom:"0.5rem" }}>{p.title}</h3>
                <p style={{ color:"var(--text2)", fontSize:"0.875rem", lineHeight:1.7, marginBottom:"1.25rem" }}>{p.description}</p>
                {p.tags && p.tags.length > 0 && (
                  <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap", marginBottom:"1.1rem" }}>
                    {p.tags.map(t => <span key={t} style={{ background:"var(--bg2)", border:"1px solid var(--border)", color:"var(--text2)", fontSize:"0.72rem", padding:"0.15rem 0.55rem", borderRadius:6 }}>{t}</span>)}
                  </div>
                )}
                {(p.github || p.liveDemo) && (
                  <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1rem" }}>
                    {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><ExternalLink size={12}/> GitHub</a>}
                    {p.liveDemo && <a href={p.liveDemo} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ background:"var(--accent-bg)", color:"var(--accent2)", border:"1px solid var(--accent-border)" }}><ExternalLink size={12}/> Live Demo</a>}
                  </div>
                )}
                {p.builtBy && <div style={{ paddingTop:"0.875rem", borderTop:"1px solid var(--border2)", fontSize:"0.75rem", color:"var(--text3)" }}>by {p.builtBy.join(", ")}{p.year && ` · ${p.year}`}</div>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
