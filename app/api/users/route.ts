import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────
// Permission Type
// ─────────────────────────────────────────────

const PERMISSION_KEYS = [
  "dashboard",
  "applications",
  "announcements",
  "events",
  "projects",
  "resources",
  "messages",
  "team",
  "settings",
] as const;

type PermissionKey = (typeof PERMISSION_KEYS)[number];

type Permissions = Record<PermissionKey, boolean>;

const DEFAULT_PERMISSIONS: Permissions = {
  dashboard: true,
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
// GET — Get all admin users
// ─────────────────────────────────────────────

export async function GET() {
  try {
    await connectDB();

    const users = await User.find(
      {},
      { password: 0 }
    )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Server error",
      },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// POST — Create admin user
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    await connectDB();

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
    // Basic validation
    // ─────────────────────────────────────────

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error:
            "Name, email and password required",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────
    // Validate role
    // ─────────────────────────────────────────

    const allowedRoles = [
      "admin",
      "faculty",
      "core",
      "member",
    ];

    const selectedRole =
      allowedRoles.includes(role) ? role : "member";

    // ─────────────────────────────────────────
    // Validate faculty position
    // ─────────────────────────────────────────

    let selectedFacultyPosition = null;

    if (selectedRole === "faculty") {
      if (
        facultyPosition === "faculty_head" ||
        facultyPosition === "club_instructor"
      ) {
        selectedFacultyPosition = facultyPosition;
      }
    }

    // ─────────────────────────────────────────
    // Check duplicate email
    // ─────────────────────────────────────────

    const normalizedEmail =
      email.toLowerCase().trim();

    const exists = await User.findOne({
      email: normalizedEmail,
    });

    if (exists) {
      return NextResponse.json(
        {
          error: "Email already exists",
        },
        { status: 409 }
      );
    }

    // ─────────────────────────────────────────
    // Prepare permissions
    // ─────────────────────────────────────────

    const finalPermissions: Permissions = {
      ...DEFAULT_PERMISSIONS,
    };

    if (
      permissions &&
      typeof permissions === "object"
    ) {
      for (const key of PERMISSION_KEYS) {
        if (typeof permissions[key] === "boolean") {
          finalPermissions[key] = permissions[key];
        }
      }
    }

    // Admin always gets everything
    if (selectedRole === "admin") {
      for (const key of PERMISSION_KEYS) {
        finalPermissions[key] = true;
      }
    }

    // Dashboard should always be available
    finalPermissions.dashboard = true;

    // ─────────────────────────────────────────
    // Hash password
    // ─────────────────────────────────────────

    const hashed = await bcrypt.hash(
      password,
      12
    );

    // ─────────────────────────────────────────
    // Create user
    // ─────────────────────────────────────────

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      role: selectedRole,
      facultyPosition: selectedFacultyPosition,
      permissions: finalPermissions,
    });

    await user.save();

    // ─────────────────────────────────────────
    // Response
    // ─────────────────────────────────────────

    return NextResponse.json(
      {
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          facultyPosition:
            user.facultyPosition,
          permissions:
            user.permissions,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Server error",
      },
      { status: 500 }
    );
  }
}