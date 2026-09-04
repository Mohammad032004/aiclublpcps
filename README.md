# NexusAI Club Website

Full-featured AI/ML student club website — Next.js 15 App Router + Tailwind CSS + MongoDB + NextAuth.

## Pages
| Page | Route |
|------|-------|
| Home (Hero, Stats, Events, Projects, Team) | `/` |
| About (Vision, Mission, Team Hierarchy, Timeline) | `/about` |
| Events (Filterable, Register, Past Gallery) | `/events` |
| Projects (Search, Filter, GitHub/Demo links) | `/projects` |
| Resources (Member-gated, Categories) | `/resources` |
| Contact (Form → MongoDB) | `/contact` |
| Apply (4-step form) | `/apply` |
| Admin Login 🔒 | `/login` |
| Admin Dashboard | `/admin/dashboard` |
| Admin Members | `/admin/members` |
| Admin Applications (Accept/Reject) | `/admin/applications` |
| Admin Team Management | `/admin/team` |
| Admin Events | `/admin/events` |
| Admin Projects | `/admin/projects` |
| Admin Resources | `/admin/resources` |
| Admin Messages | `/admin/messages` |
| Admin Settings | `/admin/settings` |

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and NextAuth secret

# 3. Run
npm run dev
# → http://localhost:3000
# → http://localhost:3000/login (hidden admin)
```

## Tech Stack
- **Next.js 15** (App Router)
- **Tailwind CSS** + custom design system
- **MongoDB** (Mongoose)
- **NextAuth.js** (JWT)
- **Space Grotesk + Syne** fonts
- **Lucide React** icons

## Structure
```
app/                  → All pages (public + admin)
components/layout/    → Navbar, Footer
components/ui/        → Reusable components + ChatbotWidget
lib/db.ts             → MongoDB connection
models/index.ts       → All Mongoose schemas
app/api/              → REST API routes
.env.example          → Environment variable template
```

## Deploy
```bash
npx vercel   # Deploy to Vercel
```
Add MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL in Vercel dashboard.

Developed by Mohammad Irfan.
