import mongoose, { Schema, model, models } from "mongoose";

// ─────────────────────────────────────────────
// User
// ─────────────────────────────────────────────

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
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

  role: {
    type: String,
    enum: ["admin", "core", "member"],
    default: "member",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User =
  models.User || model("User", UserSchema);


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

  // ───────── Team Leader / Main Registrant ─────────

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

  teamName: {
    type: String,
    trim: true,
  },

  // ───────── Other Team Members ─────────

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