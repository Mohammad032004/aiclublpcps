import { NextRequest, NextResponse } from "next/server";

import {
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest
) {
  try {
    const token = req.cookies.get(
      SESSION_COOKIE
    )?.value;

    const session =
      verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        {
          user: null,
        },
        {
          status: 401,
        }
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
  } catch {
    return NextResponse.json(
      {
        user: null,
      },
      {
        status: 401,
      }
    );
  }
}