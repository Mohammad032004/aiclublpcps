import { redirect } from "next/navigation";

/**
 * /admin/login — legacy/aliased path.
 *
 * The real admin login page lives at /login (see app/(auth)/login/page.tsx),
 * which is what middleware.ts's isLoginRoute check and the documented flow
 * (/login -> /api/auth/admin-login -> /admin/dashboard) expect.
 *
 * Some places (README, the unused NextAuth pages config) still reference
 * "/admin/login". Since /admin/* has no catch-all and no page previously
 * existed at this exact path, visiting it directly (e.g. while already
 * authenticated, so middleware doesn't intervene) produced a hard 404.
 * This redirect makes /admin/login a safe alias instead of a dead link.
 */
export default function AdminLoginAliasPage() {
  redirect("/login");
}
