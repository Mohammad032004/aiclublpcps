export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Member } from "@/models";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const role = searchParams.get("role");
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (role) query.role = role;
    const members = await Member.find(query).sort({ joinedAt: -1 }).lean();
    return NextResponse.json({ members, total: members.length });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.name || !body.email) return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    const existing = await Member.findOne({ email: body.email.toLowerCase() });
    if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    body.email = body.email.toLowerCase().trim();
    const member = new Member(body);
    await member.save();
    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}
