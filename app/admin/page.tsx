import { redirect } from "next/navigation";

/**
 * /admin — bare admin index route.
 * Redirects to the dashboard so /admin always lands somewhere useful.
 */
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
