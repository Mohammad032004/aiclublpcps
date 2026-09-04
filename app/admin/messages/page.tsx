"use client";
import { useState, useEffect, useCallback } from "react";
import { Trash2, RefreshCw, Mail, MailOpen, X } from "lucide-react";
import { messagesApi, Message } from "@/lib/api";
import { Spinner, EmptyState, showToast, useConfirm } from "@/components/ui";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message|null>(null);
  const { confirm, Dialog } = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try { const { messages } = await messagesApi.list(); setMessages(messages); }
    catch (e: unknown) { showToast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const markRead = async (id: string, read: boolean) => {
    try {
      await messagesApi.markRead(id, read);
      setMessages(prev=>prev.map(m=>m._id===id?{...m,read}:m));
      if (selected?._id===id) setSelected(prev=>prev?{...prev,read}:null);
    } catch (e: unknown) { showToast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const del = async (id: string) => {
    const ok = await confirm("Delete this message?");
    if (!ok) return;
    try { await messagesApi.delete(id); setMessages(prev=>prev.filter(m=>m._id!==id)); if(selected?._id===id) setSelected(null); showToast.success("Deleted"); }
    catch (e: unknown) { showToast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const unread = messages.filter(m=>!m.read).length;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.75rem", flexWrap:"wrap", gap:"1rem" }}>
        <div><h1 style={{ fontSize:"1.65rem", marginBottom:"0.2rem" }}>Messages</h1><p style={{ color:"var(--text2)", fontSize:"0.875rem" }}>{unread} unread · {messages.length} total</p></div>
        <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14} style={{ animation:loading?"spin 1s linear infinite":"none" }}/> Refresh</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:selected?"1fr 1.1fr":"1fr", gap:"1.5rem", alignItems:"start" }}>
        <div className="card" style={{ overflow:"hidden" }}>
          {loading ? <div style={{ padding:"3rem", display:"flex", justifyContent:"center" }}><Spinner size="lg"/></div>
          : messages.length===0 ? <EmptyState icon="✉️" title="No messages yet"/>
          : messages.map(m => (
            <div key={m._id} onClick={()=>{ setSelected(selected?._id===m._id?null:m); if(!m.read) markRead(m._id,true); }}
              style={{ padding:"0.875rem 1.25rem", borderBottom:"1px solid var(--border2)", cursor:"pointer", background:selected?._id===m._id?"var(--accent-bg)":"transparent", transition:"background 0.15s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.25rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                  {m.read ? <MailOpen size={14} color="var(--text3)"/> : <Mail size={14} color="var(--accent)"/>}
                  <span style={{ fontWeight:m.read?500:700, fontSize:"0.875rem" }}>{m.name}</span>
                  {!m.read && <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--accent)", display:"inline-block", flexShrink:0 }}/>}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
                  <span style={{ fontSize:"0.72rem", color:"var(--text3)" }}>{new Date(m.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span>
                  <button onClick={e=>{e.stopPropagation();del(m._id);}} className="btn btn-ghost btn-icon" style={{ padding:"0.2rem", color:"var(--text3)" }}><Trash2 size={12}/></button>
                </div>
              </div>
              <div style={{ fontSize:"0.8rem", color:"var(--accent2)", fontWeight:600, marginBottom:"0.2rem" }}>{m.subject}</div>
              <p style={{ fontSize:"0.78rem", color:"var(--text2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.message}</p>
            </div>
          ))}
        </div>

        {selected && (
          <div className="card card-p-lg" style={{ position:"sticky", top:"1.5rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
              <h3 style={{ fontSize:"1rem" }}>{selected.subject}</h3>
              <button onClick={()=>setSelected(null)} className="btn btn-ghost btn-icon btn-sm"><X size={16}/></button>
            </div>
            {[{l:"From",v:selected.name},{l:"Email",v:selected.email},{l:"Received",v:new Date(selected.createdAt).toLocaleString("en-IN")}].map(r=>(
              <div key={r.l} style={{ marginBottom:"0.75rem" }}>
                <div style={{ fontSize:"0.68rem", fontWeight:700, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"0.2rem" }}>{r.l}</div>
                <div style={{ fontSize:"0.875rem" }}>{r.v}</div>
              </div>
            ))}
            <div style={{ marginTop:"0.5rem" }}>
              <div style={{ fontSize:"0.68rem", fontWeight:700, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"0.5rem" }}>Message</div>
              <div style={{ background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:"var(--radius-sm)", padding:"1rem", fontSize:"0.875rem", color:"var(--text2)", lineHeight:1.7 }}>{selected.message}</div>
            </div>
            <div style={{ display:"flex", gap:"0.65rem", marginTop:"1.25rem" }}>
              <button onClick={()=>markRead(selected._id,!selected.read)} className="btn btn-outline btn-sm" style={{ flex:1 }}>{selected.read?"Mark Unread":"Mark Read"}</button>
              <button onClick={()=>del(selected._id)} className="btn btn-danger btn-sm" style={{ flex:1 }}>Delete</button>
            </div>
          </div>
        )}
      </div>
      <Dialog/>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
