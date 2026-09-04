export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Resource } from "@/models";

export async function GET(_req: NextRequest) {
  try {
    await connectDB();
    const resources = await Resource.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ resources });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.title) return NextResponse.json({ error: "Title required" }, { status: 400 });
    const resource = new Resource(body);
    await resource.save();
    return NextResponse.json({ success: true, id: resource._id, resource }, { status: 201 });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}
