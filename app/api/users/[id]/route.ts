import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { User, UserActivityLog } from "@/models";


// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Role = "admin" | "faculty" | "core" | "member";

type FacultyPosition =
  | "faculty_head"
  | "club_instructor"
  | null;

type Permissions = {
  dashboard: boolean;
  applications: boolean;
  announcements: boolean;
  events: boolean;
  projects: boolean;
  resources: boolean;
  messages: boolean;
  team: boolean;
  settings: boolean;
};


// ─────────────────────────────────────────────
// Permission Keys
// ─────────────────────────────────────────────

const PERMISSION_KEYS: (keyof Permissions)[] = [
  "dashboard",
  "applications",
  "announcements",
  "events",
  "projects",
  "resources",
  "messages",
  "team",
  "settings",
];


// ─────────────────────────────────────────────
// Admin Permissions
// ─────────────────────────────────────────────

const ADMIN_PERMISSIONS: Permissions = {
  dashboard: true,
  applications: true,
  announcements: true,
  events: true,
  projects: true,
  resources: true,
  messages: true,
  team: true,
  settings: true,
};


// ─────────────────────────────────────────────
// Validate MongoDB ObjectId
// ─────────────────────────────────────────────

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}


// ─────────────────────────────────────────────
// Convert Permissions to a readable string
// for activity history.
// ─────────────────────────────────────────────

function permissionsToString(
  permissions: Partial<Permissions> | null | undefined
) {
  if (!permissions) {
    return "No permissions";
  }

  return PERMISSION_KEYS
    .map((key) => {
      return `${key}: ${
        permissions[key] === true ? "enabled" : "disabled"
      }`;
    })
    .join(", ");
}


// ─────────────────────────────────────────────
// Create Activity Log
// ─────────────────────────────────────────────

async function createActivityLog({
  userId,
  action,
  description,
  oldValue,
  newValue,
  changedBy,
}: {
  userId: mongoose.Types.ObjectId;
  action:
    | "name_changed"
    | "email_changed"
    | "password_changed"
    | "role_changed"
    | "permissions_changed"
    | "faculty_position_changed"
    | "admin_name_changed"
    | "admin_email_changed"
    | "admin_password_reset"
    | "admin_role_changed"
    | "admin_permissions_changed"
    | "admin_faculty_position_changed"
    | "account_deleted";
  description: string;
  oldValue?: string;
  newValue?: string;
  changedBy: mongoose.Types.ObjectId;
}) {
  await UserActivityLog.create({
    userId,
    action,
    description,
    oldValue,
    newValue,
    changedBy,
    changedByType: "admin",
  });
}


// ─────────────────────────────────────────────
// PATCH
// Admin edits another user's account.
// ─────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // ─────────────────────────────────────────
    // Require Admin
    // ─────────────────────────────────────────

    const { user: admin, response } =
      await requireAdmin(req);

    if (response) {
      return response;
    }

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }


    // ─────────────────────────────────────────
    // Get User ID
    // ─────────────────────────────────────────

    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        {
          status: 400,
        }
      );
    }


    await connectDB();


    // ─────────────────────────────────────────
    // Find User
    // ─────────────────────────────────────────

    const existingUser =
      await User.findById(id);

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }


    // ─────────────────────────────────────────
    // Read Body
    // ─────────────────────────────────────────

    const body = await req.json();

    const {
      name,
      email,
      role,
      facultyPosition,
      permissions,
      newPassword,
    } = body;


    // Keep track of changes.
    const changes: string[] = [];

    let sessionVersionChanged = false;


    // ─────────────────────────────────────────
    // NAME
    // ─────────────────────────────────────────

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Name cannot be empty",
          },
          {
            status: 400,
          }
        );
      }

      const newName = name.trim();

      if (newName !== existingUser.name) {
        const oldName = existingUser.name;

        existingUser.name = newName;

        await createActivityLog({
          userId: existingUser._id,
          action: "admin_name_changed",
          description:
            `Administrator ${admin.name} changed the user's name.`,
          oldValue: oldName,
          newValue: newName,
          changedBy: admin._id,
        });

        changes.push("name");
      }
    }


    // ─────────────────────────────────────────
    // EMAIL
    // ─────────────────────────────────────────

    if (email !== undefined) {
      if (
        typeof email !== "string" ||
        !email.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Email cannot be empty",
          },
          {
            status: 400,
          }
        );
      }

      const newEmail =
        email.trim().toLowerCase();

      if (newEmail !== existingUser.email) {
        const duplicate =
          await User.findOne({
            email: newEmail,
            _id: {
              $ne: existingUser._id,
            },
          });

        if (duplicate) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Another user already exists with this email",
            },
            {
              status: 409,
            }
          );
        }

        const oldEmail =
          existingUser.email;

        existingUser.email = newEmail;

        // Changing email invalidates
        // the existing session.
        existingUser.sessionVersion =
          (existingUser.sessionVersion ?? 0) + 1;

        sessionVersionChanged = true;

        await createActivityLog({
          userId: existingUser._id,
          action: "admin_email_changed",
          description:
            `Administrator ${admin.name} changed the user's email address.`,
          oldValue: oldEmail,
          newValue: newEmail,
          changedBy: admin._id,
        });

        changes.push("email");
      }
    }


    // ─────────────────────────────────────────
    // ROLE
    // ─────────────────────────────────────────

    if (role !== undefined) {
      const validRoles: Role[] = [
        "admin",
        "faculty",
        "core",
        "member",
      ];

      if (!validRoles.includes(role)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid user role",
          },
          {
            status: 400,
          }
        );
      }

      if (role !== existingUser.role) {
        const oldRole =
          existingUser.role;

        existingUser.role = role;

        // Admin automatically receives all
        // permissions.
        if (role === "admin") {
          existingUser.permissions =
            ADMIN_PERMISSIONS;
        }

        // If changing away from faculty,
        // faculty position must be removed.
        if (role !== "faculty") {
          existingUser.facultyPosition = null;
        }

        await createActivityLog({
          userId: existingUser._id,
          action: "admin_role_changed",
          description:
            `Administrator ${admin.name} changed the user's role.`,
          oldValue: oldRole,
          newValue: role,
          changedBy: admin._id,
        });

        changes.push("role");
      }
    }


    // ─────────────────────────────────────────
    // FACULTY POSITION
    // ─────────────────────────────────────────

    if (
      facultyPosition !== undefined &&
      existingUser.role === "faculty"
    ) {
      const validPositions = [
        "faculty_head",
        "club_instructor",
        null,
      ];

      if (
        !validPositions.includes(
          facultyPosition
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid faculty position",
          },
          {
            status: 400,
          }
        );
      }

      if (
        facultyPosition !==
        existingUser.facultyPosition
      ) {
        const oldPosition =
          existingUser.facultyPosition;

        existingUser.facultyPosition =
          facultyPosition as FacultyPosition;

        await createActivityLog({
          userId: existingUser._id,
          action:
            "admin_faculty_position_changed",
          description:
            `Administrator ${admin.name} changed the user's faculty position.`,
          oldValue:
            oldPosition || "None",
          newValue:
            facultyPosition || "None",
          changedBy: admin._id,
        });

        changes.push("faculty position");
      }
    }


    // ─────────────────────────────────────────
    // PERMISSIONS
    //
    // Admin role always receives every
    // permission.
    //
    // For other roles, use exactly what the
    // administrator selected.
    // ─────────────────────────────────────────

    if (
      permissions !== undefined &&
      existingUser.role !== "admin"
    ) {
      const oldPermissions = {
        dashboard:
          existingUser.permissions?.dashboard === true,

        applications:
          existingUser.permissions?.applications === true,

        announcements:
          existingUser.permissions?.announcements === true,

        events:
          existingUser.permissions?.events === true,

        projects:
          existingUser.permissions?.projects === true,

        resources:
          existingUser.permissions?.resources === true,

        messages:
          existingUser.permissions?.messages === true,

        team:
          existingUser.permissions?.team === true,

        settings:
          existingUser.permissions?.settings === true,
      };

      const newPermissions: Permissions = {
        dashboard:
          permissions.dashboard === true,

        applications:
          permissions.applications === true,

        announcements:
          permissions.announcements === true,

        events:
          permissions.events === true,

        projects:
          permissions.projects === true,

        resources:
          permissions.resources === true,

        messages:
          permissions.messages === true,

        team:
          permissions.team === true,

        settings:
          permissions.settings === true,
      };

      const oldPermissionString =
        permissionsToString(
          oldPermissions
        );

      const newPermissionString =
        permissionsToString(
          newPermissions
        );

      if (
        oldPermissionString !==
        newPermissionString
      ) {
        existingUser.permissions =
          newPermissions;

        await createActivityLog({
          userId: existingUser._id,
          action:
            "admin_permissions_changed",
          description:
            `Administrator ${admin.name} changed the user's permissions.`,
          oldValue:
            oldPermissionString,
          newValue:
            newPermissionString,
          changedBy: admin._id,
        });

        changes.push("permissions");
      }
    }


    // ─────────────────────────────────────────
    // PASSWORD RESET
    //
    // IMPORTANT:
    // The actual password is NEVER stored
    // in the activity log.
    // ─────────────────────────────────────────

    if (newPassword !== undefined) {
      if (
        typeof newPassword !== "string" ||
        !newPassword
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "New password cannot be empty",
          },
          {
            status: 400,
          }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          {
            success: false,
            error:
              "New password must be at least 6 characters long",
          },
          {
            status: 400,
          }
        );
      }

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          12
        );

      existingUser.password =
        hashedPassword;

      // Invalidate previous sessions.
      existingUser.sessionVersion =
        (existingUser.sessionVersion ?? 0) + 1;

      sessionVersionChanged = true;

      await createActivityLog({
        userId: existingUser._id,
        action: "admin_password_reset",
        description:
          `Administrator ${admin.name} reset the user's password.`,
        changedBy: admin._id,
      });

      changes.push("password");
    }


    // ─────────────────────────────────────────
    // Save User
    // ─────────────────────────────────────────

    await existingUser.save();


    // ─────────────────────────────────────────
    // Safe Response
    // ─────────────────────────────────────────

    const safeUser = {
      _id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      facultyPosition:
        existingUser.facultyPosition,
      permissions:
        existingUser.permissions,
      sessionVersion:
        existingUser.sessionVersion,
      createdAt:
        existingUser.createdAt,
    };


    return NextResponse.json({
      success: true,
      message:
        changes.length > 0
          ? `User updated successfully. Changed: ${changes.join(", ")}`
          : "No changes were made.",
      user: safeUser,
      sessionInvalidated:
        sessionVersionChanged,
    });
  } catch (error: any) {
    console.error(
      "PATCH /api/users/[id] error:",
      error
    );

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A user with this email already exists",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
      },
      {
        status: 500,
      }
    );
  }
}


// ─────────────────────────────────────────────
// DELETE
//
// Only administrators can delete users.
// Admin cannot delete their own account.
// ─────────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // ─────────────────────────────────────────
    // Require Admin
    // ─────────────────────────────────────────

    const { user: admin, response } =
      await requireAdmin(req);

    if (response) {
      return response;
    }

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }


    // ─────────────────────────────────────────
    // Get User ID
    // ─────────────────────────────────────────

    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        {
          status: 400,
        }
      );
    }


    await connectDB();


    // ─────────────────────────────────────────
    // Prevent Admin From Deleting Their Own
    // Account
    // ─────────────────────────────────────────

    if (
      admin._id.toString() === id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You cannot delete your own administrator account.",
        },
        {
          status: 400,
        }
      );
    }


    // ─────────────────────────────────────────
    // Find User
    // ─────────────────────────────────────────

    const userToDelete =
      await User.findById(id);

    if (!userToDelete) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }


    // ─────────────────────────────────────────
    // Log Deletion BEFORE deleting the user
    //
    // We cannot use a user reference after
    // deleting the document.
    // ─────────────────────────────────────────

    await createActivityLog({
      userId: userToDelete._id,
      action: "account_deleted",
      description:
        `Account deleted by administrator ${admin.name}.`,
      oldValue: JSON.stringify({
        name: userToDelete.name,
        email: userToDelete.email,
        role: userToDelete.role,
      }),
      changedBy: admin._id,
    });


    // ─────────────────────────────────────────
    // Delete User
    // ─────────────────────────────────────────

    await User.findByIdAndDelete(id);


    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE /api/users/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
      },
      {
        status: 500,
      }
    );
  }
}