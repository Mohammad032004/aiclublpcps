export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: { id: session.id, name: session.name, email: session.email, role: session.role } });
}
