"use client";
import { useState, useEffect } from "react";
import { SectionHeader, Card, Avatar, Spinner, EmptyState } from "@/components/ui";
import { Search, ExternalLink } from "lucide-react";

interface Member { _id: string; name: string; role: string; branch?: string; year?: string; bio?: string; github?: string; linkedin?: string; skills?: string[]; status: string; }
interface TeamMember { _id: string; name: string; role: string; tier: string; department?: string; course?: string; bio?: string; email?: string; visible: boolean; order: number; }

const STATIC_TEAM = [
  { tier: "Faculty Head", members: [{ name:"Dr. R. Verma", role:"Faculty Head", dept:"Computer Science & Engineering", bio:"15+ years of AI/ML research. PhD from IIT Delhi. Guiding the club's academic direction." }] },
  { tier: "Leadership", members: [{ name:"Aryan Kumar", role:"Club President", dept:"CSE (AI/ML) · 3rd Year", bio:"ML engineer. 3 national hackathon wins. Leads club strategy and growth." }, { name:"Priya Sharma", role:"Vice President", dept:"Data Science · 3rd Year", bio:"NLP researcher. Fine-tunes large language models. HuggingFace contributor." }] },
  { tier: "Core Members", members: [{ name:"Sneha Rao", role:"NLP Lead", dept:"CSE · 2nd Year", bio:"Multilingual NLP specialist. Loves open-source." }, { name:"Vikram Agarwal", role:"Cybersecurity Lead", dept:"IT · 3rd Year", bio:"CTF champion. Adversarial ML and network security." }, { name:"Riya Mehta", role:"Events Lead", dept:"CSE · 2nd Year", bio:"Organizes workshops & hackathons. 500+ attendees managed." }, { name:"Kavya Pillai", role:"Design & Dev Lead", dept:"CSE · 2nd Year", bio:"Full-stack developer. Builds all club platforms." }] },
];
const TIER_COLORS: Record<string, string> = { "Faculty Head":"var(--orange)", Leadership:"var(--accent)", "Core Members":"var(--green)", Members:"var(--purple)" };

export default function AboutPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [teamFromDB, setTeamFromDB] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    Promise.allSettled([
      fetch("/api/members?status=active").then(r => r.json()),
      fetch("/api/team").then(r => r.json()),
    ]).then(([mRes, tRes]) => {
      if (mRes.status === "fulfilled") setMembers(mRes.value.members || []);
      if (tRes.status === "fulfilled") setTeamFromDB(tRes.value.team || []);
    }).finally(() => setLoadingMembers(false));
  }, []);

  const filteredMembers = members.filter(m => {
    const q = `${m.name} ${m.role} ${m.branch || ""} ${m.skills?.join(" ") || ""}`.toLowerCase();
    return q.includes(search.toLowerCase()) && (roleFilter === "all" || m.role === roleFilter);
  });

  const TIER_ORDER = ["faculty", "leadership", "core", "member"];
  const groupedDB: Record<string, TeamMember[]> = {};
  teamFromDB.forEach(m => { if (!groupedDB[m.tier]) groupedDB[m.tier] = []; groupedDB[m.tier].push(m); });

  return (
    <>
      {/* Hero */}
      <section style={{ padding:"6rem 1.5rem 4rem", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle,var(--border2) 1px,transparent 1px)", backgroundSize:"36px 36px", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:1, maxWidth:680, margin:"0 auto" }}>
          <div className="section-tag" style={{ margin:"0 auto 1.25rem" }}>About Us</div>
          <h1 style={{ fontSize:"clamp(2.5rem,6vw,4rem)", marginBottom:"1rem" }}>We are <span className="gradient-text">AI-CLUB</span></h1>
          <p style={{ color:"var(--text2)", fontSize:"1.05rem", lineHeight:1.75, marginBottom:"2rem" }}>Founded in 2022, AI-Club is the premier AI student community at LPCPS — where research meets real-world impact.</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", maxWidth:560, margin:"0 auto" }}>
            {[{emoji:"🎯",t:"Vision",d:"Leading student AI innovation hub"},{emoji:"🚀",t:"Mission",d:"Democratizing AI through hands-on work"},{emoji:"💡",t:"Values",d:"Open learning & radical collaboration"}].map(v=>(
              <div key={v.t} style={{ background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:"var(--radius)", padding:"1.25rem 0.875rem", textAlign:"center" }}>
                <div style={{ fontSize:"1.5rem", marginBottom:"0.4rem" }}>{v.emoji}</div>
                <div style={{ fontWeight:700, fontSize:"0.88rem", marginBottom:"0.3rem" }}>{v.t}</div>
                <div style={{ fontSize:"0.78rem", color:"var(--text2)" }}>{v.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Members Section */}
      <section style={{ padding:"4rem 1.5rem", background:"var(--bg2)", borderTop:"1px solid var(--border2)" }}>
        <div className="container">
          <SectionHeader tag="Our Members" title="Meet the Community" subtitle="Active members building, learning, and competing together."/>
          <div style={{ display:"flex", gap:"1rem", marginBottom:"2rem", flexWrap:"wrap", alignItems:"center" }}>
            <div style={{ position:"relative", flex:"1 1 260px", maxWidth:340 }}>
              <Search size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--text3)" }}/>
              <input className="input" style={{ paddingLeft:36 }} placeholder="Search name, role, skill…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
              {["all","core","admin","member"].map(f=>(
                <button key={f} onClick={()=>setRoleFilter(f)} className={`btn btn-sm ${roleFilter===f?"btn-primary":"btn-ghost"}`} style={{ textTransform:"capitalize" }}>{f==="all"?"All Roles":f}</button>
              ))}
            </div>
          </div>
          {loadingMembers ? (
            <div style={{ display:"flex", justifyContent:"center", padding:"3rem" }}><Spinner size="lg"/></div>
          ) : filteredMembers.length === 0 ? (
            <EmptyState icon="👥" title={members.length===0?"No members yet":"No members match your search"} description={members.length===0?"Members added from the admin dashboard will appear here.":"Try different filters."}/>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"1.25rem" }}>
              {filteredMembers.map((m,i)=>(
                <Card key={m._id} hover style={{ padding:"1.5rem", textAlign:"center" }}>
                  <div style={{ margin:"0 auto 0.875rem" }}><Avatar name={m.name} size="lg" index={i}/></div>
                  <h4 style={{ fontSize:"0.95rem", marginBottom:"0.2rem" }}>{m.name}</h4>
                  <p style={{ fontSize:"0.78rem", color:"var(--accent2)", fontWeight:600, textTransform:"capitalize", marginBottom:"0.3rem" }}>{m.role}</p>
                  {m.branch && <p style={{ fontSize:"0.73rem", color:"var(--text3)", marginBottom:"0.65rem" }}>{m.branch}{m.year && ` · ${m.year}`}</p>}
                  {m.bio && <p style={{ fontSize:"0.8rem", color:"var(--text2)", lineHeight:1.55, marginBottom:"0.75rem" }}>{m.bio}</p>}
                  {m.skills && m.skills.length > 0 && (
                    <div style={{ display:"flex", gap:"0.3rem", flexWrap:"wrap", justifyContent:"center", marginBottom:"0.75rem" }}>
                      {m.skills.slice(0,3).map(s=><span key={s} style={{ background:"var(--accent-bg)", color:"var(--accent2)", fontSize:"0.68rem", padding:"0.15rem 0.5rem", borderRadius:100, border:"1px solid var(--accent-border)" }}>{s}</span>)}
                    </div>
                  )}
                  {(m.github||m.linkedin) && (
                    <div style={{ display:"flex", gap:"0.4rem", justifyContent:"center" }}>
                      {m.github && <a href={m.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ fontSize:"0.72rem" }}><ExternalLink size={11}/> GitHub</a>}
                      {m.linkedin && <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ fontSize:"0.72rem", background:"var(--accent-bg)", color:"var(--accent2)", border:"1px solid var(--accent-border)" }}><ExternalLink size={11}/> LinkedIn</a>}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Domains */}
      <section style={{ padding:"4rem 1.5rem" }}>
        <div className="container">
          <SectionHeader tag="Domains" title="What We Cover"/>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:"1rem" }}>
            {[{e:"🤖",l:"Machine Learning"},{e:"🧠",l:"Deep Learning"},{e:"💬",l:"NLP & LLMs"},{e:"👁",l:"Computer Vision"},{e:"🔐",l:"Cybersecurity"},{e:"⚡",l:"MLOps / DevOps"},{e:"🌐",l:"Web Development"},{e:"📡",l:"IoT & Edge AI"},{e:"📊",l:"Data Science"},{e:"🎮",l:"Reinforcement Learning"}].map(d=>(
              <div key={d.l} style={{ background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:"var(--radius)", padding:"1.5rem 1.25rem", transition:"all 0.2s" }}>
                <div style={{ fontSize:"1.75rem", marginBottom:"0.6rem" }}>{d.e}</div>
                <h4 style={{ fontSize:"0.9rem", fontWeight:600 }}>{d.l}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Hierarchy */}
      <section style={{ padding:"4rem 1.5rem", background:"var(--bg2)", borderTop:"1px solid var(--border2)" }}>
        <div className="container">
          <SectionHeader tag="The Team" title="Club Hierarchy" subtitle="Faculty guidance to core operations."/>
          {teamFromDB.length > 0 ? (
            TIER_ORDER.filter(t => groupedDB[t]?.length > 0).map(tier => (
              <div key={tier} style={{ marginBottom:"3rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.25rem" }}>
                  <span style={{ background:`${TIER_COLORS[tier]||"var(--accent)"}15`, color:TIER_COLORS[tier]||"var(--accent)", border:`1px solid ${TIER_COLORS[tier]||"var(--accent)"}30`, padding:"0.25rem 0.85rem", borderRadius:100, fontSize:"0.72rem", fontWeight:700, textTransform:"capitalize", letterSpacing:"0.06em" }}>{tier}</span>
                  <div style={{ flex:1, height:1, background:"var(--border2)" }}/>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1.25rem" }}>
                  {groupedDB[tier].map((m,i)=>(
                    <Card key={m._id} hover style={{ padding:"1.5rem", display:"flex", gap:"1rem", alignItems:"flex-start" }}>
                      <Avatar name={m.name} size="md" index={i}/>
                      <div style={{ flex:1 }}>
                        <h4 style={{ fontSize:"0.95rem", marginBottom:"0.2rem" }}>{m.name}</h4>
                        <p style={{ fontSize:"0.78rem", color:"var(--accent2)", fontWeight:600, marginBottom:"0.2rem" }}>{m.role}</p>
                        {m.department && <p style={{ fontSize:"0.75rem", color:"var(--text3)", marginBottom:"0.6rem" }}>{m.department}</p>}
                        {m.bio && <p style={{ fontSize:"0.82rem", color:"var(--text2)", lineHeight:1.6 }}>{m.bio}</p>}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          ) : (
            STATIC_TEAM.map(tier => (
              <div key={tier.tier} style={{ marginBottom:"3rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.25rem" }}>
                  <span style={{ background:`${TIER_COLORS[tier.tier]||"var(--accent)"}15`, color:TIER_COLORS[tier.tier]||"var(--accent)", border:`1px solid ${TIER_COLORS[tier.tier]||"var(--accent)"}30`, padding:"0.25rem 0.85rem", borderRadius:100, fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.06em" }}>{tier.tier}</span>
                  <div style={{ flex:1, height:1, background:"var(--border2)" }}/>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1.25rem" }}>
                  {tier.members.map((m,i)=>(
                    <Card key={m.name} hover style={{ padding:"1.5rem", display:"flex", gap:"1rem", alignItems:"flex-start" }}>
                      <Avatar name={m.name} size="md" index={i}/>
                      <div style={{ flex:1 }}>
                        <h4 style={{ fontSize:"0.95rem", marginBottom:"0.2rem" }}>{m.name}</h4>
                        <p style={{ fontSize:"0.78rem", color:"var(--accent2)", fontWeight:600, marginBottom:"0.2rem" }}>{m.role}</p>
                        <p style={{ fontSize:"0.75rem", color:"var(--text3)", marginBottom:"0.6rem" }}>{m.dept}</p>
                        <p style={{ fontSize:"0.82rem", color:"var(--text2)", lineHeight:1.6 }}>{m.bio}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding:"4rem 1.5rem" }}>
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          <SectionHeader tag="History" title="Our Journey" center={false}/>
          {[{y:"2022",t:"Founded",d:"Started with 12 members and a single Python ML workshop."},{y:"2023",t:"First Win",d:"1st place at state ML hackathon. Grew to 50+ active members."},{y:"2024",t:"Research & Scale",d:"First research paper published. Launched Cybersecurity track."},{y:"2025",t:"100+ & Growing",d:"National 2nd place. LLM research pipeline. Batch 2025 open."}].map((e,i)=>(
            <div key={e.y} style={{ display:"flex", gap:"1.5rem", marginBottom:"2rem" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,var(--accent),var(--purple))", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:"0.72rem", color:"white", flexShrink:0 }}>{e.y}</div>
                {i<3 && <div style={{ width:2, flex:1, background:"var(--border2)", marginTop:4 }}/>}
              </div>
              <div style={{ paddingBottom:"1.5rem" }}>
                <h4 style={{ marginBottom:"0.4rem" }}>{e.t}</h4>
                <p style={{ color:"var(--text2)", fontSize:"0.875rem", lineHeight:1.65 }}>{e.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
