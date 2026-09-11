import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  verifySessionToken,
  createSessionToken,
} from "@/lib/session";

import {
  User,
  UserActivityLog,
} from "@/models";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest
) {
  try {
    // ─────────────────────────────────────────
    // Get session
    // ─────────────────────────────────────────

    const token =
      req.cookies.get(
        SESSION_COOKIE
      )?.value;

    if (!token) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const session =
      verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        {
          error: "Invalid or expired session",
        },
        { status: 401 }
      );
    }

    // ─────────────────────────────────────────
    // Connect database
    // ─────────────────────────────────────────

    await connectDB();

    const user =
      await User.findById(
        session.id
      );

    if (!user) {
      return NextResponse.json(
        {
          error: "User account not found",
        },
        { status: 404 }
      );
    }

    // ─────────────────────────────────────────
    // Validate session version
    // ─────────────────────────────────────────

    const databaseSessionVersion =
      typeof user.sessionVersion ===
      "number"
        ? user.sessionVersion
        : 0;

    const sessionVersion =
      typeof session.sessionVersion ===
      "number"
        ? session.sessionVersion
        : 0;

    if (
      databaseSessionVersion !==
      sessionVersion
    ) {
      const response =
        NextResponse.json(
          {
            error:
              "Your session has expired. Please log in again.",
          },
          { status: 401 }
        );

      response.cookies.set(
        SESSION_COOKIE,
        "",
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV ===
            "production",
          sameSite: "lax",
          expires: new Date(0),
          path: "/",
        }
      );

      return response;
    }

    // ─────────────────────────────────────────
    // Read request body
    // ─────────────────────────────────────────

    const body =
      await req.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Name is required",
        },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          error:
            "Name must be at least 2 characters",
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          error:
            "Name cannot exceed 100 characters",
        },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────
    // No change
    // ─────────────────────────────────────────

    if (name === user.name) {
      return NextResponse.json({
        success: true,
        message:
          "No changes were made",
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          facultyPosition:
            user.facultyPosition ??
            null,
          permissions:
            user.role === "admin"
              ? {
                  dashboard: true,
                  applications: true,
                  announcements: true,
                  events: true,
                  projects: true,
                  resources: true,
                  messages: true,
                  team: true,
                  settings: true,
                }
              : user.permissions || {},
        },
      });
    }

    // ─────────────────────────────────────────
    // Store old value
    // ─────────────────────────────────────────

    const oldName = user.name;

    // ─────────────────────────────────────────
    // Update name
    // ─────────────────────────────────────────

    user.name = name;

    /*
     * Changing the name does not require
     * invalidating the session, but we still
     * refresh the session token so the new
     * name is immediately available.
     */
    await user.save();

    // ─────────────────────────────────────────
    // Activity log
    // ─────────────────────────────────────────

    await UserActivityLog.create({
      userId: user._id,
      action: "name_changed",
      description:
        "User changed their account name.",
      oldValue: oldName,
      newValue: name,
      changedBy: user._id,
      changedByType: "self",
    });

    // ─────────────────────────────────────────
    // Permissions
    // ─────────────────────────────────────────

    const permissions =
      user.role === "admin"
        ? {
            dashboard: true,
            applications: true,
            announcements: true,
            events: true,
            projects: true,
            resources: true,
            messages: true,
            team: true,
            settings: true,
          }
        : user.permissions || {};

    // ─────────────────────────────────────────
    // Refresh session
    // ─────────────────────────────────────────

    const newToken =
      createSessionToken({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        facultyPosition:
          user.facultyPosition ??
          null,
        permissions,
        sessionVersion:
          typeof user.sessionVersion ===
          "number"
            ? user.sessionVersion
            : 0,
      });

    // ─────────────────────────────────────────
    // Response
    // ─────────────────────────────────────────

    const response =
      NextResponse.json({
        success: true,
        message:
          "Name updated successfully",
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          facultyPosition:
            user.facultyPosition ??
            null,
          permissions,
          sessionVersion:
            typeof user.sessionVersion ===
            "number"
              ? user.sessionVersion
              : 0,
        },
      });

    response.cookies.set(
      SESSION_COOKIE,
      newToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
      }
    );

    return response;
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update profile",
      },
      { status: 500 }
    );
  }
}