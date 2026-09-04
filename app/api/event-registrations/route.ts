export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { EventRegistration } from "@/models";

/**
 * POST
 * Create a new event registration
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    if (!body.eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 }
      );
    }

    if (!body.name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    if (!body.email) {
      return NextResponse.json(
        { error: "email is required" },
        { status: 400 }
      );
    }

    /*
     * Save the complete registration.
     *
     * This supports:
     * - Individual registrations
     * - Team registrations
     * - teamName
     * - teamMembers
     * - formData
     * - extraFields
     */
    const registration = new EventRegistration(body);

    await registration.save();

    return NextResponse.json(
      {
        success: true,
        registration,
        id: registration._id,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("POST /api/event-registrations error:", err);

    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to create registration",
      },
      { status: 500 }
    );
  }
}

/**
 * GET
 * Get registrations for an event.
 *
 * Admin page calls:
 *
 * /api/event-registrations?eventId=EVENT_ID&admin=true
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        {
          success: false,
          error: "eventId is required",
          registrations: [],
        },
        { status: 400 }
      );
    }

    const registrations = await EventRegistration.find({
      eventId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        registrations,
        count: registrations.length,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("GET /api/event-registrations error:", err);

    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to load registrations",
        registrations: [],
      },
      { status: 500 }
    );
  }
}