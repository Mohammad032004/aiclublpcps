"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, RefreshCw, Search, X } from "lucide-react";
import { membersApi, Member } from "@/lib/api";
import { Modal, StatusBadge, FormField, Spinner, EmptyState, showToast, useConfirm, Avatar } from "@/components/ui";

type MForm = { name:string; email:string; phone:string; branch:string; year:string; role:string; status:string; github:string; linkedin:string; bio:string; showOnAbout:boolean; };
const MINIT: MForm = { name:"", email:"", phone:"", branch:"", year:"", role:"member", status:"active", github:"", linkedin:"", bio:"", showOnAbout:true };

function MemberModal({ member, onClose, onSave }: { member?:Member|null; onClose:()=>void; onSave:(d:Partial<Member>,id?:string)=>Promise<void> }) {
  const [form, setForm] = useState<MForm>(member ? { name:member.name, email:member.email, phone:member.phone||"", branch:member.branch||"", year:member.year||"", role:member.role, status:member.status, github:member.github||"", linkedin:member.linkedin||"", bio:member.bio||"", showOnAbout:(member as {showOnAbout?:boolean}).showOnAbout??true } : MINIT);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<MForm>>({});

  const validate = () => {
    const e: Partial<MForm> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = "Valid email required";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try { await onSave(form as Partial<Member>, member?._id); onClose(); }
    catch {} finally { setSaving(false); }
  };

  return (
    <>
      <div className="grid-2">
        <FormField label="Full Name *" error={errors.name}>
          <input className={`input ${errors.name?"error":""}`} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Rahul Sharma"/>
        </FormField>
        <FormField label="Email *" error={errors.email}>
          <input type="email" className={`input ${errors.email?"error":""}`} value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="rahul@college.edu.in"/>
        </FormField>
        <FormField label="Phone">
          <input className="input" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="+91 98765 43210"/>
        </FormField>
        <FormField label="Branch">
          <input className="input" value={form.branch} onChange={e=>setForm(p=>({...p,branch:e.target.value}))} placeholder="B.Tech CSE (AI/ML)"/>
        </FormField>
        <FormField label="Year">
          <select className="input" value={form.year} onChange={e=>setForm(p=>({...p,year:e.target.value}))}>
            <option value="">Select</option>
            <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
          </select>
        </FormField>
        <FormField label="Role">
          <select className="input" value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}>
            <option value="member">Member</option><option value="core">Core</option><option value="admin">Admin</option>
          </select>
        </FormField>
        <FormField label="Status">
          <select className="input" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
            <option value="active">Active</option><option value="inactive">Inactive</option><option value="alumni">Alumni</option>
          </select>
        </FormField>
        <FormField label="GitHub">
          <input className="input" value={form.github} onChange={e=>setForm(p=>({...p,github:e.target.value}))} placeholder="github.com/username"/>
        </FormField>
      </div>
      <FormField label="LinkedIn">
        <input className="input" value={form.linkedin} onChange={e=>setForm(p=>({...p,linkedin:e.target.value}))} placeholder="linkedin.com/in/username"/>
      </FormField>
      <FormField label="Bio">
        <textarea className="input" value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))} rows={3} placeholder="Short bio…"/>
      </FormField>
      <div style={{ display:"flex", alignItems:"center", gap:"0.65rem", marginBottom:"1.25rem" }}>
        <input type="checkbox" id="showAbout" checked={form.showOnAbout} onChange={e=>setForm(p=>({...p,showOnAbout:e.target.checked}))} style={{ width:16,height:16,accentColor:"var(--accent)",cursor:"pointer" }}/>
        <label htmlFor="showAbout" style={{ cursor:"pointer", fontSize:"0.875rem", color:"var(--text2)" }}>Show on About page</label>
      </div>
      <div style={{ display:"flex", gap:"0.75rem" }}>
        <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" style={{ flex:2 }} onClick={save} disabled={saving}>
          {saving ? <><Spinner size="sm"/>{member?"Saving…":"Adding…"}</> : (member?"Save Changes":"Add Member")}
        </button>
      </div>
    </>
  );
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Member|null|undefined>(undefined);
  const [search, setSearch] = useState("");
  const { confirm, Dialog } = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try { const { members } = await membersApi.list(); setMembers(members); }
    catch (e: unknown) { showToast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Partial<Member>, id?: string) => {
    if (id) {
      const { member } = await membersApi.update(id, data);
      setMembers(prev => prev.map(m => m._id===id ? member : m));
      showToast.success("Member updated — changes visible on About page");
    } else {
      const { member } = await membersApi.create(data);
      setMembers(prev => [member, ...prev]);
      showToast.success("Member added — now visible on About page");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm(`Remove "${name}" from members?`);
    if (!ok) return;
    try { await membersApi.delete(id); setMembers(prev=>prev.filter(m=>m._id!==id)); showToast.success("Member removed"); }
    catch (e: unknown) { showToast.error(e instanceof Error ? e.message : "Delete failed"); }
  };

  const filtered = members.filter(m => `${m.name} ${m.email} ${m.branch||""} ${m.role}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.75rem", flexWrap:"wrap", gap:"1rem" }}>
        <div><h1 style={{ fontSize:"1.65rem", marginBottom:"0.2rem" }}>Members</h1><p style={{ color:"var(--text2)", fontSize:"0.875rem" }}>{members.length} members — visible on About page</p></div>
        <div style={{ display:"flex", gap:"0.65rem" }}>
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14} style={{ animation:loading?"spin 1s linear infinite":"none" }}/></button>
          <button className="btn btn-primary btn-sm" onClick={()=>setModal(null)}><Plus size={14}/> Add Member</button>
        </div>
      </div>

      <div style={{ position:"relative", maxWidth:340, marginBottom:"1.25rem" }}>
        <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--text3)" }}/>
        <input className="input" style={{ paddingLeft:36 }} placeholder="Search members…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        {loading ? <div style={{ padding:"3rem", display:"flex", justifyContent:"center" }}><Spinner size="lg"/></div>
        : filtered.length===0 ? <EmptyState icon="👥" title={members.length===0?"No members yet":"No matches"} description={members.length===0?"Add members to show them on the About page.":"Try a different search."}/>
        : (
          <table className="table">
            <thead><tr><th>Member</th><th>Branch · Year</th><th>Role</th><th>Status</th><th>Joined</th><th>About</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((m,i) => (
                <tr key={m._id}>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                      <Avatar name={m.name} size="sm" index={i}/>
                      <div>
                        <div style={{ fontWeight:600, fontSize:"0.875rem" }}>{m.name}</div>
                        <div style={{ fontSize:"0.72rem", color:"var(--text3)" }}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize:"0.82rem", color:"var(--text2)" }}>{m.branch||"—"}{m.year ? ` · ${m.year}` : ""}</td>
                  <td><span className="badge badge-blue" style={{ textTransform:"capitalize" }}>{m.role}</span></td>
                  <td><StatusBadge status={m.status}/></td>
                  <td style={{ fontSize:"0.78rem", color:"var(--text3)" }}>{new Date(m.joinedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td>
                  <td><span className={`badge ${(m as {showOnAbout?:boolean}).showOnAbout?"badge-green":"badge-gray"}`}>{(m as {showOnAbout?:boolean}).showOnAbout?"Yes":"No"}</span></td>
                  <td>
                    <div style={{ display:"flex", gap:4 }}>
                      <button onClick={()=>setModal(m)} className="btn btn-ghost btn-icon btn-sm" title="Edit"><Edit size={13}/></button>
                      <button onClick={()=>handleDelete(m._id,m.name)} className="btn btn-danger btn-icon btn-sm" title="Remove"><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modal!==undefined} onClose={()=>setModal(undefined)} title={modal?._id?"Edit Member":"Add Member"} size="lg">
        <MemberModal member={modal} onClose={()=>setModal(undefined)} onSave={handleSave}/>
      </Modal>
      <Dialog/>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
