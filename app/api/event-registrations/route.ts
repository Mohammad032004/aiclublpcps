export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { EventRegistration } from "@/models";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.eventId || !body.name || !body.email) return NextResponse.json({ error: "eventId, name, email required" }, { status: 400 });
    const reg = new EventRegistration(body);
    await reg.save();
    return NextResponse.json({ success: true, id: reg._id }, { status: 201 });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}
