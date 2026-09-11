import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  verifySessionToken,
} from "@/lib/session";
import { User, UserActivityLog } from "@/models";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "You are not authenticated." },
        { status: 401 }
      );
    }

    const session = verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        { error: "Your session has expired. Please log in again." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required." },
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: "New password is required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (
      confirmPassword &&
      newPassword !== confirmPassword
    ) {
      return NextResponse.json(
        { error: "New passwords do not match." },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          error:
            "New password must be different from your current password.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.id);

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    const databaseSessionVersion =
      typeof user.sessionVersion === "number"
        ? user.sessionVersion
        : 0;

    const sessionVersion =
      typeof session.sessionVersion === "number"
        ? session.sessionVersion
        : 0;

    if (databaseSessionVersion !== sessionVersion) {
      const response = NextResponse.json(
        {
          error:
            "Your session is no longer valid. Please log in again.",
        },
        { status: 401 }
      );

      response.cookies.set({
        name: SESSION_COOKIE,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });

      return response;
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    user.password = hashedPassword;

    // Invalidate all existing sessions using the old password.
    user.sessionVersion =
      databaseSessionVersion + 1;

    await user.save();

    await UserActivityLog.create({
      userId: user._id,
      action: "password_changed",
      description: "User changed their own password.",
      changedBy: user._id,
      changedByType: "self",
    });

    // Create a fresh session for the current browser.
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
        : {
            dashboard: user.permissions?.dashboard === true,
            applications:
              user.permissions?.applications === true,
            announcements:
              user.permissions?.announcements === true,
            events: user.permissions?.events === true,
            projects:
              user.permissions?.projects === true,
            resources:
              user.permissions?.resources === true,
            messages:
              user.permissions?.messages === true,
            team: user.permissions?.team === true,
            settings:
              user.permissions?.settings === true,
          };

    const newToken = createSessionToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      facultyPosition:
        user.facultyPosition ?? null,
      permissions,
      sessionVersion: user.sessionVersion,
    });

    const response = NextResponse.json({
      success: true,
      message: "Password changed successfully.",
    });

    response.cookies.set({
      name: SESSION_COOKIE,
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}