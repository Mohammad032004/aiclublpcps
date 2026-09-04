export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Resource } from "@/models";
import mongoose from "mongoose";

type P = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: P) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    const body = await req.json();
    await connectDB();
    const resource = await Resource.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, resource });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}

export async function DELETE(_req: NextRequest, { params }: P) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    await connectDB();
    await Resource.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}
