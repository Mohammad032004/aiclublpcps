export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query: Record<string, unknown> = {};
    if (status && status !== "all") query.status = status;
    const events = await Event.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ events });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    const event = new Event(body);
    await event.save();
    return NextResponse.json({ success: true, id: event._id, event }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
