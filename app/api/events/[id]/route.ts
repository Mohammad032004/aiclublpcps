export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models";
import mongoose from "mongoose";

type P = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: P) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    await connectDB();
    const event = await Event.findById(id).lean();
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ event });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}

export async function PATCH(req: NextRequest, { params }: P) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    const body = await req.json();
    await connectDB();
    const event = await Event.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, event });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}

export async function DELETE(_req: NextRequest, { params }: P) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    await connectDB();
    await Event.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}
