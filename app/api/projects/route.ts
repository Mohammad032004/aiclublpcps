export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Project } from "@/models";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const adminView = searchParams.get("admin") === "true";
    const query: Record<string, unknown> = {};
    if (!adminView) query.visible = true;
    const projects = await Project.find(query).sort({ featured: -1, createdAt: -1 }).lean();
    return NextResponse.json({ projects });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.title || !body.description) return NextResponse.json({ error: "Title and description required" }, { status: 400 });
    const project = new Project(body);
    await project.save();
    return NextResponse.json({ success: true, id: project._id, project }, { status: 201 });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 }); }
}
