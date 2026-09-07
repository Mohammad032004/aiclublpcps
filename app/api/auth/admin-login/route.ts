export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { User } from "@/models";
import bcrypt from "bcryptjs";

import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).lean();

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Admin always receives full permissions.
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
            dashboard: true,
            applications: Boolean(user.permissions?.applications),
            announcements: Boolean(user.permissions?.announcements),
            events: Boolean(user.permissions?.events),
            projects: Boolean(user.permissions?.projects),
            resources: Boolean(user.permissions?.resources),
            messages: Boolean(user.permissions?.messages),
            team: Boolean(user.permissions?.team),
            settings: Boolean(user.permissions?.settings),
          };

    const sessionToken = createSessionToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      facultyPosition: user.facultyPosition ?? null,
      permissions,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        facultyPosition: user.facultyPosition ?? null,
        permissions,
      },
    });

    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}