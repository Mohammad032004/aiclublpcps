# 🤖 AI Club Website

> **Learn • Build • Innovate • Lead**

A modern, full-featured platform built for an **AI/ML student club** to manage its digital presence, student applications, events, projects, resources, team members, announcements, and communications through a centralized administration system.

The website combines a **public-facing AI Club portal** with a powerful **Admin Dashboard**, allowing authorized administrators to manage most website content dynamically without making code changes.

---

## 🌟 About the Project

The **AI Club Website** is designed as a centralized digital platform for an academic AI/ML community.

It provides students with a place to:

* 🤖 Discover the AI Club
* 📅 Explore upcoming and past events
* 🚀 Discover student projects
* 📚 Access learning resources
* 📝 Apply for club membership
* 👥 Learn about the club team
* 📢 Stay updated with announcements
* 💬 Contact the club

At the same time, administrators get a dedicated dashboard to manage the complete website ecosystem.

---

## ✨ Key Features

### 🌐 Public Website

* Modern and responsive UI
* AI/ML-focused branding
* Dynamic content
* Event discovery
* Project showcase
* Learning resources
* Team information
* Membership applications
* Contact system
* Dynamic announcements

### 🔐 Administration

* Secure admin authentication
* Centralized dashboard
* Application management
* Event management
* Project management
* Resource management
* Team management
* Announcement management
* Contact message management
* Admin settings

### 🗄️ Backend

* MongoDB database
* Mongoose data models
* Next.js API routes
* Database-driven content
* Authentication system

---

## 🌐 Public Website Pages

| Page               | Route        | Description                                           |
| ------------------ | ------------ | ----------------------------------------------------- |
| 🏠 **Home**        | `/`          | Hero, statistics, events, projects, and team          |
| ℹ️ **About**       | `/about`     | Vision, mission, hierarchy, and timeline              |
| 📅 **Events**      | `/events`    | Upcoming events, registration, filtering, and gallery |
| 🚀 **Projects**    | `/projects`  | Searchable and filterable AI/ML project showcase      |
| 📚 **Resources**   | `/resources` | Learning resources and educational materials          |
| 💬 **Contact**     | `/contact`   | Contact form and communication system                 |
| 📝 **Apply**       | `/apply`     | Four-step AI Club membership application              |
| 🔑 **Admin Login** | `/login`     | Administrator authentication                          |

---

## 🔐 Admin Panel

The Admin Panel is the central management system for the entire AI Club website.

Authorized administrators can manage website content without directly editing the source code.

| Section              | Route                  | Purpose                                         |
| -------------------- | ---------------------- | ----------------------------------------------- |
| 📊 **Dashboard**     | `/admin/dashboard`     | Overview and statistics                         |
| 📝 **Applications**  | `/admin/applications`  | Review, accept, reject, and manage applications |
| 📢 **Announcements** | `/admin/announcements` | Create, edit, delete, and manage announcements  |
| 📅 **Events**        | `/admin/events`        | Manage events and registrations                 |
| 🚀 **Projects**      | `/admin/projects`      | Manage club projects                            |
| 📚 **Resources**     | `/admin/resources`     | Manage learning resources                       |
| 💬 **Messages**      | `/admin/messages`      | Manage contact messages                         |
| 👥 **Team**          | `/admin/team`          | Manage team members and leadership              |
| ⚙️ **Settings**      | `/admin/settings`      | Manage administrator settings                   |

---

## 📢 Announcement System

The website includes a **database-driven announcement system**.

Administrators can create and manage announcements directly from:

**Admin Panel → Announcements**

No frontend code modification is required to update the active announcement.

### Announcement Controls

Administrators can manage:

* 📌 Announcement title
* 📝 Description
* 🏷️ Badge / tag
* 🔘 Button text
* 🔗 Button link
* 🟢 Active / inactive status
* 🪟 Popup visibility

The website automatically displays the selected active announcement through the announcement popup.

### 📌 Possible Announcement Types

The system can be used for:

* 🤖 AI Club Applications
* 💻 Hackathons
* 🎓 Workshops
* 📅 Events
* 📝 Registration notices
* 📢 Important club updates
* 🏆 Competitions
* 📣 Club announcements

### 💡 Benefit

The announcement system makes the website easier to maintain because administrators can change important announcements **without modifying the frontend code**.

---

## 📝 Application System

Students can apply to join the AI Club through the dedicated application portal.

### Application Route

`/apply`

The application system uses a structured **4-step application form** to collect relevant student information.

Submitted applications are stored in **MongoDB**.

Administrators can manage applications from:

**Admin Panel → Applications**

### Application Management

Administrators can:

* View applications
* Review applicant information
* Track application status
* Accept applicants
* Reject applicants
* Manage application records

### Application Flow

```text
Student
   │
   ▼
Application Form
   │
   ▼
Form Validation
   │
   ▼
Next.js API
   │
   ▼
MongoDB
   │
   ▼
Admin Dashboard
   │
   ├── Review
   ├── Accept
   └── Reject
```

---

## 👥 Team Management

The AI Club team can be managed dynamically through:

**Admin Panel → Team**

Team members can be added, updated, reordered, hidden, or removed without changing the frontend code.

### Team Information

Each team member can include:

* 👤 Name
* 💼 Role
* 🏢 Department
* 🎓 Course
* 📝 Bio
* 📧 Email
* 🐙 GitHub
* 💼 LinkedIn
* 🖼️ Profile photo
* 👁️ Visibility
* ↕️ Display order

This allows the public **Home, About, and Team sections** to stay synchronized with the latest club structure.

---

## 📅 Event Management

The Events section provides a complete system for organizing and displaying AI Club activities.

### Event Features

* 📅 Upcoming events
* 📖 Event details
* 📝 Event registration
* 🔎 Event filtering
* 🗂️ Past events
* 🖼️ Event gallery

Events can be managed through:

**Admin Panel → Events**

Administrators can add and update event information, while the public Events page dynamically displays the available content.

### Event Flow

```text
Admin
  │
  ▼
Create Event
  │
  ▼
MongoDB
  │
  ▼
Public Events Page
  │
  ├── Event Details
  ├── Registration
  └── Gallery
```

---

## 🚀 Project Showcase

The Projects section showcases AI/ML projects developed by club members.

It provides a centralized portfolio for student innovations and technical work.

### Project Features

* 🔎 Project search
* 🏷️ Category filtering
* 📄 Project details
* 🐙 GitHub repository links
* 🌐 Live demo links

Projects are managed through:

**Admin Panel → Projects**

Administrators can add, edit, update, or remove project information.

---

## 📚 Resources

The Resources section provides learning materials for AI Club members.

Resources can be organized into categories and managed through:

**Admin Panel → Resources**

### Resource Categories

Resources may include:

* 🤖 Artificial Intelligence
* 🧠 Machine Learning
* 💻 Programming
* 📊 Data Science
* 🌐 Web Development
* 🛠️ Developer Tools
* 📖 Tutorials
* 🎓 Learning Materials

The platform also supports **member-gated resources**, allowing selected materials to be restricted to club members.

---

## 💬 Contact & Messages

Visitors can contact the AI Club through:

`/contact`

Submitted messages are stored in **MongoDB**.

Administrators can access and manage these messages through:

**Admin Panel → Messages**

### Possible Uses

The contact system can handle:

* General queries
* Suggestions
* Collaboration requests
* Event-related questions
* Project inquiries
* Club-related communication

---

## 📊 Dashboard

The Admin Dashboard acts as the central control center of the platform.

It provides administrators with an overview of the website and its activity.

### Dashboard Information

Administrators can monitor:

* 📝 Applications
* 👥 Team members
* 📅 Events
* 🚀 Projects
* 📚 Resources
* 💬 Messages
* 📢 Announcements

The dashboard provides a centralized view of the club's digital operations.

---

## 🛠️ Technology Stack

### Frontend

| Technology        | Purpose                                      |
| ----------------- | -------------------------------------------- |
| **Next.js 15**    | React framework and application architecture |
| **React**         | Frontend UI                                  |
| **TypeScript**    | Type-safe development                        |
| **Tailwind CSS**  | Styling and responsive design                |
| **Lucide React**  | Icons                                        |
| **Space Grotesk** | Primary typography                           |
| **Syne**          | Display typography                           |

### Backend & Database

| Technology             | Purpose        |
| ---------------------- | -------------- |
| **Next.js API Routes** | Backend API    |
| **MongoDB**            | Database       |
| **Mongoose**           | MongoDB ODM    |
| **NextAuth.js**        | Authentication |

### Deployment

| Technology | Purpose                |
| ---------- | ---------------------- |
| **Vercel** | Hosting and deployment |
| **GitHub** | Source code management |

---

## 📁 Project Structure

```text
ai-club/
│
├── app/
│   ├── (public)/                 # Public website pages
│   │
│   ├── admin/                    # Admin dashboard
│   │   ├── dashboard/
│   │   ├── applications/
│   │   ├── announcements/
│   │   ├── events/
│   │   ├── projects/
│   │   ├── resources/
│   │   ├── messages/
│   │   ├── team/
│   │   └── settings/
│   │
│   ├── api/                      # REST API routes
│   │   ├── announcements/
│   │   ├── applications/
│   │   ├── events/
│   │   ├── projects/
│   │   ├── resources/
│   │   ├── messages/
│   │   └── team/
│   │
│   └── login/                    # Admin authentication
│
├── components/
│   ├── layout/                   # Navbar, Footer, etc.
│   ├── ui/                       # Reusable UI components
│   └── AnnouncementPopup.tsx     # Database-driven popup
│
├── lib/
│   ├── api.ts                    # Frontend API helpers
│   └── db.ts                     # MongoDB connection
│
├── models/
│   └── index.ts                  # Mongoose schemas/models
│
├── public/
│   └── ai-club-logo.png          # AI Club logo
│
├── .env.example                  # Environment variable template
├── package.json                  # Project dependencies and scripts
└── README.md                     # Project documentation
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory.

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=your_application_url
```

> ⚠️ **Never commit `.env.local` or sensitive credentials to GitHub.**

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-club
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file:

```text
.env.local
```

Then add the required environment variables.

Example:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

## 🌍 Deployment

The project is designed to be deployed on **Vercel**.

### Deployment Flow

```text
        GitHub
           │
           ▼
       Repository
           │
           ▼
         Vercel
           │
           ├──────────────┐
           ▼              ▼
    Environment       Production
     Variables          Build
           │              │
           └──────┬───────┘
                  ▼
             Live Website
```

Before deployment, configure:

* `MONGODB_URI`
* `NEXTAUTH_SECRET`
* `NEXTAUTH_URL`

in the Vercel project settings.

---

## 🔒 Security

The platform includes several mechanisms for protecting administrative functionality:

* 🔐 Admin authentication
* 🛡️ Protected admin routes
* 🔑 Environment-based secrets
* 🗄️ Database-backed data management
* 🚫 Separation of public and administrative functionality

> **Production deployments should use strong secrets, secure database credentials, and appropriate access controls.**

---

## 🔄 Data Flow

The overall application architecture follows a database-driven approach.

```text
                    ┌─────────────────┐
                    │  Public Website │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Next.js / API  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     MongoDB     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Admin Dashboard│
                    └─────────────────┘
```

This architecture allows website content to be updated dynamically through the Admin Panel.

---

## 🎯 Project Goals

The AI Club Website is designed to:

* 🌐 Build a strong digital presence for the AI Club
* 🤖 Provide students with a centralized platform for AI/ML activities
* 📝 Simplify club membership applications
* 🚀 Showcase student projects and achievements
* 📅 Promote workshops, hackathons, and events
* 📚 Provide learning resources to members
* ⚙️ Reduce manual content management
* 🔐 Give administrators complete control through a centralized dashboard

---

## 💡 Why This Platform?

Traditional club websites often require developers to manually update content whenever an event, team member, announcement, or project changes.

This platform solves that problem by introducing a **centralized content management system**.

### Traditional Approach

```text
Content Change
      ↓
Developer
      ↓
Modify Code
      ↓
Build
      ↓
Deploy
      ↓
Website Updated
```

### AI Club Website Approach

```text
Content Change
      ↓
Admin Dashboard
      ↓
Database
      ↓
Website Automatically Updated
```

This makes the platform more **scalable, maintainable, and practical for long-term club operations**.

---

## 🔮 Future Enhancements

Potential future improvements include:

* 📧 Automated email notifications
* 🏆 Member achievement and certificate system
* 📊 Advanced analytics
* 🔔 Real-time notifications
* 👤 Student/member profiles
* 🎓 Learning progress tracking
* 🗓️ Calendar integration
* 📱 Progressive Web App (PWA)
* 🤖 AI-powered club assistant
* 📈 Advanced application analytics

---

## 📈 Scalability

The architecture is designed to support future expansion.

Additional modules can be integrated into the existing Admin Dashboard without fundamentally changing the public website.

Possible future modules include:

```text
Members
   │
Certificates
   │
Attendance
   │
Workshops
   │
Competitions
   │
Achievements
   │
Blogs
   │
Newsletter
   │
Analytics
```

---

## 🧪 Development

For development, use:

```bash
npm run dev
```

For a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

To check the project using the configured linter:

```bash
npm run lint
```

---

## 📋 Main Routes Summary

```text
PUBLIC
├── /
├── /about
├── /events
├── /projects
├── /resources
├── /contact
├── /apply
└── /login

ADMIN
├── /admin/dashboard
├── /admin/applications
├── /admin/announcements
├── /admin/events
├── /admin/projects
├── /admin/resources
├── /admin/messages
├── /admin/team
└── /admin/settings

API
├── /api/announcements
├── /api/applications
├── /api/events
├── /api/projects
├── /api/resources
├── /api/messages
└── /api/team
```

---

## 🤝 Contribution

This project is developed for the **AI Club** and its academic and community activities.

Future contributors can improve the platform by:

* Adding new features
* Improving accessibility
* Optimizing performance
* Improving UI/UX
* Fixing bugs
* Improving security
* Adding new administrative modules
* Enhancing documentation

---

## 👨‍💻 Developer

### **Irfan Ansari**

**Developer & Contributor**

Developed for the **AI Club** with the goal of creating a centralized digital platform for students interested in Artificial Intelligence, Machine Learning, and emerging technologies.

---

## 📄 License

This project is developed for the **AI Club** and its associated academic and community activities.

**All rights reserved unless otherwise specified.**

---

## 🤖 AI Club

### **Learn • Build • Innovate • Lead**

> Empowering students to explore Artificial Intelligence, build meaningful projects, collaborate with peers, and create the technology of tomorrow.

---

### ⭐ Built with passion for AI, technology, and innovation.
