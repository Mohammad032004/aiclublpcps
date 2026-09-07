# 🤖 AI Club Website

A full-featured website for an AI/ML student club, built to manage the club's public presence, applications, events, projects, team, resources, messages, and announcements from a centralized admin panel.

The website is designed so that most content can be managed dynamically through the admin dashboard without requiring code changes.

---

## 🌐 Pages

| Page | Route |
|------|-------|
| Home (Hero, Stats, Events, Projects, Team) | `/` |
| About (Vision, Mission, Team Hierarchy, Timeline) | `/about` |
| Events (Filterable Events, Registration, Past Gallery) | `/events` |
| Projects (Search, Filter, GitHub/Demo Links) | `/projects` |
| Resources (Member-Gated Resources, Categories) | `/resources` |
| Contact (Form → MongoDB) | `/contact` |
| Apply (4-Step Application Form) | `/apply` |
| Admin Login 🔒 | `/login` |

---

## 🔐 Admin Panel

The admin panel provides centralized management for the AI Club website.

| Section | Route | Purpose |
|---------|-------|---------|
| Dashboard | `/admin/dashboard` | Overview and statistics |
| Applications | `/admin/applications` | Review, accept, and reject applications |
| Announcements | `/admin/announcements` | Create, edit, delete, and manage website announcements |
| Events | `/admin/events` | Manage club events and registrations |
| Projects | `/admin/projects` | Manage club projects |
| Resources | `/admin/resources` | Manage learning resources |
| Messages | `/admin/messages` | Manage contact messages |
| Team | `/admin/team` | Manage team members and leadership |
| Settings | `/admin/settings` | Manage admin settings |

---

## 📢 Announcement System

The website includes a database-driven announcement system.

Announcements can be completely managed from:

`Admin Panel → Announcements`

Administrators can control:

- Announcement title
- Description
- Badge / tag
- Button text
- Button link
- Active / inactive status
- Popup visibility

The website popup automatically displays the announcement selected from the admin panel.

This allows announcements such as:

- AI Club Applications
- Workshops
- Hackathons
- Events
- Registration notices
- Important club updates

to be changed without modifying the frontend code.

---

## 📝 Applications

Students can apply to join the AI Club through the application form.

### Application Route

`/apply`

The application system collects relevant student information and stores submissions in MongoDB.

Administrators can review applications from:

`Admin Panel → Applications`

Applications can be managed according to their status, including accepting or rejecting applicants.

---

## 👥 Team Management

The AI Club team is managed dynamically through:

`Admin Panel → Team`

Team information can include:

- Name
- Role
- Department
- Course
- Bio
- Email
- GitHub
- LinkedIn
- Photo
- Visibility
- Display order

This allows the public Team/About sections to be updated from the admin panel.

---

## 📅 Events

The Events section supports:

- Upcoming events
- Event details
- Registration
- Event filtering
- Past events
- Event gallery

Events are managed through:

`Admin Panel → Events`

---

## 🚀 Projects

The Projects section showcases AI/ML projects developed by club members.

Features include:

- Project search
- Category filtering
- Project details
- GitHub links
- Demo links

Projects are managed through:

`Admin Panel → Projects`

---

## 📚 Resources

The Resources section provides learning materials for club members.

Resources can be organized into categories and managed through:

`Admin Panel → Resources`

---

## 💬 Contact & Messages

Visitors can contact the AI Club through:

`/contact`

Submitted messages are stored in MongoDB and can be managed from:

`Admin Panel → Messages`

---

## 🛠️ Tech Stack

- **Next.js 15** — App Router
- **React** — Frontend UI
- **TypeScript** — Type-safe development
- **Tailwind CSS** — Styling
- **MongoDB** — Database
- **Mongoose** — MongoDB ODM
- **NextAuth.js** — Authentication
- **Lucide React** — Icons
- **Space Grotesk + Syne** — Typography
- **Vercel** — Deployment

---

## 📁 Project Structure

```text
app/
├── (public)/              → Public website pages
├── admin/                 → Admin dashboard
│   ├── dashboard/
│   ├── applications/
│   ├── announcements/
│   ├── events/
│   ├── projects/
│   ├── resources/
│   ├── messages/
│   ├── team/
│   └── settings/
│
├── api/                   → REST API routes
│   ├── announcements/
│   ├── applications/
│   ├── events/
│   ├── projects/
│   ├── resources/
│   ├── messages/
│   └── team/
│
└── login/                 → Admin login

components/
├── layout/                → Navbar, Footer, etc.
├── ui/                    → Reusable UI components
└── AnnouncementPopup.tsx  → Database-driven announcement popup

lib/
├── api.ts                 → Frontend API helpers
└── db.ts                  → MongoDB connection

models/
└── index.ts               → Mongoose schemas/models

public/
└── ai-club-logo.png       → AI Club logo

.env.example               → Environment variable template


---
---

## 👨‍💻 Developer

**Developed by Irfan Ansari**

---

## 📄 License

This project is developed for the AI Club and its related academic and community activities.