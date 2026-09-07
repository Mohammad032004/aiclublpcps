import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import { User } from "@/models";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

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

type UserRole = "admin" | "faculty" | "core" | "member";

type FacultyPosition =
  | "faculty_head"
  | "club_instructor"
  | null;

type TokenUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: UserRole;
  facultyPosition?: FacultyPosition;
  permissions?: Permissions;
};

// ─────────────────────────────────────────────
// All permissions
// ─────────────────────────────────────────────

const ALL_PERMISSIONS: Permissions = {
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
// Default permissions
// ─────────────────────────────────────────────

const DEFAULT_PERMISSIONS: Permissions = {
  dashboard: true,
  applications: false,
  announcements: false,
  events: false,
  projects: false,
  resources: false,
  messages: false,
  team: false,
  settings: false,
};

// ─────────────────────────────────────────────
// Normalize permissions
// ─────────────────────────────────────────────

function normalizePermissions(
  value: unknown,
  role?: string
): Permissions {
  let saved: Partial<Permissions> = {};

  if (value) {
    if (
      typeof value === "object" &&
      value !== null &&
      "toObject" in value &&
      typeof (
        value as {
          toObject?: () => unknown;
        }
      ).toObject === "function"
    ) {
      const converted = (
        value as {
          toObject: () => unknown;
        }
      ).toObject();

      if (
        converted &&
        typeof converted === "object"
      ) {
        saved = converted as Partial<Permissions>;
      }
    } else if (
      typeof value === "object"
    ) {
      saved = value as Partial<Permissions>;
    }
  }

  // Admin always has full access
  if (role === "admin") {
    return {
      ...ALL_PERMISSIONS,
    };
  }

  return {
    ...DEFAULT_PERMISSIONS,
    ...saved,

    // Dashboard is always available
    dashboard: true,

    // Settings should never accidentally be
    // granted to non-admin users unless explicitly
    // selected in the database.
    settings:
      saved.settings === true,
  };
}

// ─────────────────────────────────────────────
// Get fresh user permissions from MongoDB
// ─────────────────────────────────────────────

async function getFreshUser(
  userId: string
) {
  try {
    await connectDB();

    const dbUser = await User.findById(
      userId
    ).lean();

    if (!dbUser) {
      return null;
    }

    const role =
      dbUser.role as UserRole;

    const permissions =
      normalizePermissions(
        dbUser.permissions,
        role
      );

    return {
      id: dbUser._id.toString(),
      name: dbUser.name,
      email: dbUser.email,
      role,
      facultyPosition:
        (dbUser.facultyPosition ||
          null) as FacultyPosition,
      permissions,
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// NextAuth
// ─────────────────────────────────────────────

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },

        role: {
          label: "Role",
          type: "text",
        },
      },

      // ───────────────────────────────────────
      // Login
      // ───────────────────────────────────────

      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          return null;
        }

        try {
          await connectDB();

          const email = String(
            credentials.email
          )
            .toLowerCase()
            .trim();

          const user =
            await User.findOne({
              email,
            });

          if (!user) {
            return null;
          }

          const valid =
            await bcrypt.compare(
              String(credentials.password),
              user.password
            );

          if (!valid) {
            return null;
          }

          const permissions =
            normalizePermissions(
              user.permissions,
              user.role
            );

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role as UserRole,
            facultyPosition:
              (user.facultyPosition ||
                null) as FacultyPosition,
            permissions,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    // ─────────────────────────────────────────
    // JWT
    // ─────────────────────────────────────────

    async jwt({
      token,
      user,
    }) {
      /*
       * FIRST LOGIN
       *
       * When the user logs in, save their
       * information into the JWT.
       */
      if (user) {
        const currentUser =
          user as TokenUser;

        token.id =
          currentUser.id;

        token.name =
          currentUser.name;

        token.email =
          currentUser.email;

        token.role =
          currentUser.role;

        token.facultyPosition =
          currentUser.facultyPosition;

        token.permissions =
          currentUser.permissions;
      }

      /*
       * IMPORTANT FIX
       *
       * Every time NextAuth checks the JWT,
       * reload the user's latest information
       * from MongoDB.
       *
       * This means when Admin changes:
       *
       *   role
       *   faculty position
       *   permissions
       *
       * the session gets the new values without
       * requiring the user to log out and log back in.
       */
      if (token.id) {
        const freshUser =
          await getFreshUser(
            String(token.id)
          );

        if (freshUser) {
          token.id =
            freshUser.id;

          token.name =
            freshUser.name;

          token.email =
            freshUser.email;

          token.role =
            freshUser.role;

          token.facultyPosition =
            freshUser.facultyPosition;

          token.permissions =
            freshUser.permissions;
        }
      }

      return token;
    },

    // ─────────────────────────────────────────
    // Session
    // ─────────────────────────────────────────

    async session({
      session,
      token,
    }) {
      if (session.user) {
        const sessionUser =
          session.user as typeof session.user & {
            id?: string;
            role?: UserRole;
            facultyPosition?: FacultyPosition;
            permissions?: Permissions;
          };

        sessionUser.id =
          token.id as string;

        sessionUser.role =
          token.role as UserRole;

        sessionUser.facultyPosition =
          (token.facultyPosition ||
            null) as FacultyPosition;

        sessionUser.permissions =
          normalizePermissions(
            token.permissions,
            token.role as string
          );
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret:
    process.env.NEXTAUTH_SECRET,
});

export {
  handler as GET,
  handler as POST,
};