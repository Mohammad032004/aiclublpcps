"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, RefreshCw, Eye, EyeOff } from "lucide-react";
import { projectsApi, Project } from "@/lib/api";
import { Modal, FormField, Spinner, EmptyState, showToast, useConfirm } from "@/components/ui";

type PForm = { title:string; description:string; category:string; tags:string; github:string; liveDemo:string; builtBy:string; year:string; featured:boolean; visible:boolean; award:string; };
const PINIT: PForm = { title:"", description:"", category:"Machine Learning", tags:"", github:"", liveDemo:"", builtBy:"", year:new Date().getFullYear().toString(), featured:false, visible:true, award:"" };
const CATS = ["Machine Learning","Deep Learning","NLP","Computer Vision","Cybersecurity","Web Development","Data Science","Reinforcement Learning","MLOps"];

function ProjectModal({ project, onClose, onSave }: { project?:Project|null; onClose:()=>void; onSave:(d:Partial<Project>,id?:string)=>Promise<void> }) {
  const [form, setForm] = useState<PForm>(project ? { title:project.title, description:project.description, category:project.category, tags:project.tags?.join(", ")||"", github:project.github||"", liveDemo:project.liveDemo||"", builtBy:project.builtBy?.join(", ")||"", year:project.year?.toString()||"", featured:project.featured, visible:project.visible, award:project.award||"" } : PINIT);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.title || !form.description) { showToast.error("Title and description required"); return; }
    setSaving(true);
    try {
      await onSave({ ...form, tags:form.tags?form.tags.split(",").map(t=>t.trim()).filter(Boolean):[], builtBy:form.builtBy?form.builtBy.split(",").map(t=>t.trim()).filter(Boolean):[], year:parseInt(form.year)||new Date().getFullYear() }, project?._id);
      onClose();
    } catch {} finally { setSaving(false); }
  };

  return (
    <>
      <FormField label="Title *"><input className="input" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Project title"/></FormField>
      <div className="grid-2">
        <FormField label="Category">
          <select className="input" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
            {CATS.map(c=><option key={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="Year"><input type="number" className="input" value={form.year} onChange={e=>setForm(p=>({...p,year:e.target.value}))}/></FormField>
        <FormField label="GitHub URL"><input className="input" value={form.github} onChange={e=>setForm(p=>({...p,github:e.target.value}))} placeholder="https://github.com/…"/></FormField>
        <FormField label="Live Demo URL"><input className="input" value={form.liveDemo} onChange={e=>setForm(p=>({...p,liveDemo:e.target.value}))} placeholder="https://…"/></FormField>
      </div>
      <FormField label="Built By (comma-separated)"><input className="input" value={form.builtBy} onChange={e=>setForm(p=>({...p,builtBy:e.target.value}))} placeholder="Aryan Kumar, Priya Sharma"/></FormField>
      <FormField label="Tags (comma-separated)"><input className="input" value={form.tags} onChange={e=>setForm(p=>({...p,tags:e.target.value}))} placeholder="PyTorch, FastAPI, React"/></FormField>
      <FormField label="Award (optional)"><input className="input" value={form.award} onChange={e=>setForm(p=>({...p,award:e.target.value}))} placeholder="🏆 Best Project 2024"/></FormField>
      <FormField label="Description *">
        <textarea className="input" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} placeholder="Project description…"/>
      </FormField>
      <div style={{ display:"flex", gap:"1.5rem", marginBottom:"1.25rem" }}>
        {[{k:"visible" as keyof PForm,l:"Visible on website"},{k:"featured" as keyof PForm,l:"Featured project"}].map(opt=>(
          <label key={opt.k} style={{ display:"flex", alignItems:"center", gap:"0.5rem", cursor:"pointer", fontSize:"0.875rem", color:"var(--text2)" }}>
            <input type="checkbox" checked={form[opt.k] as boolean} onChange={e=>setForm(p=>({...p,[opt.k]:e.target.checked}))} style={{ width:16,height:16,accentColor:"var(--accent)",cursor:"pointer" }}/>{opt.l}
          </label>
        ))}
      </div>
      <div style={{ display:"flex", gap:"0.75rem" }}>
        <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" style={{ flex:2 }} onClick={save} disabled={saving}>
          {saving ? <><Spinner size="sm"/>{project?"Saving…":"Adding…"}</> : (project?"Save Changes":"Add Project")}
        </button>
      </div>
    </>
  );
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Project|null|undefined>(undefined);
  const { confirm, Dialog } = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try { const { projects } = await projectsApi.list(); setProjects(projects); }
    catch (e: unknown) { showToast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Partial<Project>, id?: string) => {
    if (id) {
      const { project } = await projectsApi.update(id, data);
      setProjects(prev => prev.map(p => p._id===id ? project : p));
      showToast.success("Project updated");
    } else {
      await projectsApi.create(data);
      showToast.success("Project added — now visible on website");
      await load();
    }
  };

  const toggleVisible = async (p: Project) => {
    try {
      const { project } = await projectsApi.update(p._id, { visible:!p.visible });
      setProjects(prev => prev.map(x => x._id===p._id ? project : x));
      showToast.info(project.visible ? "Now visible on website" : "Hidden from website");
    } catch (e: unknown) { showToast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm(`Delete "${title}"?`);
    if (!ok) return;
    try { await projectsApi.delete(id); setProjects(prev=>prev.filter(p=>p._id!==id)); showToast.success("Deleted"); }
    catch (e: unknown) { showToast.error(e instanceof Error ? e.message : "Failed"); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.75rem", flexWrap:"wrap", gap:"1rem" }}>
        <div><h1 style={{ fontSize:"1.65rem", marginBottom:"0.2rem" }}>Projects</h1><p style={{ color:"var(--text2)", fontSize:"0.875rem" }}>{projects.filter(p=>p.visible).length} visible · {projects.length} total</p></div>
        <div style={{ display:"flex", gap:"0.65rem" }}>
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14} style={{ animation:loading?"spin 1s linear infinite":"none" }}/></button>
          <button className="btn btn-primary btn-sm" onClick={()=>setModal(null)}><Plus size={14}/> Add Project</button>
        </div>
      </div>
      <div className="card" style={{ overflow:"hidden" }}>
        {loading ? <div style={{ padding:"3rem", display:"flex", justifyContent:"center" }}><Spinner size="lg"/></div>
        : projects.length===0 ? <EmptyState icon="🧪" title="No projects yet" description="Add projects — they'll appear on the website."/>
        : (
          <table className="table">
            <thead><tr><th>Project</th><th>Category</th><th>Year</th><th>Visible</th><th>Featured</th><th>Actions</th></tr></thead>
            <tbody>
              {projects.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ fontWeight:600 }}>{p.title}</div>
                    <div style={{ fontSize:"0.75rem", color:"var(--text3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:220 }}>{p.description}</div>
                  </td>
                  <td><span className="badge badge-blue">{p.category}</span></td>
                  <td style={{ color:"var(--text2)", fontSize:"0.82rem" }}>{p.year||"—"}</td>
                  <td>
                    <button onClick={()=>toggleVisible(p)} className="btn btn-sm" style={{ background:p.visible?"var(--green-bg)":"var(--bg2)", color:p.visible?"var(--green)":"var(--text3)", border:`1px solid ${p.visible?"rgba(16,185,129,0.3)":"var(--border)"}` }}>
                      {p.visible ? <><Eye size={11}/> Yes</> : <><EyeOff size={11}/> No</>}
                    </button>
                  </td>
                  <td><span className={`badge ${p.featured?"badge-orange":"badge-gray"}`}>{p.featured?"⭐ Yes":"No"}</span></td>
                  <td>
                    <div style={{ display:"flex", gap:4 }}>
                      <button onClick={()=>setModal(p)} className="btn btn-ghost btn-icon btn-sm"><Edit size={13}/></button>
                      <button onClick={()=>handleDelete(p._id,p.title)} className="btn btn-danger btn-icon btn-sm"><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal open={modal!==undefined} onClose={()=>setModal(undefined)} title={modal?._id?"Edit Project":"Add Project"} size="lg">
        <ProjectModal project={modal} onClose={()=>setModal(undefined)} onSave={handleSave}/>
      </Modal>
      <Dialog/>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
