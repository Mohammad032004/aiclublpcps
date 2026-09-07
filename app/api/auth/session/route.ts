export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

import {
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE)?.value;

    const session = verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        facultyPosition: session.facultyPosition ?? null,
        permissions: session.permissions ?? {
          dashboard: true,
          applications: false,
          announcements: false,
          events: false,
          projects: false,
          resources: false,
          messages: false,
          team: false,
          settings: false,
        },
      },
    });
  } catch (error) {
    console.error("Session error:", error);

    return NextResponse.json(
      { user: null },
      { status: 401 }
    );
  }
}