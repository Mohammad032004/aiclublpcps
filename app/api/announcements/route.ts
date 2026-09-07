export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Announcement } from "@/models";


// ─────────────────────────────────────────────
// GET — Fetch announcements
// ─────────────────────────────────────────────

export async function GET() {
  try {
    await connectDB();

    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      announcements,
      total: announcements.length,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Server error",
      },
      { status: 500 }
    );
  }
}


// ─────────────────────────────────────────────
// POST — Create announcement
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!body.description?.trim()) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const announcement = new Announcement({
      title: body.title.trim(),
      description: body.description.trim(),
      badge: body.badge?.trim() || "Announcement",
      buttonText: body.buttonText?.trim() || "Learn More",
      buttonLink: body.buttonLink?.trim() || "/",
      active: body.active !== false,
      showPopup: body.showPopup !== false,
    });

    await announcement.save();

    return NextResponse.json(
      {
        success: true,
        announcement,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Server error",
      },
      { status: 500 }
    );
  }
}