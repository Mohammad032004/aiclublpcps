"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, RefreshCw, X, Calendar, MapPin } from "lucide-react";
import { eventsApi, ClubEvent } from "@/lib/api";
import { Modal, StatusBadge, FormField, Spinner, EmptyState, showToast, useConfirm } from "@/components/ui";

type EForm = { title:string; type:string; description:string; date:string; location:string; maxAttendees:string; status:string; registrationOpen:boolean; tags:string; };
const INIT: EForm = { title:"", type:"workshop", description:"", date:"", location:"", maxAttendees:"", status:"upcoming", registrationOpen:true, tags:"" };

function EventModal({ event, onClose, onSave }: { event?:ClubEvent|null; onClose:()=>void; onSave:(d:Partial<ClubEvent>,id?:string)=>Promise<void> }) {
  const [form, setForm] = useState<EForm>(event ? { title:event.title, type:event.type, description:event.description||"", date:event.date?.slice(0,10)||"", location:event.location||"", maxAttendees:event.maxAttendees?.toString()||"", status:event.status, registrationOpen:event.registrationOpen, tags:event.tags?.join(", ")||"" } : INIT);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<EForm>>({});

  const validate = () => {
    const e: Partial<EForm> = {};
    if (!form.title.trim()) e.title = "Required";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: Partial<ClubEvent> = { title:form.title, type:form.type, description:form.description, date:form.date||undefined, location:form.location||undefined, status:form.status as ClubEvent["status"], registrationOpen:form.registrationOpen, tags:form.tags?form.tags.split(",").map(t=>t.trim()).filter(Boolean):[], maxAttendees:form.maxAttendees?parseInt(form.maxAttendees):undefined };
      await onSave(payload, event?._id);
      onClose();
    } catch {} finally { setSaving(false); }
  };

  const inp = (k: keyof EForm, label: string, type="text", ph="") => (
    <FormField label={label} error={(errors as Record<string,string>)[k]}>
      <input type={type} className={`input ${(errors as Record<string,string>)[k]?"error":""}`} value={form[k] as string} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={ph}/>
    </FormField>
  );
  const sel = (k: keyof EForm, label: string, opts: string[]) => (
    <FormField label={label}>
      <select className="input" value={form[k] as string} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}>
        {opts.map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
      </select>
    </FormField>
  );

  return (
    <>
      <div className="grid-2">
        <FormField label="Title *" error={errors.title}><input className={`input ${errors.title?"error":""}`} value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Workshop on LLMs"/></FormField>
        {sel("type","Type",["workshop","hackathon","talk","meetup","competition"])}
        {inp("date","Date","date")}
        {inp("location","Location","text","Lab 3, Block C")}
        {inp("maxAttendees","Max Attendees","number","50")}
        {sel("status","Status",["upcoming","ongoing","past","cancelled"])}
      </div>
      {inp("tags","Tags (comma-separated)","text","ML, Python, PyTorch")}
      <FormField label="Description">
        <textarea className="input" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} placeholder="Event description…"/>
      </FormField>
      <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.25rem" }}>
        <input type="checkbox" id="regOpen" checked={form.registrationOpen} onChange={e=>setForm(p=>({...p,registrationOpen:e.target.checked}))} style={{ width:16, height:16, accentColor:"var(--accent)", cursor:"pointer" }}/>
        <label htmlFor="regOpen" style={{ cursor:"pointer", fontSize:"0.875rem", color:"var(--text2)" }}>Registration Open</label>
      </div>
      <div style={{ display:"flex", gap:"0.75rem" }}>
        <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" style={{ flex:2 }} onClick={save} disabled={saving}>
          {saving ? <><Spinner size="sm"/>{event?"Saving…":"Creating…"}</> : (event?"Save Changes":"Create Event")}
        </button>
      </div>
    </>
  );
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ClubEvent|null|undefined>(undefined);
  const { confirm, Dialog } = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try { const { events } = await eventsApi.list(); setEvents(events); }
    catch (e: unknown) { showToast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Partial<ClubEvent>, id?: string) => {
    if (id) {
      const { event } = await eventsApi.update(id, data);
      setEvents(prev => prev.map(e => e._id === id ? event : e));
      showToast.success("Event updated — visible on website immediately");
    } else {
      await eventsApi.create(data);
      showToast.success("Event created — now visible on website!");
      await load();
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm(`Delete "${title}"? This cannot be undone.`);
    if (!ok) return;
    try { await eventsApi.delete(id); setEvents(prev => prev.filter(e => e._id !== id)); showToast.success("Event deleted"); }
    catch (e: unknown) { showToast.error(e instanceof Error ? e.message : "Delete failed"); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.75rem", flexWrap:"wrap", gap:"1rem" }}>
        <div><h1 style={{ fontSize:"1.65rem", marginBottom:"0.2rem" }}>Events</h1><p style={{ color:"var(--text2)", fontSize:"0.875rem" }}>{events.length} events — all appear on website instantly</p></div>
        <div style={{ display:"flex", gap:"0.65rem" }}>
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14} style={{ animation:loading?"spin 1s linear infinite":"none" }}/> Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={()=>setModal(null)}><Plus size={14}/> Create Event</button>
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        {loading ? <div style={{ padding:"3rem", display:"flex", justifyContent:"center" }}><Spinner size="lg"/></div>
        : events.length === 0 ? <EmptyState icon="📅" title="No events yet" description="Create your first event — it will appear on the website immediately."/>
        : (
          <table className="table">
            <thead><tr><th>Event</th><th>Type</th><th>Date</th><th>Location</th><th>Status</th><th>Reg.</th><th>Actions</th></tr></thead>
            <tbody>
              {events.map(e => (
                <tr key={e._id}>
                  <td>
                    <div style={{ fontWeight:600 }}>{e.title}</div>
                    {e.description && <div style={{ fontSize:"0.75rem", color:"var(--text3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200 }}>{e.description}</div>}
                  </td>
                  <td><span className="badge badge-blue" style={{ textTransform:"capitalize" }}>{e.type}</span></td>
                  <td style={{ color:"var(--text2)", fontSize:"0.82rem" }}>{e.date ? <span style={{ display:"flex", alignItems:"center", gap:4 }}><Calendar size={12}/>{new Date(e.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span> : "—"}</td>
                  <td style={{ color:"var(--text2)", fontSize:"0.82rem" }}>{e.location ? <span style={{ display:"flex", alignItems:"center", gap:4 }}><MapPin size={12}/>{e.location}</span> : "—"}</td>
                  <td><StatusBadge status={e.status}/></td>
                  <td><span className={`badge ${e.registrationOpen?"badge-green":"badge-gray"}`}>{e.registrationOpen?"Open":"Closed"}</span></td>
                  <td>
                    <div style={{ display:"flex", gap:4 }}>
                      <button onClick={()=>setModal(e)} className="btn btn-ghost btn-icon btn-sm" title="Edit"><Edit size={13}/></button>
                      <button onClick={()=>handleDelete(e._id,e.title)} className="btn btn-danger btn-icon btn-sm" title="Delete"><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modal !== undefined} onClose={()=>setModal(undefined)} title={modal?._id ? "Edit Event" : "Create Event"} size="lg">
        <EventModal event={modal} onClose={()=>setModal(undefined)} onSave={handleSave}/>
      </Modal>
      <Dialog/>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
