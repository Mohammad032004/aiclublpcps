"use client";
import { useState, useEffect, useCallback } from "react";
import { Check, X, Trash2, Eye, RefreshCw, Search } from "lucide-react";
import { applicationsApi, Application } from "@/lib/api";
import { StatusBadge, Spinner, EmptyState, showToast, useConfirm, Avatar } from "@/components/ui";

function DetailRow({ label, value }: { label: string; value?: string | number | string[] | null }) {
  if (value === undefined || value === null || value === "") return null;
  const display = Array.isArray(value) ? value.join(", ") : String(value);
  return (
    <div style={{ marginBottom:"0.75rem" }}>
      <div style={{ fontSize:"0.68rem", fontWeight:700, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"0.2rem" }}>{label}</div>
      <div style={{ fontSize:"0.875rem", color:"var(--text1)", background:"var(--bg2)", padding:"0.45rem 0.75rem", borderRadius:"var(--radius-sm)", border:"1px solid var(--border2)", lineHeight:1.55 }}>{display}</div>
    </div>
  );
}

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Application|null>(null);
  const [busy, setBusy] = useState<string|null>(null);
  const { confirm, Dialog } = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try { const { applications } = await applicationsApi.list(filter==="all"?undefined:filter); setApps(applications); }
    catch (e: unknown) { showToast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  const action = async (id: string, status: "accepted"|"rejected") => {
    setBusy(id+status);
    try {
      const { application } = await applicationsApi.updateStatus(id, status);
      setApps(prev => prev.map(a => a._id===id ? application : a));
      if (selected?._id===id) setSelected(application);
      showToast.success(`Application ${status}`);
    } catch (e: unknown) { showToast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(null); }
  };

  const del = async (id: string) => {
    const ok = await confirm("Delete this application permanently?");
    if (!ok) return;
    try { await applicationsApi.delete(id); setApps(prev=>prev.filter(a=>a._id!==id)); if(selected?._id===id) setSelected(null); showToast.success("Deleted"); }
    catch (e: unknown) { showToast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const filtered = apps.filter(a => `${a.firstName} ${a.lastName} ${a.email} ${a.branch||""} ${a.year||""}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.75rem", flexWrap:"wrap", gap:"1rem" }}>
        <div><h1 style={{ fontSize:"1.65rem", marginBottom:"0.2rem" }}>Applications</h1><p style={{ color:"var(--text2)", fontSize:"0.875rem" }}>{apps.filter(a=>a.status==="pending").length} pending · {apps.length} total</p></div>
        <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
          {["all","pending","accepted","rejected"].map(f => <button key={f} onClick={()=>setFilter(f)} className={`btn btn-sm ${filter===f?"btn-primary":"btn-ghost"}`} style={{ textTransform:"capitalize" }}>{f==="all"?"All":f}</button>)}
          <button className="btn btn-ghost btn-sm btn-icon" onClick={load}><RefreshCw size={13} style={{ animation:loading?"spin 1s linear infinite":"none" }}/></button>
        </div>
      </div>

      <div style={{ position:"relative", maxWidth:340, marginBottom:"1.25rem" }}>
        <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--text3)" }}/>
        <input className="input" style={{ paddingLeft:36 }} placeholder="Search name, email, branch…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:selected?"1.3fr 1fr":"1fr", gap:"1.5rem", alignItems:"start" }}>
        <div className="card" style={{ overflow:"hidden" }}>
          {loading ? <div style={{ padding:"3rem", display:"flex", justifyContent:"center" }}><Spinner size="lg"/></div>
          : filtered.length===0 ? <EmptyState icon="📋" title="No applications found"/>
          : (
            <table className="table">
              <thead><tr><th>Applicant</th><th>Branch · Year</th><th>Skills</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((a,i) => (
                  <tr key={a._id} onClick={()=>setSelected(selected?._id===a._id?null:a)} style={{ cursor:"pointer", background:selected?._id===a._id?"var(--accent-bg)":"transparent" }}>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:"0.65rem" }}>
                        <Avatar name={`${a.firstName} ${a.lastName}`} size="sm" index={i}/>
                        <div>
                          <div style={{ fontWeight:600, fontSize:"0.875rem" }}>{a.firstName} {a.lastName}</div>
                          <div style={{ fontSize:"0.72rem", color:"var(--text3)" }}>{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:"0.82rem", color:"var(--text2)" }}>{a.branch||"—"}{a.year?` · ${a.year}`:""}</td>
                    <td>
                      <div style={{ display:"flex", gap:"0.3rem", flexWrap:"wrap" }}>
                        {a.skills?.slice(0,3).map(s=><span key={s} style={{ background:"var(--accent-bg)", color:"var(--accent2)", border:"1px solid var(--accent-border)", fontSize:"0.65rem", padding:"0.1rem 0.4rem", borderRadius:100 }}>{s}</span>)}
                        {(a.skills?.length||0)>3 && <span style={{ fontSize:"0.72rem", color:"var(--text3)" }}>+{(a.skills?.length||0)-3}</span>}
                      </div>
                    </td>
                    <td><StatusBadge status={a.status}/></td>
                    <td style={{ fontSize:"0.78rem", color:"var(--text3)" }}>{new Date(a.submittedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</td>
                    <td>
                      <div style={{ display:"flex", gap:3 }} onClick={e=>e.stopPropagation()}>
                        {a.status==="pending" && <>
                          <button onClick={()=>action(a._id,"accepted")} disabled={!!busy} className="btn btn-sm" style={{ padding:"0.25rem 0.5rem", background:"var(--green-bg)", color:"var(--green)", border:"1px solid rgba(16,185,129,0.3)" }}><Check size={12}/></button>
                          <button onClick={()=>action(a._id,"rejected")} disabled={!!busy} className="btn btn-sm" style={{ padding:"0.25rem 0.5rem", background:"var(--red-bg)", color:"var(--red)", border:"1px solid rgba(239,68,68,0.3)" }}><X size={12}/></button>
                        </>}
                        <button onClick={()=>setSelected(selected?._id===a._id?null:a)} className="btn btn-ghost btn-icon btn-sm" title="Details"><Eye size={12}/></button>
                        <button onClick={()=>del(a._id)} className="btn btn-danger btn-icon btn-sm" title="Delete"><Trash2 size={12}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div className="card card-p-lg" style={{ position:"sticky", top:"1.5rem", maxHeight:"85vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
              <div><h3 style={{ fontSize:"1rem" }}>{selected.firstName} {selected.lastName}</h3><StatusBadge status={selected.status}/></div>
              <button onClick={()=>setSelected(null)} className="btn btn-ghost btn-icon btn-sm"><X size={16}/></button>
            </div>
            <div style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--accent2)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"0.75rem", paddingBottom:"0.5rem", borderBottom:"1px solid var(--border2)" }}>Personal</div>
            <DetailRow label="Email" value={selected.email}/><DetailRow label="Phone" value={(selected as {phone?:string}).phone}/><DetailRow label="GitHub" value={selected.github}/><DetailRow label="LinkedIn" value={selected.linkedin}/>
            <div style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--accent2)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"0.75rem", marginTop:"1rem", paddingBottom:"0.5rem", borderBottom:"1px solid var(--border2)" }}>Academics</div>
            <DetailRow label="College" value={(selected as {college?:string}).college}/><DetailRow label="Branch" value={selected.branch}/><DetailRow label="Year" value={selected.year}/><DetailRow label="CGPA" value={selected.cgpa}/>
            <div style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--accent2)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"0.75rem", marginTop:"1rem", paddingBottom:"0.5rem", borderBottom:"1px solid var(--border2)" }}>Skills</div>
            <DetailRow label="Technical Skills" value={selected.skills}/><DetailRow label="Domains" value={selected.domains}/>
            <div style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--accent2)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"0.75rem", marginTop:"1rem", paddingBottom:"0.5rem", borderBottom:"1px solid var(--border2)" }}>Statement</div>
            <DetailRow label="Why Join" value={selected.whyJoin}/><DetailRow label="Contribution" value={selected.contribution}/>
            {selected.status==="pending" && (
              <div style={{ display:"flex", gap:"0.65rem", marginTop:"1.5rem" }}>
                <button onClick={()=>action(selected._id,"accepted")} disabled={!!busy} className="btn btn-primary" style={{ flex:1, justifyContent:"center" }}>✓ Accept</button>
                <button onClick={()=>action(selected._id,"rejected")} disabled={!!busy} className="btn btn-danger" style={{ flex:1, justifyContent:"center" }}>✕ Reject</button>
              </div>
            )}
          </div>
        )}
      </div>
      <Dialog/>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
