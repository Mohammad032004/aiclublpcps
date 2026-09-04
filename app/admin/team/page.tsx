"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Modal, FormField, Spinner, EmptyState, showToast, useConfirm, Avatar } from "@/components/ui";

interface TeamMember { _id:string; name:string; role:string; tier:string; department?:string; course?:string; bio?:string; email?:string; github?:string; visible:boolean; order:number; }
type TForm = { name:string; role:string; tier:string; department:string; course:string; bio:string; email:string; github:string; visible:boolean; order:string; };
const TINIT: TForm = { name:"", role:"", tier:"core", department:"", course:"", bio:"", email:"", github:"", visible:true, order:"0" };
const TIERS = ["faculty","leadership","core","member"];
const TIER_COLORS: Record<string,string> = { faculty:"var(--orange)", leadership:"var(--accent)", core:"var(--green)", member:"var(--purple)" };

function TeamModal({ member, onClose, onSave }: { member?:TeamMember|null; onClose:()=>void; onSave:(d:Partial<TeamMember>,id?:string)=>Promise<void> }) {
  const [form, setForm] = useState<TForm>(member ? { name:member.name, role:member.role, tier:member.tier, department:member.department||"", course:member.course||"", bio:member.bio||"", email:member.email||"", github:member.github||"", visible:member.visible, order:member.order.toString() } : TINIT);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!form.name || !form.role) { showToast.error("Name and role required"); return; }
    setSaving(true);
    try { await onSave({ ...form, order:parseInt(form.order)||0 }, member?._id); onClose(); }
    catch {} finally { setSaving(false); }
  };
  return (
    <>
      <div className="grid-2">
        <FormField label="Full Name *"><input className="input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Dr. Rahul Verma"/></FormField>
        <FormField label="Role *"><input className="input" value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))} placeholder="Faculty Head"/></FormField>
        <FormField label="Tier">
          <select className="input" value={form.tier} onChange={e=>setForm(p=>({...p,tier:e.target.value}))}>
            {TIERS.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>
        </FormField>
        <FormField label="Display Order"><input type="number" className="input" value={form.order} onChange={e=>setForm(p=>({...p,order:e.target.value}))}/></FormField>
        <FormField label="Department"><input className="input" value={form.department} onChange={e=>setForm(p=>({...p,department:e.target.value}))} placeholder="Computer Science"/></FormField>
        <FormField label="Course / Year"><input className="input" value={form.course} onChange={e=>setForm(p=>({...p,course:e.target.value}))} placeholder="B.Tech CSE · 3rd Year"/></FormField>
        <FormField label="Email"><input type="email" className="input" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></FormField>
        <FormField label="GitHub"><input className="input" value={form.github} onChange={e=>setForm(p=>({...p,github:e.target.value}))}/></FormField>
      </div>
      <FormField label="Bio"><textarea className="input" value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))} rows={3} placeholder="Short biography…"/></FormField>
      <div style={{ display:"flex", alignItems:"center", gap:"0.65rem", marginBottom:"1.25rem" }}>
        <input type="checkbox" id="tv" checked={form.visible} onChange={e=>setForm(p=>({...p,visible:e.target.checked}))} style={{ width:16,height:16,accentColor:"var(--accent)",cursor:"pointer" }}/>
        <label htmlFor="tv" style={{ cursor:"pointer", fontSize:"0.875rem", color:"var(--text2)" }}>Visible on About page</label>
      </div>
      <div style={{ display:"flex", gap:"0.75rem" }}>
        <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" style={{ flex:2 }} onClick={save} disabled={saving}>
          {saving?<><Spinner size="sm"/>{member?"Saving…":"Adding…"}</>:(member?"Save Changes":"Add Member")}
        </button>
      </div>
    </>
  );
}

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<TeamMember|null|undefined>(undefined);
  const { confirm, Dialog } = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch("/api/team?admin=true"); const d = await r.json(); setTeam(d.team||[]); }
    catch { showToast.error("Failed to load"); }
    finally { setLoading(false); }
  }, []);
  useEffect(()=>{ load(); },[load]);

  const handleSave = async (data: Partial<TeamMember>, id?: string) => {
    const url = id ? `/api/team/${id}` : "/api/team";
    const method = id ? "PATCH" : "POST";
    const r = await fetch(url,{ method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(data) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    if (id) { setTeam(prev=>prev.map(m=>m._id===id?d.member:m)); showToast.success("Updated — visible on About page"); }
    else { showToast.success("Added — now visible on About page"); await load(); }
  };

  const toggleVisible = async (m: TeamMember) => {
    const r = await fetch(`/api/team/${m._id}`,{ method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({visible:!m.visible}) });
    const d = await r.json();
    setTeam(prev=>prev.map(t=>t._id===m._id?d.member:t));
    showToast.info(d.member.visible?"Visible on About page":"Hidden from About page");
  };

  const del = async (id: string, name: string) => {
    const ok = await confirm(`Remove "${name}" from the team?`);
    if (!ok) return;
    await fetch(`/api/team/${id}`,{method:"DELETE"});
    setTeam(prev=>prev.filter(m=>m._id!==id));
    showToast.success("Removed");
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.75rem", flexWrap:"wrap", gap:"1rem" }}>
        <div><h1 style={{ fontSize:"1.65rem", marginBottom:"0.2rem" }}>Team</h1><p style={{ color:"var(--text2)", fontSize:"0.875rem" }}>{team.length} members · {team.filter(m=>m.visible).length} visible on About</p></div>
        <div style={{ display:"flex", gap:"0.65rem" }}>
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14} style={{ animation:loading?"spin 1s linear infinite":"none" }}/></button>
          <button className="btn btn-primary btn-sm" onClick={()=>setModal(null)}><Plus size={14}/> Add Member</button>
        </div>
      </div>
      <div className="card" style={{ overflow:"hidden" }}>
        {loading?<div style={{ padding:"3rem",display:"flex",justifyContent:"center" }}><Spinner size="lg"/></div>
        :team.length===0?<EmptyState icon="👥" title="No team members yet" description="Add members — they appear in the About page club hierarchy."/>
        :(
          <table className="table">
            <thead><tr><th>Member</th><th>Tier</th><th>Dept · Course</th><th>Order</th><th>Visible</th><th>Actions</th></tr></thead>
            <tbody>
              {team.map((m,i)=>(
                <tr key={m._id}>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                      <Avatar name={m.name} size="sm" index={i}/>
                      <div>
                        <div style={{ fontWeight:600, fontSize:"0.875rem" }}>{m.name}</div>
                        <div style={{ fontSize:"0.72rem", color:"var(--accent2)", fontWeight:600 }}>{m.role}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge" style={{ background:`${TIER_COLORS[m.tier]||"var(--accent)"}15`, color:TIER_COLORS[m.tier]||"var(--accent)", border:`1px solid ${TIER_COLORS[m.tier]||"var(--accent)"}30`, textTransform:"capitalize" }}>{m.tier}</span></td>
                  <td style={{ fontSize:"0.82rem", color:"var(--text2)" }}>{m.department||"—"}{m.course?` · ${m.course}`:""}</td>
                  <td style={{ fontSize:"0.82rem", color:"var(--text3)" }}>{m.order}</td>
                  <td>
                    <button onClick={()=>toggleVisible(m)} className="btn btn-sm" style={{ background:m.visible?"var(--green-bg)":"var(--bg2)", color:m.visible?"var(--green)":"var(--text3)", border:`1px solid ${m.visible?"rgba(16,185,129,0.3)":"var(--border)"}` }}>
                      {m.visible?<><Eye size={11}/> Yes</>:<><EyeOff size={11}/> No</>}
                    </button>
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:4 }}>
                      <button onClick={()=>setModal(m)} className="btn btn-ghost btn-icon btn-sm"><Edit size={13}/></button>
                      <button onClick={()=>del(m._id,m.name)} className="btn btn-danger btn-icon btn-sm"><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal open={modal!==undefined} onClose={()=>setModal(undefined)} title={modal?._id?"Edit Team Member":"Add Team Member"} size="lg">
        <TeamModal member={modal} onClose={()=>setModal(undefined)} onSave={handleSave}/>
      </Modal>
      <Dialog/>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
