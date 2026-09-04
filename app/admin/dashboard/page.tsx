"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ClipboardList, Calendar, FlaskConical, MessageSquare, TrendingUp, RefreshCw, Check, X } from "lucide-react";
import { Spinner, Avatar, StatusBadge, showToast } from "@/components/ui";

interface Application { _id:string; firstName:string; lastName:string; email:string; branch?:string; year?:string; status:string; submittedAt:string; }
interface Message { _id:string; name:string; email:string; subject:string; message:string; createdAt:string; }

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ members:0, pendingApps:0, totalApps:0, events:0, projects:0, unreadMsgs:0 });
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [recentMsgs, setRecentMsgs] = useState<Message[]>([]);
  const [busy, setBusy] = useState<string|null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [appD, memD, msgD, evtD, prjD] = await Promise.allSettled([
        fetch("/api/applications").then(r=>r.json()),
        fetch("/api/members").then(r=>r.json()),
        fetch("/api/messages?read=false").then(r=>r.json()),
        fetch("/api/events?status=upcoming").then(r=>r.json()),
        fetch("/api/projects?admin=true").then(r=>r.json()),
      ]);
      const apps = appD.status==="fulfilled" ? appD.value : { applications:[], total:0 };
      const mem = memD.status==="fulfilled" ? memD.value : { members:[], total:0 };
      const msgs = msgD.status==="fulfilled" ? msgD.value : { messages:[], total:0 };
      const evts = evtD.status==="fulfilled" ? evtD.value : { events:[] };
      const prjs = prjD.status==="fulfilled" ? prjD.value : { projects:[] };
      setStats({ members:mem.total||0, pendingApps:apps.applications?.filter((a:Application)=>a.status==="pending").length||0, totalApps:apps.total||0, events:evts.events?.length||0, projects:prjs.projects?.length||0, unreadMsgs:msgs.total||0 });
      setRecentApps(apps.applications?.slice(0,6)||[]);
      setRecentMsgs(msgs.messages?.slice(0,4)||[]);
    } catch { showToast.error("Failed to load dashboard data"); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const updateApp = async (id:string, status:"accepted"|"rejected") => {
    setBusy(id+status);
    try {
      const r = await fetch(`/api/applications/${id}`,{ method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({status}) });
      const d = await r.json();
      if(!r.ok) throw new Error(d.error);
      setRecentApps(prev=>prev.map(a=>a._id===id?{...a,status}:a));
      setStats(p=>({...p,pendingApps:Math.max(0,p.pendingApps-1)}));
      showToast.success(`Application ${status}`);
    } catch(e:unknown){ showToast.error(e instanceof Error?e.message:"Failed"); }
    finally{ setBusy(null); }
  };

  const statCards = [
    { label:"Members", value:stats.members, icon:Users, color:"var(--accent)", bg:"var(--accent-bg)", href:"/admin/members" },
    { label:"Applications", value:stats.totalApps, sub:`${stats.pendingApps} pending`, icon:ClipboardList, color:"var(--orange)", bg:"var(--orange-bg)", href:"/admin/applications" },
    { label:"Upcoming Events", value:stats.events, icon:Calendar, color:"var(--green)", bg:"var(--green-bg)", href:"/admin/events" },
    { label:"Projects", value:stats.projects, icon:FlaskConical, color:"var(--purple)", bg:"var(--purple-bg)", href:"/admin/projects" },
    { label:"Unread Messages", value:stats.unreadMsgs, icon:MessageSquare, color:"var(--red)", bg:"var(--red-bg)", href:"/admin/messages" },
    { label:"Pending Review", value:stats.pendingApps, icon:TrendingUp, color:"var(--cyan)", bg:"var(--cyan-bg)", href:"/admin/applications" },
  ];

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.75rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h1 style={{ fontSize:"1.65rem", marginBottom:"0.2rem" }}>Dashboard</h1>
          <p style={{ color:"var(--text2)", fontSize:"0.875rem" }}>Welcome back — here's what's happening at AI-Club.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
          <RefreshCw size={14} style={{ animation:loading?"spin 1s linear infinite":"none" }}/> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:"1rem", marginBottom:"2rem" }}>
        {statCards.map(s => (
          <Link key={s.label} href={s.href} style={{ textDecoration:"none" }}>
            <div style={{ background:s.bg, border:`1px solid ${s.color}25`, borderRadius:"var(--radius-lg)", padding:"1.25rem", cursor:"pointer", transition:"all 0.2s" }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform="translateY(-2px)"}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform="none"}>
              <div style={{ width:38, height:38, borderRadius:10, background:`${s.color}20`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"0.875rem" }}>
                <s.icon size={18} color={s.color}/>
              </div>
              <div style={{ fontSize:"1.85rem", fontWeight:800, color:s.color, lineHeight:1, fontFamily:"'Space Grotesk',sans-serif" }}>{loading?"—":s.value}</div>
              <div style={{ fontSize:"0.78rem", fontWeight:600, color:"var(--text1)", marginTop:"0.3rem" }}>{s.label}</div>
              {s.sub && <div style={{ fontSize:"0.7rem", color:"var(--text3)", marginTop:"0.15rem" }}>{s.sub}</div>}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid-2">
        {/* Recent Applications */}
        <div className="card" style={{ overflow:"hidden" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"1.1rem 1.25rem", borderBottom:"1px solid var(--border2)" }}>
            <h3 style={{ fontSize:"0.95rem", fontWeight:700 }}>Recent Applications</h3>
            <Link href="/admin/applications" style={{ fontSize:"0.78rem", color:"var(--accent)", textDecoration:"none", fontWeight:500 }}>View all →</Link>
          </div>
          {loading ? <div style={{ padding:"2rem", display:"flex", justifyContent:"center" }}><Spinner/></div>
          : recentApps.length === 0 ? <div style={{ padding:"2rem", textAlign:"center", color:"var(--text2)", fontSize:"0.875rem" }}>No applications yet</div>
          : recentApps.map((a,i) => (
            <div key={a._id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0.875rem 1.25rem", borderBottom:"1px solid var(--border2)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                <Avatar name={`${a.firstName} ${a.lastName}`} size="sm" index={i}/>
                <div>
                  <div style={{ fontWeight:600, fontSize:"0.875rem" }}>{a.firstName} {a.lastName}</div>
                  <div style={{ fontSize:"0.73rem", color:"var(--text3)" }}>{a.branch||a.email}</div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                <StatusBadge status={a.status}/>
                {a.status==="pending" && (
                  <div style={{ display:"flex", gap:3 }}>
                    <button onClick={()=>updateApp(a._id,"accepted")} disabled={!!busy} className="btn btn-sm" style={{ padding:"0.25rem 0.5rem", background:"var(--green-bg)", color:"var(--green)", border:"1px solid rgba(16,185,129,0.3)" }}><Check size={12}/></button>
                    <button onClick={()=>updateApp(a._id,"rejected")} disabled={!!busy} className="btn btn-sm" style={{ padding:"0.25rem 0.5rem", background:"var(--red-bg)", color:"var(--red)", border:"1px solid rgba(239,68,68,0.3)" }}><X size={12}/></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Messages */}
        <div className="card" style={{ overflow:"hidden" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"1.1rem 1.25rem", borderBottom:"1px solid var(--border2)" }}>
            <h3 style={{ fontSize:"0.95rem", fontWeight:700 }}>Unread Messages</h3>
            <Link href="/admin/messages" style={{ fontSize:"0.78rem", color:"var(--accent)", textDecoration:"none", fontWeight:500 }}>View all →</Link>
          </div>
          {loading ? <div style={{ padding:"2rem", display:"flex", justifyContent:"center" }}><Spinner/></div>
          : recentMsgs.length === 0 ? <div style={{ padding:"2rem", textAlign:"center", color:"var(--text2)", fontSize:"0.875rem" }}>✉️ No unread messages</div>
          : recentMsgs.map(m => (
            <div key={m._id} style={{ padding:"0.875rem 1.25rem", borderBottom:"1px solid var(--border2)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.25rem" }}>
                <span style={{ fontWeight:600, fontSize:"0.875rem" }}>{m.name}</span>
                <span style={{ fontSize:"0.72rem", color:"var(--text3)" }}>{new Date(m.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span>
              </div>
              <div style={{ fontSize:"0.8rem", color:"var(--accent2)", fontWeight:600, marginBottom:"0.2rem" }}>{m.subject}</div>
              <p style={{ fontSize:"0.78rem", color:"var(--text2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.message}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
