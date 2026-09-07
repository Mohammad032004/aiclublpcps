export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Announcement } from "@/models";

type P = {
  params: Promise<{
    id: string;
  }>;
};


// ─────────────────────────────────────────────
// PATCH — Update announcement
// ─────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: P
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    await connectDB();

    const announcement =
      await Announcement.findByIdAndUpdate(
        id,
        {
          $set: {
            ...body,
            updatedAt: new Date(),
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      announcement,
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
// DELETE — Delete announcement
// ─────────────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: P
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const announcement =
      await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
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