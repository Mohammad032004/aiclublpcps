export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, currentPassword, newPassword } = await req.json();
    if (!email || !currentPassword || !newPassword) return NextResponse.json({ error: "All fields required" }, { status: 400 });
    if (newPassword.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    const hashed = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(user._id, { password: hashed });
    return NextResponse.json({ success: true });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}
