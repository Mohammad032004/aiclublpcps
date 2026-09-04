export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Application } from "@/models";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query: Record<string, unknown> = {};
    if (status && status !== "all") query.status = status;
    const applications = await Application.find(query).sort({ submittedAt: -1 }).lean();
    return NextResponse.json({ applications, total: applications.length });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.firstName || !body.email) return NextResponse.json({ error: "First name and email required" }, { status: 400 });
    const application = new Application(body);
    await application.save();
    return NextResponse.json({ success: true, id: application._id }, { status: 201 });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}
