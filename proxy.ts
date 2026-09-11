import { NextRequest, NextResponse } from "next/server";

import {
  verifySessionToken,
  SESSION_COOKIE,
} from "@/lib/session";

// ─────────────────────────────────────────────
// Next.js 16 Proxy
// ─────────────────────────────────────────────

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─────────────────────────────────────────
  // Get Session
  // ─────────────────────────────────────────

  const token =
    req.cookies.get(SESSION_COOKIE)?.value;

  let session = null;

  if (token) {
    session = verifySessionToken(token);
  }

  // ─────────────────────────────────────────
  // Route Detection
  // ─────────────────────────────────────────

  const isAdminRoute =
    pathname.startsWith("/admin");

  // /admin/login is kept as a legacy alias
  // for /login.
  const isLoginRoute =
    pathname === "/login" ||
    pathname === "/admin/login";

  // ─────────────────────────────────────────
  // Protect Admin Routes
  // ─────────────────────────────────────────

  // If the user is not logged in and tries
  // to access any /admin route, redirect
  // them to /login.
  //
  // /admin/login is excluded because it is
  // treated as a login route.

  if (
    isAdminRoute &&
    !session &&
    !isLoginRoute
  ) {
    const url =
      req.nextUrl.clone();

    url.pathname = "/login";
    url.search = "";

    // Remember the page they originally wanted.
    url.searchParams.set(
      "next",
      pathname
    );

    return NextResponse.redirect(url);
  }

  // ─────────────────────────────────────────
  // Logged-in User Visiting Login
  // ─────────────────────────────────────────

  // IMPORTANT:
  //
  // Do NOT redirect every logged-in user
  // directly to /admin/dashboard here.
  //
  // The AdminLayout checks their permissions
  // and sends them to the first permitted page.
  //
  // This is important for members who do not
  // have Dashboard permission.

  if (isLoginRoute && session) {
    const url =
      req.nextUrl.clone();

    url.pathname = "/admin/dashboard";
    url.search = "";

    return NextResponse.redirect(url);
  }

  // ─────────────────────────────────────────
  // Continue Request
  // ─────────────────────────────────────────

  return NextResponse.next();
}

// ─────────────────────────────────────────────
// Routes handled by Proxy
// ─────────────────────────────────────────────

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
  ],
};