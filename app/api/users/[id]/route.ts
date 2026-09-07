import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

type PermissionKey =
  (typeof PERMISSION_KEYS)[number];

type Permissions = Record<
  PermissionKey,
  boolean
>;

// ─────────────────────────────────────────────
// PATCH — Update user
// ─────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    // ─────────────────────────────────────────
    // Validate ID
    // ─────────────────────────────────────────

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: "Invalid ID",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    await connectDB();

    // ─────────────────────────────────────────
    // Build update object
    // ─────────────────────────────────────────

    const update: Record<
      string,
      unknown
    > = {};

    if (
      typeof body.name === "string" &&
      body.name.trim()
    ) {
      update.name = body.name.trim();
    }

    if (
      typeof body.email === "string" &&
      body.email.trim()
    ) {
      update.email =
        body.email.toLowerCase().trim();
    }

    // ─────────────────────────────────────────
    // Role
    // ─────────────────────────────────────────

    const allowedRoles = [
      "admin",
      "faculty",
      "core",
      "member",
    ];

    if (
      typeof body.role === "string" &&
      allowedRoles.includes(body.role)
    ) {
      update.role = body.role;
    }

    // ─────────────────────────────────────────
    // Faculty Position
    // ─────────────────────────────────────────

    const effectiveRole =
      body.role || undefined;

    if (effectiveRole === "faculty") {
      if (
        body.facultyPosition ===
          "faculty_head" ||
        body.facultyPosition ===
          "club_instructor"
      ) {
        update.facultyPosition =
          body.facultyPosition;
      } else {
        update.facultyPosition = null;
      }
    } else if (
      effectiveRole &&
      effectiveRole !== "faculty"
    ) {
      update.facultyPosition = null;
    } else if (
      body.facultyPosition ===
        "faculty_head" ||
      body.facultyPosition ===
        "club_instructor"
    ) {
      update.facultyPosition =
        body.facultyPosition;
    }

    // ─────────────────────────────────────────
    // Permissions
    // ─────────────────────────────────────────

    if (
      body.permissions &&
      typeof body.permissions === "object"
    ) {
      const permissions: Partial<Permissions> =
        {};

      for (const key of PERMISSION_KEYS) {
        if (
          typeof body.permissions[key] ===
          "boolean"
        ) {
          permissions[key] =
            body.permissions[key];
        }
      }

      // Dashboard always available
      permissions.dashboard = true;

      update.permissions = permissions;
    }

    // ─────────────────────────────────────────
    // Admin always has full permissions
    // ─────────────────────────────────────────

    if (body.role === "admin") {
      update.permissions = {
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

      update.facultyPosition = null;
    }

    // ─────────────────────────────────────────
    // Password
    // ─────────────────────────────────────────

    if (body.newPassword) {
      if (
        typeof body.newPassword !== "string" ||
        body.newPassword.length < 8
      ) {
        return NextResponse.json(
          {
            error:
              "Password must be at least 8 characters",
          },
          { status: 400 }
        );
      }

      update.password =
        await bcrypt.hash(
          body.newPassword,
          12
        );
    }

    // ─────────────────────────────────────────
    // Update user
    // ─────────────────────────────────────────

    const user =
      await User.findByIdAndUpdate(
        id,
        {
          $set: update,
        },
        {
          new: true,
          runValidators: true,
          select: "-password",
        }
      );

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
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
// DELETE — Delete user
// ─────────────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    // ─────────────────────────────────────────
    // Validate ID
    // ─────────────────────────────────────────

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: "Invalid ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user =
      await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
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