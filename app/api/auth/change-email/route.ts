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

    const newEmail = String(body.newEmail || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");

    if (!newEmail) {
      return NextResponse.json(
        { error: "New email address is required." },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required to change your email." },
        { status: 400 }
      );
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
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

    if (user.email.toLowerCase() === newEmail) {
      return NextResponse.json(
        {
          error:
            "The new email is the same as your current email.",
        },
        { status: 400 }
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Password is incorrect." },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      email: newEmail,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const oldEmail = user.email;

    user.email = newEmail;

    // Invalidate old sessions because the login identity changed.
    user.sessionVersion =
      databaseSessionVersion + 1;

    await user.save();

    await UserActivityLog.create({
      userId: user._id,
      action: "email_changed",
      description: "User changed their own email address.",
      oldValue: oldEmail,
      newValue: newEmail,
      changedBy: user._id,
      changedByType: "self",
    });

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
      message: "Email changed successfully.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
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
      "Change email error:",
      error
    );

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}