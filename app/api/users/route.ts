export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ users });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, password, role } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: "Name, email and password required" }, { status: 400 });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    const hashed = await bcrypt.hash(password, 12);
    const user = new User({ name, email: email.toLowerCase().trim(), password: hashed, role: role || "member" });
    await user.save();
    return NextResponse.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}
