export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

type P = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: P) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    const body = await req.json();
    await connectDB();
    const update: Record<string, unknown> = {};
    if (body.name) update.name = body.name;
    if (body.email) update.email = body.email.toLowerCase().trim();
    if (body.role) update.role = body.role;
    if (body.newPassword) {
      if (body.newPassword.length < 8) return NextResponse.json({ error: "Password min 8 chars" }, { status: 400 });
      update.password = await bcrypt.hash(body.newPassword, 12);
    }
    const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true, select: "-password" });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, user });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}

export async function DELETE(_req: NextRequest, { params }: P) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    await connectDB();
    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}
