"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  FlaskConical,
  BookOpen,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  Bell,
  ChevronLeft,
  UserCog,
  UserCircle,
  Megaphone,
  Shield,
} from "lucide-react";

import {
  ThemeToggle,
  ToastContainer,
  Avatar,
} from "@/components/ui";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type PermissionKey =
  | "dashboard"
  | "applications"
  | "announcements"
  | "events"
  | "projects"
  | "resources"
  | "messages"
  | "team"
  | "settings";

type Permissions = Record<
  PermissionKey,
  boolean
>;

type CurrentUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  facultyPosition?: string | null;
  permissions?: Partial<Permissions>;
};

// ─────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────

const NAV: {
  href: string;
  icon: React.ElementType;
  label: string;
  permission?: PermissionKey;
}[] = [
  {
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    permission: "dashboard",
  },

  {
    href: "/admin/applications",
    icon: ClipboardList,
    label: "Applications",
    permission: "applications",
  },

  {
    href: "/admin/announcements",
    icon: Megaphone,
    label: "Announcements",
    permission: "announcements",
  },

  {
    href: "/admin/events",
    icon: Calendar,
    label: "Events",
    permission: "events",
  },

  {
    href: "/admin/projects",
    icon: FlaskConical,
    label: "Projects",
    permission: "projects",
  },

  {
    href: "/admin/resources",
    icon: BookOpen,
    label: "Resources",
    permission: "resources",
  },

  {
    href: "/admin/messages",
    icon: MessageSquare,
    label: "Messages",
    permission: "messages",
  },

  {
    href: "/admin/team",
    icon: UserCog,
    label: "Team",
    permission: "team",
  },

  {
    href: "/admin/settings",
    icon: Settings,
    label: "Settings",
    permission: "settings",
  },

  // ─────────────────────────────────────────
  // Personal Account
  // Available to every authenticated user
  // ─────────────────────────────────────────

  {
    href: "/admin/account",
    icon: UserCircle,
    label: "My Account",
  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getRoleLabel(user: CurrentUser) {
  if (user.role === "admin") {
    return "Admin";
  }

  if (user.role === "faculty") {
    if (
      user.facultyPosition ===
      "faculty_head"
    ) {
      return "Faculty Head";
    }

    if (
      user.facultyPosition ===
      "club_instructor"
    ) {
      return "Club Instructor";
    }

    return "Faculty";
  }

  if (user.role === "core") {
    return "Core Member";
  }

  return "Member";
}

// ─────────────────────────────────────────────
// Default Permissions
// ─────────────────────────────────────────────

function getDefaultPermissions(
  userPermissions?: Partial<Permissions>
): Permissions {
  return {
    dashboard:
      userPermissions?.dashboard ?? false,

    applications:
      userPermissions?.applications ?? false,

    announcements:
      userPermissions?.announcements ?? false,

    events:
      userPermissions?.events ?? false,

    projects:
      userPermissions?.projects ?? false,

    resources:
      userPermissions?.resources ?? false,

    messages:
      userPermissions?.messages ?? false,

    team:
      userPermissions?.team ?? false,

    settings:
      userPermissions?.settings ?? false,
  };
}

// ─────────────────────────────────────────────
// Get First Allowed Route
// ─────────────────────────────────────────────

function getFirstAllowedRoute(
  user: CurrentUser
): string {
  // Admin always starts at Dashboard.
  if (user.role === "admin") {
    return "/admin/dashboard";
  }

  const permissions =
    getDefaultPermissions(
      user.permissions
    );

  // The order here determines which page
  // the user gets when multiple permissions
  // are enabled.
  const routes: {
    permission: PermissionKey;
    href: string;
  }[] = [
    {
      permission: "dashboard",
      href: "/admin/dashboard",
    },

    {
      permission: "applications",
      href: "/admin/applications",
    },

    {
      permission: "announcements",
      href: "/admin/announcements",
    },

    {
      permission: "events",
      href: "/admin/events",
    },

    {
      permission: "projects",
      href: "/admin/projects",
    },

    {
      permission: "resources",
      href: "/admin/resources",
    },

    {
      permission: "messages",
      href: "/admin/messages",
    },

    {
      permission: "team",
      href: "/admin/team",
    },

    {
      permission: "settings",
      href: "/admin/settings",
    },
  ];

  const firstAllowed = routes.find(
    (route) =>
      permissions[
        route.permission
      ] === true
  );

  // If no administrative permission
  // is enabled, My Account is still
  // available.
  return (
    firstAllowed?.href ||
    "/admin/account"
  );
}

// ─────────────────────────────────────────────
// Admin Layout
// ─────────────────────────────────────────────

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] =
    useState(false);

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  // ─────────────────────────────────────────
  // Load Current Logged-in User
  // ─────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const response = await fetch(
          "/api/auth/session",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load session"
          );
        }

        const data =
          await response.json();

        if (!mounted) {
          return;
        }

        const sessionUser =
          data?.user as
            | CurrentUser
            | undefined;

        if (!sessionUser) {
          router.replace("/login");
          return;
        }

        setUser(sessionUser);
      } catch (error) {
        console.error(
          "Session loading error:",
          error
        );

        if (mounted) {
          router.replace("/login");
        }
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    };

    loadSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  // ─────────────────────────────────────────
  // Permission / Route Protection
  //
  // IMPORTANT:
  // This hook is BEFORE any conditional
  // return so React's hook order never changes.
  // ─────────────────────────────────────────

  useEffect(() => {
    if (loadingUser || !user) {
      return;
    }

    // My Account is available to everyone.
    if (
      pathname === "/admin/account" ||
      pathname?.startsWith(
        "/admin/account/"
      )
    ) {
      return;
    }

    // Admin can access every section.
    if (user.role === "admin") {
      return;
    }

    const permissions =
      getDefaultPermissions(
        user.permissions
      );

    // Find the current navigation item.
    const currentNavItem = NAV.find(
      (item) =>
        pathname === item.href ||
        pathname?.startsWith(
          item.href + "/"
        )
    );

    // If the current route isn't one of
    // the navigation routes, don't interfere.
    if (!currentNavItem) {
      return;
    }

    // My Account has no permission.
    if (!currentNavItem.permission) {
      return;
    }

    // User has permission for the page.
    if (
      permissions[
        currentNavItem.permission
      ] === true
    ) {
      return;
    }

    // User doesn't have permission.
    // Redirect to their first allowed page.
    const firstAllowedRoute =
      getFirstAllowedRoute(user);

    if (
      pathname !== firstAllowedRoute
    ) {
      router.replace(
        firstAllowedRoute
      );
    }
  }, [
    loadingUser,
    user,
    pathname,
    router,
  ]);

  // ─────────────────────────────────────────
  // Login Page
  // ─────────────────────────────────────────

  if (
    pathname === "/login" ||
    pathname?.includes("/login")
  ) {
    return <>{children}</>;
  }

  // ─────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────

  if (loadingUser) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "var(--surface)",
          color: "var(--text2)",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              border:
                "3px solid var(--border2)",
              borderTopColor:
                "var(--accent)",
              borderRadius: "50%",
              animation:
                "admin-loading-spin 0.8s linear infinite",
              margin:
                "0 auto 0.75rem",
            }}
          />

          <div
            style={{
              fontSize: "0.82rem",
            }}
          >
            Loading admin panel…
          </div>
        </div>

        <style>{`
          @keyframes admin-loading-spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // No User
  // ─────────────────────────────────────────

  if (!user) {
    return null;
  }

  // ─────────────────────────────────────────
  // Determine Permissions
  // ─────────────────────────────────────────

  const permissions: Permissions =
    getDefaultPermissions(
      user.permissions
    );

  const isAdmin =
    user.role === "admin";

  // ─────────────────────────────────────────
  // Filter Navigation
  // ─────────────────────────────────────────

  const visibleNav = NAV.filter(
    (item) =>
      isAdmin ||
      !item.permission ||
      permissions[
        item.permission
      ] === true
  );

  // ─────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────

  const handleLogout = async () => {
    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  // ─────────────────────────────────────────
  // Current Page
  // ─────────────────────────────────────────

  const currentPage =
    NAV.find(
      (item) =>
        pathname === item.href ||
        pathname?.startsWith(
          item.href + "/"
        )
    )?.label || "Admin Panel";

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <div className="admin-wrap">

      {/* ═══════════════════════════════════════
          SIDEBAR
      ═══════════════════════════════════════ */}

      <aside
        className={`admin-sidebar ${
          collapsed
            ? "collapsed"
            : ""
        }`}
      >
        {/* Logo */}

        <div
          style={{
            height: 60,
            display: "flex",
            alignItems: "center",
            padding: collapsed
              ? "0 1rem"
              : "0 1.25rem",
            borderBottom:
              "1px solid var(--border2)",
            gap: "0.65rem",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <img
              src="/ai-club-logo.png"
              alt="AI Club"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          {!collapsed && (
            <span
              style={{
                fontFamily:
                  "'Space Grotesk',sans-serif",
                fontWeight: 700,
                fontSize:
                  "1.05rem",
                color:
                  "var(--text1)",
                whiteSpace:
                  "nowrap",
              }}
            >
              AI-CLUB
            </span>
          )}
        </div>

        {/* Navigation */}

        <nav
          style={{
            flex: 1,
            padding: "0.5rem 0",
            overflowY: "auto",
          }}
        >
          {visibleNav.map(
            (item) => {
              const active =
                pathname ===
                  item.href ||
                pathname?.startsWith(
                  item.href + "/"
                );

              const Icon =
                item.icon;

              return (
                <Link
                  key={item.href}
                  href={
                    item.href
                  }
                  className={`sidebar-link ${
                    active
                      ? "active"
                      : ""
                  }`}
                  title={
                    collapsed
                      ? item.label
                      : undefined
                  }
                >
                  <Icon
                    size={17}
                    className="icon"
                  />

                  {!collapsed && (
                    <span>
                      {
                        item.label
                      }
                    </span>
                  )}
                </Link>
              );
            }
          )}
        </nav>

        {/* Bottom */}

        <div
          style={{
            borderTop:
              "1px solid var(--border2)",
            padding: "0.5rem",
          }}
        >
          <button
            onClick={
              handleLogout
            }
            className="sidebar-link"
            style={{
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              justifyContent:
                collapsed
                  ? "center"
                  : "flex-start",
            }}
            title={
              collapsed
                ? "Logout"
                : undefined
            }
          >
            <LogOut
              size={17}
              className="icon"
            />

            {!collapsed && (
              <span>
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════
          MAIN
      ═══════════════════════════════════════ */}

      <div
        className={`admin-main ${
          collapsed
            ? "collapsed"
            : ""
        }`}
      >
        {/* Topbar */}

        <header
          className="admin-topbar"
        >
          <button
            onClick={() =>
              setCollapsed(
                !collapsed
              )
            }
            className="btn btn-ghost btn-icon"
            style={{
              color:
                "var(--text2)",
            }}
          >
            {collapsed ? (
              <Menu size={18} />
            ) : (
              <ChevronLeft
                size={18}
              />
            )}
          </button>

          <div
            style={{
              flex: 1,
              paddingLeft:
                "1rem",
            }}
          >
            <span
              style={{
                fontFamily:
                  "'Space Grotesk',sans-serif",
                fontWeight: 600,
                fontSize:
                  "0.85rem",
                color:
                  "var(--text2)",
              }}
            >
              {currentPage}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "0.5rem",
            }}
          >
            <ThemeToggle />

            <button
              className="btn btn-ghost btn-icon"
              style={{
                color:
                  "var(--text2)",
                position:
                  "relative",
              }}
            >
              <Bell size={18} />

              <span
                style={{
                  position:
                    "absolute",
                  top: 6,
                  right: 6,
                  width: 7,
                  height: 7,
                  background:
                    "var(--red)",
                  borderRadius:
                    "50%",
                  border:
                    "2px solid var(--surface)",
                }}
              />
            </button>

            {/* User */}

            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "0.6rem",
                paddingLeft:
                  "0.5rem",
                borderLeft:
                  "1px solid var(--border2)",
                marginLeft:
                  "0.25rem",
              }}
            >
              <Avatar
                name={
                  user.name ||
                  "Admin"
                }
                size="sm"
                index={0}
              />

              <div>
                <div
                  style={{
                    fontFamily:
                      "'Space Grotesk',sans-serif",
                    fontWeight: 700,
                    fontSize:
                      "0.8rem",
                  }}
                >
                  {user.name ||
                    "Admin"}
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "0.25rem",
                    fontSize:
                      "0.68rem",
                    color:
                      "var(--text3)",
                    fontFamily:
                      "'JetBrains Mono',monospace",
                  }}
                >
                  <Shield
                    size={10}
                  />

                  {getRoleLabel(
                    user
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}

        <div className="admin-content">
          {children}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}