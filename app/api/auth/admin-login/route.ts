export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import bcrypt from "bcryptjs";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = createSessionToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
