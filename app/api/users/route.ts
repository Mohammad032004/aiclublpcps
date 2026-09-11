import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { User, UserActivityLog } from "@/models";


// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Role = "admin" | "faculty" | "core" | "member";

type Permissions = {
  dashboard: boolean;
  applications: boolean;
  announcements: boolean;
  events: boolean;
  projects: boolean;
  resources: boolean;
  messages: boolean;
  team: boolean;
  settings: boolean;
};


// ─────────────────────────────────────────────
// Default Permissions
//
// IMPORTANT:
// Dashboard is NOT automatically enabled.
// Admin can choose which permissions the user gets.
// ─────────────────────────────────────────────

const DEFAULT_PERMISSIONS: Permissions = {
  dashboard: false,
  applications: false,
  announcements: false,
  events: false,
  projects: false,
  resources: false,
  messages: false,
  team: false,
  settings: false,
};


// ─────────────────────────────────────────────
// All Admin Permissions
//
// Admin users automatically receive access to
// every admin section.
// ─────────────────────────────────────────────

const ADMIN_PERMISSIONS: Permissions = {
  dashboard: true,
  applications: true,
  announcements: true,
  events: true,
  projects: true,
  resources: true,
  messages: true,
  team: true,
  settings: true,
};


// ─────────────────────────────────────────────
// GET
// Get all admin panel users
//
// Only administrators can access this endpoint.
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    // ─────────────────────────────────────────
    // Admin Authentication
    // ─────────────────────────────────────────

    const { user, response } = await requireAdmin(req);

    if (response) {
      return response;
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    // ─────────────────────────────────────────
    // Fetch Users
    //
    // Password is explicitly excluded.
    // ─────────────────────────────────────────

    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GET /api/users error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
      },
      {
        status: 500,
      }
    );
  }
}


// ─────────────────────────────────────────────
// POST
// Create a new admin panel user
//
// Only administrators can create users.
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ─────────────────────────────────────────
    // Admin Authentication
    // ─────────────────────────────────────────

    const { user: admin, response } = await requireAdmin(req);

    if (response) {
      return response;
    }

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    // ─────────────────────────────────────────
    // Read Request Body
    // ─────────────────────────────────────────

    const body = await req.json();

    const {
      name,
      email,
      password,
      role,
      facultyPosition,
      permissions,
    } = body;


    // ─────────────────────────────────────────
    // Basic Validation
    // ─────────────────────────────────────────

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Name is required",
        },
        {
          status: 400,
        }
      );
    }


    if (
      typeof email !== "string" ||
      !email.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Email is required",
        },
        {
          status: 400,
        }
      );
    }


    if (
      typeof password !== "string" ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Password is required",
        },
        {
          status: 400,
        }
      );
    }


    // ─────────────────────────────────────────
    // Password Length
    // ─────────────────────────────────────────

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters long",
        },
        {
          status: 400,
        }
      );
    }


    // ─────────────────────────────────────────
    // Normalize Email
    // ─────────────────────────────────────────

    const normalizedEmail =
      email.trim().toLowerCase();


    // ─────────────────────────────────────────
    // Validate Role
    // ─────────────────────────────────────────

    const validRoles: Role[] = [
      "admin",
      "faculty",
      "core",
      "member",
    ];

    const selectedRole: Role =
      validRoles.includes(role)
        ? role
        : "member";


    // ─────────────────────────────────────────
    // Faculty Position
    //
    // Faculty position only applies to faculty.
    // ─────────────────────────────────────────

    let finalFacultyPosition:
      | "faculty_head"
      | "club_instructor"
      | null = null;

    if (selectedRole === "faculty") {
      if (
        facultyPosition === "faculty_head" ||
        facultyPosition === "club_instructor"
      ) {
        finalFacultyPosition =
          facultyPosition;
      }
    }


    // ─────────────────────────────────────────
    // Check Duplicate Email
    // ─────────────────────────────────────────

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "A user with this email already exists",
        },
        {
          status: 409,
        }
      );
    }


    // ─────────────────────────────────────────────
    // Build Permissions
    // ─────────────────────────────────────────────

    let finalPermissions: Permissions = {
      ...DEFAULT_PERMISSIONS,
    };


    // ─────────────────────────────────────────
    // Admin
    //
    // Admin automatically receives all permissions.
    // ─────────────────────────────────────────

    if (selectedRole === "admin") {
      finalPermissions = {
        ...ADMIN_PERMISSIONS,
      };
    } else if (
      permissions &&
      typeof permissions === "object"
    ) {
      finalPermissions = {
        dashboard:
          permissions.dashboard === true,

        applications:
          permissions.applications === true,

        announcements:
          permissions.announcements === true,

        events:
          permissions.events === true,

        projects:
          permissions.projects === true,

        resources:
          permissions.resources === true,

        messages:
          permissions.messages === true,

        team:
          permissions.team === true,

        settings:
          permissions.settings === true,
      };
    }


    // ─────────────────────────────────────────
    // Hash Password
    // ─────────────────────────────────────────

    const hashedPassword =
      await bcrypt.hash(password, 12);


    // ─────────────────────────────────────────
    // Create User
    // ─────────────────────────────────────────

    const newUser = await User.create({
      name: name.trim(),

      email: normalizedEmail,

      password: hashedPassword,

      sessionVersion: 0,

      role: selectedRole,

      facultyPosition:
        finalFacultyPosition,

      permissions: finalPermissions,
    });


    // ─────────────────────────────────────────
    // Activity Log
    //
    // Password is NEVER stored.
    // ─────────────────────────────────────────

    await UserActivityLog.create({
      userId: newUser._id,

      action: "account_created",

      description:
        `Account created by administrator ${admin.name}.`,

      changedBy: admin._id,

      changedByType: "admin",
    });


    // ─────────────────────────────────────────
    // Safe User Response
    //
    // Never return password.
    // ─────────────────────────────────────────

    const safeUser = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      facultyPosition:
        newUser.facultyPosition,
      permissions:
        newUser.permissions,
      sessionVersion:
        newUser.sessionVersion,
      createdAt:
        newUser.createdAt,
    };


    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: safeUser,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error("POST /api/users error:", error);

    // ─────────────────────────────────────────
    // MongoDB Duplicate Key Protection
    // ─────────────────────────────────────────

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: "A user with this email already exists",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user",
      },
      {
        status: 500,
      }
    );
  }
}