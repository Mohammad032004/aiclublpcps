import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { Resource } from "@/models";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid resource ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const action = body?.action;

    // Only allow these two tracking actions
    if (action !== "view" && action !== "download") {
      return NextResponse.json(
        { error: "Invalid tracking action" },
        { status: 400 }
      );
    }

    await connectDB();

    const field =
      action === "view"
        ? "views"
        : "downloads";

    const resource = await Resource.findByIdAndUpdate(
      id,
      {
        $inc: {
          [field]: 1,
        },
      },
      {
        new: true,
        projection: {
          views: 1,
          downloads: 1,
        },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      views: resource.views ?? 0,
      downloads: resource.downloads ?? 0,
    });
  } catch (err: unknown) {
    console.error("Resource tracking error:", err);

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Server error",
      },
      { status: 500 }
    );
  }
}