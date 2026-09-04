"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import { resourcesApi, Resource } from "@/lib/api";
import { Modal, StatusBadge, FormField, Spinner, EmptyState, showToast, useConfirm } from "@/components/ui";

type RForm = { title:string; description:string; category:string; type:string; url:string; fileSize:string; access:string; };
const RINIT: RForm = { title:"", description:"", category:"ai_ml", type:"pdf", url:"", fileSize:"", access:"members" };
const CATS = ["ai_ml","web_dev","cybersecurity","research","career"];
const CAT_LABELS: Record<string,string> = { ai_ml:"AI/ML", web_dev:"Web Dev", cybersecurity:"Cybersecurity", research:"Research", career:"Career" };

function ResourceModal({ resource, onClose, onSave }: { resource?:Resource|null; onClose:()=>void; onSave:(d:Partial<Resource>,id?:string)=>Promise<void> }) {
  const [form, setForm] = useState<RForm>(resource ? { title:resource.title, description:resource.description||"", category:resource.category, type:resource.type, url:resource.url||"", fileSize:resource.fileSize||"", access:resource.access } : RINIT);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!form.title) { showToast.error("Title required"); return; }
    setSaving(true);
    try { await onSave(form as Partial<Resource>, resource?._id); onClose(); }
    catch {} finally { setSaving(false); }
  };
  return (
    <>
      <FormField label="Title *"><input className="input" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Resource title"/></FormField>
      <div className="grid-2">
        <FormField label="Category">
          <select className="input" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
            {CATS.map(c=><option key={c} value={c}>{CAT_LABELS[c]}</option>)}
          </select>
        </FormField>
        <FormField label="Type">
          <select className="input" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
            {["pdf","video","guide","notebook","link"].map(t=><option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </FormField>
        <FormField label="Access">
          <select className="input" value={form.access} onChange={e=>setForm(p=>({...p,access:e.target.value}))}>
            <option value="public">Public (anyone)</option><option value="members">Members only</option>
          </select>
        </FormField>
        <FormField label="File Size"><input className="input" value={form.fileSize} onChange={e=>setForm(p=>({...p,fileSize:e.target.value}))} placeholder="e.g. 2.5 MB"/></FormField>
      </div>
      <FormField label="URL / Link"><input className="input" value={form.url} onChange={e=>setForm(p=>({...p,url:e.target.value}))} placeholder="https://…"/></FormField>
      <FormField label="Description">
        <textarea className="input" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} placeholder="What this resource covers…"/>
      </FormField>
      <div style={{ display:"flex", gap:"0.75rem" }}>
        <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" style={{ flex:2 }} onClick={save} disabled={saving}>
          {saving ? <><Spinner size="sm"/>{resource?"Saving…":"Adding…"}</> : (resource?"Save Changes":"Add Resource")}
        </button>
      </div>
    </>
  );
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Resource|null|undefined>(undefined);
  const { confirm, Dialog } = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try { const { resources } = await resourcesApi.list(); setResources(resources); }
    catch (e: unknown) { showToast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Partial<Resource>, id?: string) => {
    if (id) {
      const { resource } = await resourcesApi.update(id, data);
      setResources(prev => prev.map(r => r._id===id ? resource : r));
      showToast.success("Resource updated");
    } else {
      await resourcesApi.create(data);
      showToast.success("Resource added");
      await load();
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm(`Delete "${title}"?`);
    if (!ok) return;
    try { await resourcesApi.delete(id); setResources(prev=>prev.filter(r=>r._id!==id)); showToast.success("Deleted"); }
    catch (e: unknown) { showToast.error(e instanceof Error ? e.message : "Failed"); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.75rem", flexWrap:"wrap", gap:"1rem" }}>
        <div><h1 style={{ fontSize:"1.65rem", marginBottom:"0.2rem" }}>Resources</h1><p style={{ color:"var(--text2)", fontSize:"0.875rem" }}>{resources.length} resources</p></div>
        <div style={{ display:"flex", gap:"0.65rem" }}>
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14} style={{ animation:loading?"spin 1s linear infinite":"none" }}/></button>
          <button className="btn btn-primary btn-sm" onClick={()=>setModal(null)}><Plus size={14}/> Add Resource</button>
        </div>
      </div>
      <div className="card" style={{ overflow:"hidden" }}>
        {loading ? <div style={{ padding:"3rem", display:"flex", justifyContent:"center" }}><Spinner size="lg"/></div>
        : resources.length===0 ? <EmptyState icon="📚" title="No resources yet"/>
        : (
          <table className="table">
            <thead><tr><th>Resource</th><th>Category</th><th>Type</th><th>Access</th><th>Downloads</th><th>Actions</th></tr></thead>
            <tbody>
              {resources.map(r => (
                <tr key={r._id}>
                  <td><div style={{ fontWeight:600 }}>{r.title}</div></td>
                  <td><span className="badge badge-blue">{CAT_LABELS[r.category]||r.category}</span></td>
                  <td style={{ fontSize:"0.82rem", color:"var(--text2)", textTransform:"uppercase" }}>{r.type}</td>
                  <td><StatusBadge status={r.access}/></td>
                  <td style={{ fontSize:"0.82rem", color:"var(--text2)" }}>{r.downloads}</td>
                  <td>
                    <div style={{ display:"flex", gap:4 }}>
                      <button onClick={()=>setModal(r)} className="btn btn-ghost btn-icon btn-sm"><Edit size={13}/></button>
                      <button onClick={()=>handleDelete(r._id,r.title)} className="btn btn-danger btn-icon btn-sm"><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal open={modal!==undefined} onClose={()=>setModal(undefined)} title={modal?._id?"Edit Resource":"Add Resource"}>
        <ResourceModal resource={modal} onClose={()=>setModal(undefined)} onSave={handleSave}/>
      </Modal>
      <Dialog/>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
