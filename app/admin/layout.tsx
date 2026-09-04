"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList, Calendar, FlaskConical, BookOpen, MessageSquare, Settings, LogOut, Brain, Menu, Bell, ChevronLeft, UserCog } from "lucide-react";
import { ThemeToggle, ToastContainer, Avatar } from "@/components/ui";

const NAV = [
  { href:"/admin/dashboard", icon:LayoutDashboard, label:"Dashboard" },
  { href:"/admin/applications", icon:ClipboardList, label:"Applications" },
  { href:"/admin/members", icon:Users, label:"Members" },
  { href:"/admin/events", icon:Calendar, label:"Events" },
  { href:"/admin/projects", icon:FlaskConical, label:"Projects" },
  { href:"/admin/resources", icon:BookOpen, label:"Resources" },
  { href:"/admin/messages", icon:MessageSquare, label:"Messages" },
  { href:"/admin/team", icon:UserCog, label:"Team" },
  { href:"/admin/settings", icon:Settings, label:"Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  if (pathname === "/login" || pathname?.includes("/login")) return <>{children}</>;

  return (
    <div className="admin-wrap">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
        {/* Logo */}
        <div style={{ height:60, display:"flex", alignItems:"center", padding: collapsed ? "0 1rem" : "0 1.25rem", borderBottom:"1px solid var(--border2)", gap:"0.65rem", flexShrink:0 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Brain size={16} color="white"/></div>
          {!collapsed && <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:"1.05rem", color:"var(--text1)", whiteSpace:"nowrap" }}>AI-CLUB</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"0.5rem 0", overflowY:"auto" }}>
          {NAV.map(item => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} className={`sidebar-link ${active ? "active" : ""}`} title={collapsed ? item.label : undefined}>
                <item.icon size={17} className="icon"/>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop:"1px solid var(--border2)", padding:"0.5rem" }}>
          <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); router.refresh(); }} className="sidebar-link" style={{ width:"100%", background:"none", border:"none", cursor:"pointer", justifyContent: collapsed ? "center" : "flex-start" }} title={collapsed ? "Logout" : undefined}>
            <LogOut size={17} className="icon"/>{!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={`admin-main ${collapsed ? "collapsed" : ""}`}>
        {/* Topbar */}
        <header className="admin-topbar">
          <button onClick={() => setCollapsed(!collapsed)} className="btn btn-ghost btn-icon" style={{ color:"var(--text2)" }}>
            {collapsed ? <Menu size={18}/> : <ChevronLeft size={18}/>}
          </button>
          <div style={{ flex:1, paddingLeft:"1rem" }}>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:"0.85rem", color:"var(--text2)" }}>
              {NAV.find(n => pathname?.startsWith(n.href))?.label || "Admin Panel"}
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <ThemeToggle/>
            <button className="btn btn-ghost btn-icon" style={{ color:"var(--text2)", position:"relative" }}>
              <Bell size={18}/>
              <span style={{ position:"absolute", top:6, right:6, width:7, height:7, background:"var(--red)", borderRadius:"50%", border:"2px solid var(--surface)" }}/>
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", paddingLeft:"0.5rem", borderLeft:"1px solid var(--border2)", marginLeft:"0.25rem" }}>
              <Avatar name="Admin" size="sm" index={0}/>
              <div>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:"0.8rem" }}>Admin</div>
                <div style={{ fontSize:"0.68rem", color:"var(--text3)", fontFamily:"'JetBrains Mono',monospace" }}>admin@aiclub.in</div>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </div>

      <ToastContainer/>
    </div>
  );
}
