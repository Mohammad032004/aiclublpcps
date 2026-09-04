export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { currentEmail, newEmail, password } = await req.json();
    if (!currentEmail || !newEmail || !password) return NextResponse.json({ error: "All fields required" }, { status: 400 });
    const user = await User.findOne({ email: currentEmail.toLowerCase().trim() });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "Password is incorrect" }, { status: 401 });
    const exists = await User.findOne({ email: newEmail.toLowerCase().trim() });
    if (exists && exists._id.toString() !== user._id.toString()) return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    await User.findByIdAndUpdate(user._id, { email: newEmail.toLowerCase().trim() });
    return NextResponse.json({ success: true });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}
