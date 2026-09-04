import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

// Proxy always runs on the Node.js runtime in Next.js 16, so the
// crypto-based session helper (lib/session.ts) works here without
// any extra runtime config.
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);

  const isAdminRoute = pathname.startsWith("/admin");
  // "/admin/login" is a legacy alias for "/login" (see app/admin/login/page.tsx);
  // treat both the same way here so it never falls through to a 404 and an
  // already-authenticated visitor skips straight to the dashboard.
  const isLoginRoute = pathname === "/login" || pathname === "/admin/login";

  // Not logged in and trying to reach the admin panel -> send to /login
  if (isAdminRoute && !session && !isLoginRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Already logged in and visiting /login (or its /admin/login alias) -> skip straight to the dashboard
  if (isLoginRoute && session) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
