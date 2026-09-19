export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { Application } from "@/models";

import mongoose from "mongoose";

type P = {
  params: Promise<{ id: string }>;
};

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

    const update: Record<string, unknown> = {
      ...body,
    };

    if (
      body.status &&
      body.status !== "pending"
    ) {
      update.reviewedAt = new Date();
    }

    const application =
      await Application.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true }
      );

    if (!application) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (err: unknown) {
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

export async function DELETE(
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

    /*
     * ================================
     * ADMIN-ONLY DELETE
     * ================================
     *
     * Ask the existing session endpoint
     * who is currently logged in.
     */
    const sessionResponse = await fetch(
      new URL("/api/auth/session", req.url),
      {
        method: "GET",
        headers: {
          cookie:
            req.headers.get("cookie") || "",
        },
        cache: "no-store",
      }
    );

    if (!sessionResponse.ok) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const session =
      await sessionResponse.json();

    /*
     * User must be logged in.
     */
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /*
     * ONLY ADMIN CAN DELETE
     */
    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "Only administrators can delete applications",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const application =
      await Application.findByIdAndDelete(id);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (err: unknown) {
    console.error(
      "Delete application error:",
      err
    );

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