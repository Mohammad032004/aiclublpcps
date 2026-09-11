import mongoose, { Schema, model, models } from "mongoose";

// ─────────────────────────────────────────────
// User
// Admin Panel Login Users
// ─────────────────────────────────────────────

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  // ─────────────────────────────────────────
  // Session Version
  // Increment this when password/email/security
  // credentials change to invalidate old sessions.
  // ─────────────────────────────────────────

  sessionVersion: {
    type: Number,
    default: 0,
  },

  // ─────────────────────────────────────────
  // Admin Panel Role
  // ─────────────────────────────────────────

  role: {
    type: String,
    enum: ["admin", "faculty", "core", "member"],
    default: "member",
  },

  // ─────────────────────────────────────────
  // Faculty Position
  // Only applicable when role = faculty
  // ─────────────────────────────────────────

  facultyPosition: {
    type: String,
    enum: ["faculty_head", "club_instructor", null],
    default: null,
  },

  // ─────────────────────────────────────────
  // Individual Permissions
  // ─────────────────────────────────────────

  permissions: {
    dashboard: {
      type: Boolean,
      default: false,
    },

    applications: {
      type: Boolean,
      default: false,
    },

    announcements: {
      type: Boolean,
      default: false,
    },

    events: {
      type: Boolean,
      default: false,
    },

    projects: {
      type: Boolean,
      default: false,
    },

    resources: {
      type: Boolean,
      default: false,
    },

    messages: {
      type: Boolean,
      default: false,
    },

    team: {
      type: Boolean,
      default: false,
    },

    settings: {
      type: Boolean,
      default: false,
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User =
  models.User || model("User", UserSchema);


// ─────────────────────────────────────────────
// User Activity Log
// Tracks account and administrative changes.
// IMPORTANT:
// Never store actual password values here.
// ─────────────────────────────────────────────

const UserActivityLogSchema = new Schema(
  {
    // User whose account was affected
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ─────────────────────────────────────────
    // Activity Type
    // ─────────────────────────────────────────

    action: {
      type: String,
      enum: [
        "account_created",

        "name_changed",
        "email_changed",
        "password_changed",

        "role_changed",
        "permissions_changed",
        "faculty_position_changed",

        "admin_name_changed",
        "admin_email_changed",
        "admin_password_reset",
        "admin_role_changed",
        "admin_permissions_changed",
        "admin_faculty_position_changed",

        "account_deleted",
      ],
      required: true,
      index: true,
    },

    // Human-readable explanation
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Previous value.
    // Never use this for storing passwords.
    oldValue: {
      type: String,
      default: undefined,
    },

    // New value.
    // Never use this for storing passwords.
    newValue: {
      type: String,
      default: undefined,
    },

    // User who performed the action
    // This may be the same user for self-service
    // changes or an admin for administrative changes.
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Whether the change was performed by
    // the account owner or an administrator.
    changedByType: {
      type: String,
      enum: ["self", "admin"],
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  }
);

export const UserActivityLog =
  models.UserActivityLog ||
  model("UserActivityLog", UserActivityLogSchema);


// ─────────────────────────────────────────────
// Member
// ─────────────────────────────────────────────

const MemberSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  phone: String,

  branch: String,

  year: String,

  role: {
    type: String,
    enum: ["admin", "core", "member"],
    default: "member",
  },

  status: {
    type: String,
    enum: ["active", "inactive", "alumni"],
    default: "active",
  },

  github: String,

  linkedin: String,

  joinedAt: {
    type: Date,
    default: Date.now,
  },

  bio: String,

  skills: [String],

  domains: [String],

  showOnAbout: {
    type: Boolean,
    default: true,
  },
});

export const Member =
  models.Member || model("Member", MemberSchema);


// ─────────────────────────────────────────────
// Team Member
// ─────────────────────────────────────────────

const TeamMemberSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    required: true,
  },

  tier: {
    type: String,
    enum: ["faculty", "leadership", "core", "member"],
    required: true,
  },

  department: String,

  course: String,

  bio: String,

  email: String,

  github: String,

  linkedin: String,

  photo: String,

  visible: {
    type: Boolean,
    default: true,
  },

  order: {
    type: Number,
    default: 0,
  },
});

export const TeamMember =
  models.TeamMember || model("TeamMember", TeamMemberSchema);


// ─────────────────────────────────────────────
// Application
// ─────────────────────────────────────────────

const ApplicationSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  phone: String,

  gender: String,

  github: String,

  linkedin: String,

  college: String,

  branch: String,

  year: String,

  cgpa: Number,

  certifications: String,

  skills: [String],

  domains: [String],

  experience: String,

  projectDesc: String,

  whyJoin: String,

  contribution: String,

  goals: String,

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },

  submittedAt: {
    type: Date,
    default: Date.now,
  },

  reviewedAt: Date,

  reviewNote: String,
});

export const Application =
  models.Application || model("Application", ApplicationSchema);


// ─────────────────────────────────────────────
// Event
// ─────────────────────────────────────────────

const EventSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: [
      "workshop",
      "hackathon",
      "talk",
      "meetup",
      "competition",
    ],
    required: true,
  },

  description: String,

  date: Date,

  location: String,

  // ─────────────────────────────────────────
  // College / Organization hosting the event
  // ─────────────────────────────────────────

  college: {
    type: String,
    trim: true,
    default: "",
  },

  // ─────────────────────────────────────────
  // Participant College Requirement
  // ─────────────────────────────────────────

  requireCollege: {
    type: Boolean,
    default: false,
  },

  maxAttendees: Number,

  status: {
    type: String,
    enum: [
      "upcoming",
      "ongoing",
      "past",
      "cancelled",
    ],
    default: "upcoming",
  },

  registrationOpen: {
    type: Boolean,
    default: true,
  },

  tags: [String],

  formFields: [
    {
      id: String,
      label: String,
      type: String,
      required: Boolean,
      options: [String],
      order: Number,
    },
  ],

  allowTeams: {
    type: Boolean,
    default: false,
  },

  maxTeamSize: {
    type: Number,
    default: 4,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Event =
  models.Event || model("Event", EventSchema);


// ─────────────────────────────────────────────
// Event Registration
// ─────────────────────────────────────────────

const EventRegistrationSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },

  // ─────────────────────────────────────────
  // Team Leader / Main Registrant
  // ─────────────────────────────────────────

  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },

  phone: {
    type: String,
    trim: true,
  },

  branch: {
    type: String,
    trim: true,
  },

  year: {
    type: String,
    trim: true,
  },

  // Participant's college / organization
  college: {
    type: String,
    trim: true,
  },

  teamName: {
    type: String,
    trim: true,
  },

  // ─────────────────────────────────────────
  // Other Team Members
  // ─────────────────────────────────────────

  teamMembers: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      branch: {
        type: String,
        required: true,
        trim: true,
      },

      year: {
        type: String,
        required: true,
        trim: true,
      },
    },
  ],

  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

export const EventRegistration =
  models.EventRegistration ||
  model("EventRegistration", EventRegistrationSchema);


// ─────────────────────────────────────────────
// Project
// ─────────────────────────────────────────────

const ProjectSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    required: true,
  },

  tags: [String],

  github: String,

  liveDemo: String,

  builtBy: [String],

  year: Number,

  featured: {
    type: Boolean,
    default: false,
  },

  visible: {
    type: Boolean,
    default: true,
  },

  award: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Project =
  models.Project || model("Project", ProjectSchema);


// ─────────────────────────────────────────────
// Resource
// ─────────────────────────────────────────────

const ResourceSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: String,

  category: {
    type: String,
    enum: [
      "ai_ml",
      "web_dev",
      "cybersecurity",
      "research",
      "career",
    ],
    required: true,
  },

  type: {
    type: String,
    enum: [
      "pdf",
      "video",
      "guide",
      "notebook",
      "link",
    ],
    required: true,
  },

  url: String,

  fileSize: String,

  access: {
  type: String,
  enum: ["public", "members"],
  default: "members",
},

views: {
  type: Number,
  default: 0,
},

downloads: {
  type: Number,
  default: 0,
},
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Resource =
  models.Resource || model("Resource", ResourceSchema);


// ─────────────────────────────────────────────
// Message
// ─────────────────────────────────────────────

const MessageSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  subject: {
    type: String,
    required: true,
  },

  message: {
    type: String,
    required: true,
  },

  read: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Message =
  models.Message || model("Message", MessageSchema);


// ─────────────────────────────────────────────
// Announcement
// ─────────────────────────────────────────────

const AnnouncementSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    required: true,
    trim: true,
  },

  badge: {
    type: String,
    default: "Announcement",
    trim: true,
  },

  buttonText: {
    type: String,
    default: "Learn More",
    trim: true,
  },

  buttonLink: {
    type: String,
    default: "/",
    trim: true,
  },

  active: {
    type: Boolean,
    default: true,
  },

  showPopup: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Announcement =
  models.Announcement ||
  model("Announcement", AnnouncementSchema);