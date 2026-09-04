"use client";
import { useState, useEffect } from "react";
import { SectionHeader, Card, Spinner, EmptyState, StatusBadge } from "@/components/ui";
import { FileText, Video, BookOpen, Link as LinkIcon, Download } from "lucide-react";

interface Resource { _id:string; title:string; description?:string; category:string; type:string; url?:string; fileSize?:string; access:"public"|"members"; downloads:number; }
const CATS = ["All","ai_ml","web_dev","cybersecurity","research","career"];
const CAT_LABELS: Record<string,string> = { ai_ml:"AI/ML", web_dev:"Web Dev", cybersecurity:"Cybersecurity", research:"Research", career:"Career" };
const TYPE_ICONS: Record<string, React.ComponentType<{size?:number;color?:string}>> = { pdf:FileText, video:Video, guide:BookOpen, notebook:BookOpen, link:LinkIcon };
const TYPE_COLORS: Record<string,string> = { pdf:"var(--red)", video:"var(--purple)", guide:"var(--green)", notebook:"var(--orange)", link:"var(--cyan)" };

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("All");

  useEffect(() => {
    fetch("/api/resources?access=all", { cache:"no-store" }).then(r => r.json())
      .then(d => setResources(d.resources || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = resources.filter(r => cat === "All" || r.category === cat);

  return (
    <div className="page-hero">
      <div className="container">
        <SectionHeader tag="Resources" title="Curated Learning Materials" subtitle="Notes, recordings, guides, and research papers from our team."/>
        <div style={{ display:"flex", gap:"0.5rem", justifyContent:"center", flexWrap:"wrap", marginBottom:"2.5rem" }}>
          {CATS.map(c => <button key={c} onClick={()=>setCat(c)} className={`btn btn-sm ${cat===c?"btn-primary":"btn-ghost"}`}>{c==="All"?"All":CAT_LABELS[c]||c}</button>)}
        </div>
        {loading ? <div style={{ display:"flex", justifyContent:"center", padding:"4rem" }}><Spinner size="lg"/></div>
        : filtered.length === 0 ? <EmptyState icon="📚" title="No resources yet" description="Resources added by admin will appear here."/>
        : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:"1.25rem" }}>
            {filtered.map(r => {
              const Icon = TYPE_ICONS[r.type] || FileText;
              const color = TYPE_COLORS[r.type] || "var(--accent)";
              return (
                <Card key={r._id} hover style={{ padding:"1.5rem", display:"flex", gap:"1rem", alignItems:"flex-start" }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Icon size={20} color={color}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.35rem" }}>
                      <h4 style={{ fontSize:"0.9rem", lineHeight:1.4, flex:1 }}>{r.title}</h4>
                      <StatusBadge status={r.access}/>
                    </div>
                    {r.description && <p style={{ color:"var(--text2)", fontSize:"0.82rem", lineHeight:1.6, marginBottom:"0.75rem" }}>{r.description}</p>}
                    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", flexWrap:"wrap" }}>
                      <span style={{ background:"var(--accent-bg)", color:"var(--accent2)", border:"1px solid var(--accent-border)", padding:"0.18rem 0.55rem", borderRadius:100, fontSize:"0.68rem", fontWeight:600 }}>{CAT_LABELS[r.category]||r.category}</span>
                      <span style={{ color:"var(--text3)", fontSize:"0.72rem" }}>{r.type.toUpperCase()}{r.fileSize ? ` · ${r.fileSize}` : ""}</span>
                      {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ marginLeft:"auto", background:"var(--accent-bg)", color:"var(--accent2)", border:"1px solid var(--accent-border)", fontSize:"0.75rem" }}><Download size={12}/>{r.type==="link"?"Open":"Download"}</a>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
