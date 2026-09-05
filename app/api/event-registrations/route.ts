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

    // Basic validation
    if (!body.eventId) {
      return NextResponse.json(
        {
          success: false,
          error: "eventId is required",
        },
        { status: 400 }
      );
    }

    if (!body.name) {
      return NextResponse.json(
        {
          success: false,
          error: "name is required",
        },
        { status: 400 }
      );
    }

    if (!body.email) {
      return NextResponse.json(
        {
          success: false,
          error: "email is required",
        },
        { status: 400 }
      );
    }

    /**
     * Normalize team members.
     *
     * IMPORTANT:
     * branch and year are explicitly preserved here.
     */
    const teamMembers = Array.isArray(body.teamMembers)
      ? body.teamMembers.map((member: Record<string, unknown>) => ({
          name:
            typeof member.name === "string"
              ? member.name.trim()
              : "",

          email:
            typeof member.email === "string"
              ? member.email.trim()
              : "",

          phone:
            typeof member.phone === "string"
              ? member.phone.trim()
              : "",

          branch:
            typeof member.branch === "string"
              ? member.branch.trim()
              : "",

          year:
            typeof member.year === "string"
              ? member.year.trim()
              : "",
        }))
      : [];

    /**
     * Create the registration.
     *
     * Preserve the other registration fields while
     * explicitly setting teamMembers.
     */
    const registrationData = {
      ...body,
      teamMembers,
    };

    const registration = new EventRegistration(registrationData);

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
    console.error(
      "POST /api/event-registrations error:",
      err
    );

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
    console.error(
      "GET /api/event-registrations error:",
      err
    );

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