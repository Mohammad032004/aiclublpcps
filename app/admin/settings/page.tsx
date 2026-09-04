"use client";
import { useState, useEffect } from "react";
import { Key, Mail, Users, Plus, Edit, Trash2, Eye, EyeOff, RefreshCw, Shield } from "lucide-react";
import { showToast, Modal, FormField, Spinner, Avatar } from "@/components/ui";

interface AdminUser { _id:string; name:string; email:string; role:string; createdAt:string; }
type Tab = "password"|"email"|"users";

function PwField({ label, value, onChange, placeholder }: { label:string; value:string; onChange:(v:string)=>void; placeholder?:string }) {
  const [show, setShow] = useState(false);
  return (
    <FormField label={label}>
      <div style={{ position:"relative" }}>
        <input type={show?"text":"password"} className="input" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||"••••••••"}/>
        <button type="button" onClick={()=>setShow(s=>!s)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"var(--text3)", cursor:"pointer", display:"flex" }}>
          {show?<EyeOff size={15}/>:<Eye size={15}/>}
        </button>
      </div>
    </FormField>
  );
}

function UserModal({ user, onClose, onSave }: { user?:AdminUser|null; onClose:()=>void; onSave:(d:Record<string,string>,id?:string)=>Promise<void> }) {
  const [form, setForm] = useState({ name:user?.name||"", email:user?.email||"", role:user?.role||"member", password:"" });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!form.name||!form.email) { showToast.error("Name and email required"); return; }
    if (!user&&!form.password) { showToast.error("Password required for new user"); return; }
    setSaving(true);
    try { await onSave(form, user?._id); onClose(); } catch {} finally { setSaving(false); }
  };
  const ROLES = [{v:"admin",l:"Admin — Full access"},{v:"core",l:"Core — Content management"},{v:"member",l:"Member — View only"}];
  return (
    <>
      <div className="grid-2">
        <FormField label="Full Name *"><input className="input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></FormField>
        <FormField label="Email *"><input type="email" className="input" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></FormField>
      </div>
      <FormField label="Role">
        <select className="input" value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}>
          {ROLES.map(r=><option key={r.v} value={r.v}>{r.l}</option>)}
        </select>
      </FormField>
      <PwField label={user?"New Password (leave blank to keep)":"Password *"} value={form.password} onChange={v=>setForm(p=>({...p,password:v}))}/>
      <div style={{ display:"flex", gap:"0.75rem", marginTop:"0.5rem" }}>
        <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" style={{ flex:2 }} onClick={save} disabled={saving}>
          {saving?<><Spinner size="sm"/>{user?"Saving…":"Creating…"}</>:(user?"Save Changes":"Create User")}
        </button>
      </div>
    </>
  );
}

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>("password");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [modal, setModal] = useState<AdminUser|null|undefined>(undefined);
  const [pw, setPw] = useState({ email:"", current:"", newPw:"", confirm:"" });
  const [em, setEm] = useState({ currentEmail:"", newEmail:"", password:"" });
  const [pwLoading, setPwLoading] = useState(false);
  const [emLoading, setEmLoading] = useState(false);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try { const r=await fetch("/api/users"); const d=await r.json(); setUsers(d.users||[]); }
    catch { showToast.error("Failed to load users"); }
    finally { setLoadingUsers(false); }
  };
  useEffect(() => { if (tab==="users") loadUsers(); }, [tab]);

  const handlePw = async () => {
    if (!pw.email||!pw.current||!pw.newPw) { showToast.error("All fields required"); return; }
    if (pw.newPw!==pw.confirm) { showToast.error("Passwords do not match"); return; }
    if (pw.newPw.length<8) { showToast.error("Min 8 characters"); return; }
    setPwLoading(true);
    try {
      const r=await fetch("/api/auth/change-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:pw.email,currentPassword:pw.current,newPassword:pw.newPw})});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error);
      showToast.success("Password changed successfully");
      setPw({email:"",current:"",newPw:"",confirm:""});
    } catch(e:unknown){ showToast.error(e instanceof Error?e.message:"Failed"); }
    finally { setPwLoading(false); }
  };

  const handleEm = async () => {
    if (!em.currentEmail||!em.newEmail||!em.password) { showToast.error("All fields required"); return; }
    setEmLoading(true);
    try {
      const r=await fetch("/api/auth/change-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(em)});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error);
      showToast.success("Email updated");
      setEm({currentEmail:"",newEmail:"",password:""});
    } catch(e:unknown){ showToast.error(e instanceof Error?e.message:"Failed"); }
    finally { setEmLoading(false); }
  };

  const handleUserSave = async (data: Record<string,string>, id?: string) => {
    const url=id?`/api/users/${id}`:"/api/users";
    const method=id?"PATCH":"POST";
    const body=id?{name:data.name,email:data.email,role:data.role,...(data.password?{newPassword:data.password}:{})}:{name:data.name,email:data.email,role:data.role,password:data.password};
    const r=await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const d=await r.json();
    if(!r.ok) throw new Error(d.error);
    showToast.success(id?"User updated":"User created");
    await loadUsers();
  };

  const delUser = async (id: string, name: string) => {
    if(!confirm(`Delete user "${name}"?`)) return;
    await fetch(`/api/users/${id}`,{method:"DELETE"});
    setUsers(prev=>prev.filter(u=>u._id!==id));
    showToast.success("User deleted");
  };

  const tabs: { id:Tab; label:string; icon:React.ComponentType<{size?:number}> }[] = [
    {id:"password",label:"Change Password",icon:Key},
    {id:"email",label:"Change Email",icon:Mail},
    {id:"users",label:"User Management",icon:Users},
  ];
  const ROLE_COLORS: Record<string,string> = {admin:"var(--red)",core:"var(--accent)",member:"var(--green)"};

  return (
    <div>
      <div style={{ marginBottom:"1.75rem" }}>
        <h1 style={{ fontSize:"1.65rem", marginBottom:"0.2rem" }}>Settings</h1>
        <p style={{ color:"var(--text2)", fontSize:"0.875rem" }}>Account security and access management</p>
      </div>

      <div style={{ display:"flex", gap:"0.5rem", marginBottom:"2rem", flexWrap:"wrap" }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} className={`btn ${tab===t.id?"btn-primary":"btn-ghost"} btn-sm`} style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
            <t.icon size={14}/>{t.label}
          </button>
        ))}
      </div>

      {tab==="password" && (
        <div className="card card-p-lg" style={{ maxWidth:480 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.5rem" }}>
            <div style={{ width:40,height:40,borderRadius:10,background:"var(--accent-bg)",display:"flex",alignItems:"center",justifyContent:"center" }}><Key size={18} color="var(--accent)"/></div>
            <div><h3 style={{ fontSize:"1rem" }}>Change Password</h3><p style={{ color:"var(--text2)", fontSize:"0.82rem" }}>Requires your current password</p></div>
          </div>
          <FormField label="Your Email"><input type="email" className="input" value={pw.email} onChange={e=>setPw(p=>({...p,email:e.target.value}))} placeholder="admin@aiclub.in"/></FormField>
          <PwField label="Current Password" value={pw.current} onChange={v=>setPw(p=>({...p,current:v}))}/>
          <PwField label="New Password (min 8 chars)" value={pw.newPw} onChange={v=>setPw(p=>({...p,newPw:v}))} placeholder="New password"/>
          <PwField label="Confirm New Password" value={pw.confirm} onChange={v=>setPw(p=>({...p,confirm:v}))}/>
          {pw.newPw&&pw.confirm&&pw.newPw!==pw.confirm&&<p style={{ fontSize:"0.78rem", color:"var(--red)", marginBottom:"0.75rem" }}>✗ Passwords do not match</p>}
          <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={handlePw} disabled={pwLoading}>
            {pwLoading?<><Spinner size="sm"/> Updating…</>:"Update Password"}
          </button>
        </div>
      )}

      {tab==="email" && (
        <div className="card card-p-lg" style={{ maxWidth:480 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.5rem" }}>
            <div style={{ width:40,height:40,borderRadius:10,background:"var(--green-bg)",display:"flex",alignItems:"center",justifyContent:"center" }}><Mail size={18} color="var(--green)"/></div>
            <div><h3 style={{ fontSize:"1rem" }}>Change Email</h3><p style={{ color:"var(--text2)", fontSize:"0.82rem" }}>Update your login email</p></div>
          </div>
          <FormField label="Current Email"><input type="email" className="input" value={em.currentEmail} onChange={e=>setEm(p=>({...p,currentEmail:e.target.value}))}/></FormField>
          <FormField label="New Email"><input type="email" className="input" value={em.newEmail} onChange={e=>setEm(p=>({...p,newEmail:e.target.value}))}/></FormField>
          <PwField label="Confirm with Password" value={em.password} onChange={v=>setEm(p=>({...p,password:v}))}/>
          <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={handleEm} disabled={emLoading}>
            {emLoading?<><Spinner size="sm"/> Updating…</>:"Update Email"}
          </button>
        </div>
      )}

      {tab==="users" && (
        <div>
          <div className="grid-3" style={{ marginBottom:"1.5rem" }}>
            {[{role:"admin",label:"Admin",desc:"Full access to all features",color:"var(--red)"},{role:"core",label:"Core Member",desc:"Manage content, limited settings",color:"var(--accent)"},{role:"member",label:"Member",desc:"View-only access",color:"var(--green)"}].map(r=>(
              <div key={r.role} className="card" style={{ padding:"1rem", borderLeft:`3px solid ${r.color}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.4rem", marginBottom:"0.35rem" }}>
                  <Shield size={14} color={r.color}/><span style={{ fontWeight:700, fontSize:"0.88rem", color:r.color }}>{r.label}</span>
                </div>
                <p style={{ fontSize:"0.78rem", color:"var(--text2)" }}>{r.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
            <h3 style={{ fontSize:"1rem" }}>Users ({users.length})</h3>
            <div style={{ display:"flex", gap:"0.5rem" }}>
              <button className="btn btn-ghost btn-sm" onClick={loadUsers}><RefreshCw size={13} style={{ animation:loadingUsers?"spin 1s linear infinite":"none" }}/></button>
              <button className="btn btn-primary btn-sm" onClick={()=>setModal(null)}><Plus size={13}/> Add User</button>
            </div>
          </div>
          <div className="card" style={{ overflow:"hidden" }}>
            {loadingUsers?<div style={{ padding:"3rem",display:"flex",justifyContent:"center" }}><Spinner/></div>
            :users.length===0?<div style={{ padding:"3rem",textAlign:"center",color:"var(--text2)" }}>No users. Create the first admin account.</div>
            :(
              <table className="table">
                <thead><tr><th>User</th><th>Role</th><th>Created</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map((u,i)=>(
                    <tr key={u._id}>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:"0.65rem" }}>
                          <Avatar name={u.name} size="sm" index={i}/>
                          <div><div style={{ fontWeight:600,fontSize:"0.875rem" }}>{u.name}</div><div style={{ fontSize:"0.72rem",color:"var(--text3)" }}>{u.email}</div></div>
                        </div>
                      </td>
                      <td><span className="badge" style={{ background:`${ROLE_COLORS[u.role]||"var(--text3)"}18`,color:ROLE_COLORS[u.role]||"var(--text3)",border:`1px solid ${ROLE_COLORS[u.role]||"var(--text3)"}30`,textTransform:"capitalize" }}>{u.role}</span></td>
                      <td style={{ fontSize:"0.78rem",color:"var(--text3)" }}>{new Date(u.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td>
                      <td>
                        <div style={{ display:"flex", gap:4 }}>
                          <button onClick={()=>setModal(u)} className="btn btn-ghost btn-icon btn-sm"><Edit size={13}/></button>
                          <button onClick={()=>delUser(u._id,u.name)} className="btn btn-danger btn-icon btn-sm"><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <Modal open={modal!==undefined} onClose={()=>setModal(undefined)} title={modal?._id?"Edit User":"Create User"}>
        <UserModal user={modal} onClose={()=>setModal(undefined)} onSave={handleUserSave}/>
      </Modal>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
