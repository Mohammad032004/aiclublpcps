export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Message } from "@/models";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const readParam = searchParams.get("read");
    const query: Record<string, unknown> = {};
    if (readParam !== null) query.read = readParam === "true";
    const messages = await Message.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ messages, total: messages.length });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.name || !body.email || !body.subject || !body.message)
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    const msg = new Message(body);
    await msg.save();
    return NextResponse.json({ success: true, id: msg._id }, { status: 201 });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}
