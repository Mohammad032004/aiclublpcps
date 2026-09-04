export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Message } from "@/models";
import mongoose from "mongoose";

type P = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: P) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    const body = await req.json();
    await connectDB();
    const message = await Message.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, message });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}

export async function DELETE(_req: NextRequest, { params }: P) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    await connectDB();
    await Message.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}
