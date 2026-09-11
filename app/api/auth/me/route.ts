export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

import {
  verifySessionToken,
  SESSION_COOKIE,
} from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const token =
      req.cookies.get(SESSION_COOKIE)?.value;

    // No session cookie
    if (!token) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }

    const session =
      verifySessionToken(token);

    // Invalid or expired session
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
        facultyPosition:
          session.facultyPosition ?? null,
        permissions:
          session.permissions ?? {},
      },
    });
  } catch (error) {
    console.error(
      "Auth me error:",
      error
    );

    return NextResponse.json(
      { user: null },
      { status: 401 }
    );
  }
}