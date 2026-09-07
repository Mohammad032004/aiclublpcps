"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Mail,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  LayoutDashboard,
  FileText,
  Megaphone,
  CalendarDays,
  FolderKanban,
  BookOpen,
  MessageSquare,
  UserRound,
  Settings as SettingsIcon,
} from "lucide-react";

import {
  showToast,
  Modal,
  FormField,
  Spinner,
  Avatar,
} from "@/components/ui";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Role = "admin" | "faculty" | "core" | "member";

type FacultyPosition =
  | "faculty_head"
  | "club_instructor"
  | null;

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

type Permissions = Record<PermissionKey, boolean>;

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  facultyPosition?: FacultyPosition;
  permissions: Permissions;
  createdAt: string;
}

type Tab = "password" | "email" | "users";

// ─────────────────────────────────────────────
// Permission Configuration
// ─────────────────────────────────────────────

const PERMISSIONS: {
  key: PermissionKey;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "View admin dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "applications",
    label: "Applications",
    description: "Manage club applications",
    icon: FileText,
  },
  {
    key: "announcements",
    label: "Announcements",
    description: "Create and manage announcements",
    icon: Megaphone,
  },
  {
    key: "events",
    label: "Events",
    description: "Manage events and registrations",
    icon: CalendarDays,
  },
  {
    key: "projects",
    label: "Projects",
    description: "Manage club projects",
    icon: FolderKanban,
  },
  {
    key: "resources",
    label: "Resources",
    description: "Manage learning resources",
    icon: BookOpen,
  },
  {
    key: "messages",
    label: "Messages",
    description: "View and manage messages",
    icon: MessageSquare,
  },
  {
    key: "team",
    label: "Team",
    description: "Manage team members",
    icon: UserRound,
  },
  {
    key: "settings",
    label: "Settings",
    description: "Manage admin settings and users",
    icon: SettingsIcon,
  },
];

// ─────────────────────────────────────────────
// Default Permissions
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
// Role Configuration
// ─────────────────────────────────────────────

const ROLE_CONFIG: {
  role: Role;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    role: "admin",
    label: "Admin",
    description: "Full access to the entire admin panel",
    color: "var(--red)",
  },
  {
    role: "faculty",
    label: "Faculty",
    description: "Faculty Head or Club Instructor",
    color: "var(--accent)",
  },
  {
    role: "core",
    label: "Core Member",
    description: "Core team with selected management access",
    color: "var(--purple, var(--accent))",
  },
  {
    role: "member",
    label: "Member",
    description: "Club member with limited access",
    color: "var(--green)",
  },
];

// ─────────────────────────────────────────────
// Password Field
// ─────────────────────────────────────────────

function PwField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <FormField label={label}>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "••••••••"}
          style={{
            paddingRight: "2.5rem",
          }}
        />

        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: "var(--text3)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </FormField>
  );
}

// ─────────────────────────────────────────────
// Permissions Editor
// ─────────────────────────────────────────────

function PermissionsEditor({
  permissions,
  onChange,
  disabled,
}: {
  permissions: Permissions;
  onChange: (
    key: PermissionKey,
    value: boolean
  ) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ marginTop: "1.25rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <div>
          <h4
            style={{
              fontSize: "0.92rem",
              fontWeight: 700,
              marginBottom: "0.15rem",
            }}
          >
            Permissions
          </h4>

          <p
            style={{
              color: "var(--text3)",
              fontSize: "0.75rem",
            }}
          >
            Choose which sections this user can access.
          </p>
        </div>

        {disabled && (
          <span
            className="badge"
            style={{
              background: "var(--red)18",
              color: "var(--red)",
              border: "1px solid var(--red)30",
            }}
          >
            Full Access
          </span>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "0.65rem",
        }}
      >
        {PERMISSIONS.map((permission) => {
          const Icon = permission.icon;

          return (
            <label
              key={permission.key}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.7rem",
                padding: "0.8rem",
                border: "1px solid var(--border)",
                borderRadius: 10,
                cursor:
                  disabled ||
                  permission.key === "dashboard"
                    ? "default"
                    : "pointer",
                opacity:
                  disabled ||
                  permission.key === "dashboard"
                    ? 0.85
                    : 1,
                background: permissions[permission.key]
                  ? "var(--accent-bg)"
                  : "transparent",
              }}
            >
              <input
                type="checkbox"
                checked={permissions[permission.key]}
                disabled={
                  disabled ||
                  permission.key === "dashboard"
                }
                onChange={(e) =>
                  onChange(
                    permission.key,
                    e.target.checked
                  )
                }
                style={{
                  marginTop: 3,
                  accentColor: "var(--accent)",
                }}
              />

              <div
                style={{
                  width: 30,
                  height: 30,
                  minWidth: 30,
                  borderRadius: 8,
                  background: permissions[
                    permission.key
                  ]
                    ? "var(--accent-bg)"
                    : "var(--surface2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  size={14}
                  color={
                    permissions[permission.key]
                      ? "var(--accent)"
                      : "var(--text3)"
                  }
                />
              </div>

              <div>
                <div
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 650,
                    marginBottom: "0.15rem",
                  }}
                >
                  {permission.label}
                </div>

                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text3)",
                    lineHeight: 1.35,
                  }}
                >
                  {permission.description}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// User Modal
// ─────────────────────────────────────────────

function UserModal({
  user,
  onClose,
  onSave,
}: {
  user?: AdminUser | null;
  onClose: () => void;
  onSave: (
    data: {
      name: string;
      email: string;
      role: Role;
      facultyPosition: FacultyPosition;
      password: string;
      permissions: Permissions;
    },
    id?: string
  ) => Promise<void>;
}) {
  const [form, setForm] = useState<{
    name: string;
    email: string;
    role: Role;
    facultyPosition: FacultyPosition;
    password: string;
    permissions: Permissions;
  }>({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "member",
    facultyPosition: user?.facultyPosition || null,
    password: "",
    permissions: user?.permissions
      ? {
          ...DEFAULT_PERMISSIONS,
          ...user.permissions,
        }
      : {
          ...DEFAULT_PERMISSIONS,
        },
  });

  const [saving, setSaving] = useState(false);

  // ─────────────────────────────────────────
  // Role Change
  // ─────────────────────────────────────────

  const handleRoleChange = (role: Role) => {
    let permissions = {
      ...form.permissions,
    };

    // Admin gets everything
    if (role === "admin") {
      permissions = {
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
    }

    // Dashboard always enabled
    permissions.dashboard = true;

    setForm((prev) => ({
      ...prev,
      role,
      facultyPosition:
        role === "faculty"
          ? prev.facultyPosition || "club_instructor"
          : null,
      permissions,
    }));
  };

  // ─────────────────────────────────────────
  // Permission Change
  // ─────────────────────────────────────────

  const handlePermissionChange = (
    key: PermissionKey,
    value: boolean
  ) => {
    if (form.role === "admin") return;

    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: value,
        dashboard: true,
      },
    }));
  };

  // ─────────────────────────────────────────
  // Save
  // ─────────────────────────────────────────

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      showToast.error("Name and email are required");
      return;
    }

    if (!user && !form.password) {
      showToast.error(
        "Password is required for a new user"
      );
      return;
    }

    if (
      form.password &&
      form.password.length < 8
    ) {
      showToast.error(
        "Password must be at least 8 characters"
      );
      return;
    }

    if (
      form.role === "faculty" &&
      !form.facultyPosition
    ) {
      showToast.error(
        "Please select a faculty position"
      );
      return;
    }

    setSaving(true);

    try {
      await onSave(
        {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          facultyPosition:
            form.role === "faculty"
              ? form.facultyPosition
              : null,
          password: form.password,
          permissions: form.permissions,
        },
        user?._id
      );

      onClose();
    } catch {
      // Error is already shown by parent
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = form.role === "admin";

  return (
    <>
      {/* Name + Email */}
      <div className="grid-2">
        <FormField label="Full Name *">
          <input
            className="input"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            placeholder="Enter full name"
          />
        </FormField>

        <FormField label="Email *">
          <input
            type="email"
            className="input"
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
            placeholder="admin@aiclub.in"
          />
        </FormField>
      </div>

      {/* Role */}
      <FormField label="Role">
        <select
          className="input"
          value={form.role}
          onChange={(e) =>
            handleRoleChange(
              e.target.value as Role
            )
          }
        >
          {ROLE_CONFIG.map((role) => (
            <option
              key={role.role}
              value={role.role}
            >
              {role.label}
            </option>
          ))}
        </select>
      </FormField>

      {/* Role Description */}
      <div
        style={{
          padding: "0.75rem 0.85rem",
          borderRadius: 9,
          background: "var(--surface2)",
          border: "1px solid var(--border)",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            marginBottom: "0.2rem",
          }}
        >
          <Shield size={14} />

          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            {
              ROLE_CONFIG.find(
                (r) => r.role === form.role
              )?.label
            }
          </span>
        </div>

        <p
          style={{
            color: "var(--text3)",
            fontSize: "0.72rem",
          }}
        >
          {
            ROLE_CONFIG.find(
              (r) => r.role === form.role
            )?.description
          }
        </p>
      </div>

      {/* Faculty Position */}
      {form.role === "faculty" && (
        <FormField label="Faculty Position">
          <select
            className="input"
            value={form.facultyPosition || ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                facultyPosition: e.target.value
                  ? (e.target.value as FacultyPosition)
                  : null,
              }))
            }
          >
            <option value="">
              Select position
            </option>

            <option value="faculty_head">
              Faculty Head
            </option>

            <option value="club_instructor">
              Club Instructor
            </option>
          </select>
        </FormField>
      )}

      {/* Password */}
      <PwField
        label={
          user
            ? "New Password (leave blank to keep)"
            : "Password *"
        }
        value={form.password}
        onChange={(value) =>
          setForm((prev) => ({
            ...prev,
            password: value,
          }))
        }
        placeholder={
          user
            ? "Leave blank to keep current password"
            : "Minimum 8 characters"
        }
      />

      {/* Permissions */}
      <PermissionsEditor
        permissions={form.permissions}
        onChange={handlePermissionChange}
        disabled={isAdmin}
      />

      {/* Admin Warning */}
      {isAdmin && (
        <div
          style={{
            marginTop: "0.9rem",
            padding: "0.75rem 0.85rem",
            borderRadius: 9,
            background: "var(--red)10",
            border: "1px solid var(--red)25",
            display: "flex",
            gap: "0.55rem",
          }}
        >
          <Shield
            size={15}
            color="var(--red)"
            style={{
              marginTop: 2,
              flexShrink: 0,
            }}
          />

          <p
            style={{
              color: "var(--text2)",
              fontSize: "0.73rem",
              lineHeight: 1.45,
            }}
          >
            Admin users automatically receive
            full access to all admin panel
            sections and settings.
          </p>
        </div>
      )}

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginTop: "1.5rem",
        }}
      >
        <button
          className="btn btn-ghost"
          style={{ flex: 1 }}
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </button>

        <button
          className="btn btn-primary"
          style={{ flex: 2 }}
          onClick={save}
          disabled={saving}
        >
          {saving ? (
            <>
              <Spinner size="sm" />
              {user ? "Saving…" : "Creating…"}
            </>
          ) : user ? (
            "Save Changes"
          ) : (
            "Create User"
          )}
        </button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Main Settings Page
// ─────────────────────────────────────────────

export default function AdminSettingsPage() {
  const [tab, setTab] =
    useState<Tab>("password");

  const [users, setUsers] =
    useState<AdminUser[]>([]);

  const [loadingUsers, setLoadingUsers] =
    useState(false);

  const [modal, setModal] =
    useState<AdminUser | null | undefined>(
      undefined
    );

  const [pw, setPw] = useState({
    email: "",
    current: "",
    newPw: "",
    confirm: "",
  });

  const [em, setEm] = useState({
    currentEmail: "",
    newEmail: "",
    password: "",
  });

  const [pwLoading, setPwLoading] =
    useState(false);

  const [emLoading, setEmLoading] =
    useState(false);

  // ─────────────────────────────────────────
  // Load Users
  // ─────────────────────────────────────────

  const loadUsers = async () => {
    setLoadingUsers(true);

    try {
      const response =
        await fetch("/api/users");

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load users"
        );
      }

      setUsers(
        (data.users || []).map(
          (user: AdminUser) => ({
            ...user,
            permissions: {
              ...DEFAULT_PERMISSIONS,
              ...(user.permissions || {}),
            },
          })
        )
      );
    } catch (error) {
      showToast.error(
        error instanceof Error
          ? error.message
          : "Failed to load users"
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (tab === "users") {
      loadUsers();
    }
  }, [tab]);

  // ─────────────────────────────────────────
  // Change Password
  // ─────────────────────────────────────────

  const handlePw = async () => {
    if (
      !pw.email ||
      !pw.current ||
      !pw.newPw
    ) {
      showToast.error(
        "All fields are required"
      );
      return;
    }

    if (pw.newPw !== pw.confirm) {
      showToast.error(
        "Passwords do not match"
      );
      return;
    }

    if (pw.newPw.length < 8) {
      showToast.error(
        "Password must be at least 8 characters"
      );
      return;
    }

    setPwLoading(true);

    try {
      const response =
        await fetch(
          "/api/auth/change-password",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email: pw.email,
              currentPassword:
                pw.current,
              newPassword:
                pw.newPw,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to change password"
        );
      }

      showToast.success(
        "Password changed successfully"
      );

      setPw({
        email: "",
        current: "",
        newPw: "",
        confirm: "",
      });
    } catch (error) {
      showToast.error(
        error instanceof Error
          ? error.message
          : "Failed"
      );
    } finally {
      setPwLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // Change Email
  // ─────────────────────────────────────────

  const handleEm = async () => {
    if (
      !em.currentEmail ||
      !em.newEmail ||
      !em.password
    ) {
      showToast.error(
        "All fields are required"
      );
      return;
    }

    setEmLoading(true);

    try {
      const response =
        await fetch(
          "/api/auth/change-email",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(em),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to change email"
        );
      }

      showToast.success(
        "Email updated successfully"
      );

      setEm({
        currentEmail: "",
        newEmail: "",
        password: "",
      });
    } catch (error) {
      showToast.error(
        error instanceof Error
          ? error.message
          : "Failed"
      );
    } finally {
      setEmLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // Create / Update User
  // ─────────────────────────────────────────

  const handleUserSave = async (
    data: {
      name: string;
      email: string;
      role: Role;
      facultyPosition: FacultyPosition;
      password: string;
      permissions: Permissions;
    },
    id?: string
  ) => {
    const url = id
      ? `/api/users/${id}`
      : "/api/users";

    const method = id
      ? "PATCH"
      : "POST";

    const body = id
      ? {
          name: data.name,
          email: data.email,
          role: data.role,
          facultyPosition:
            data.facultyPosition,
          permissions:
            data.permissions,
          ...(data.password
            ? {
                newPassword:
                  data.password,
              }
            : {}),
        }
      : {
          name: data.name,
          email: data.email,
          role: data.role,
          facultyPosition:
            data.facultyPosition,
          password: data.password,
          permissions:
            data.permissions,
        };

    try {
      const response =
        await fetch(url, {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(body),
        });

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to save user"
        );
      }

      showToast.success(
        id
          ? "User updated successfully"
          : "User created successfully"
      );

      await loadUsers();
    } catch (error) {
      showToast.error(
        error instanceof Error
          ? error.message
          : "Failed to save user"
      );

      throw error;
    }
  };

  // ─────────────────────────────────────────
  // Delete User
  // ─────────────────────────────────────────

  const delUser = async (
    id: string,
    name: string
  ) => {
    if (
      !confirm(
        `Delete user "${name}"?`
      )
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          `/api/users/${id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete user"
        );
      }

      setUsers((prev) =>
        prev.filter(
          (user) =>
            user._id !== id
        )
      );

      showToast.success(
        "User deleted successfully"
      );
    } catch (error) {
      showToast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete user"
      );
    }
  };

  // ─────────────────────────────────────────
  // Tabs
  // ─────────────────────────────────────────

  const tabs: {
    id: Tab;
    label: string;
    icon: React.ElementType;
  }[] = [
    {
      id: "password",
      label: "Change Password",
      icon: Key,
    },
    {
      id: "email",
      label: "Change Email",
      icon: Mail,
    },
    {
      id: "users",
      label: "User Management",
      icon: Users,
    },
  ];

  const ROLE_COLORS: Record<
    string,
    string
  > = {
    admin: "var(--red)",
    faculty: "var(--accent)",
    core: "var(--purple, var(--accent))",
    member: "var(--green)",
  };

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div
        style={{
          marginBottom: "1.75rem",
        }}
      >
        <h1
          style={{
            fontSize: "1.65rem",
            marginBottom: "0.2rem",
          }}
        >
          Settings
        </h1>

        <p
          style={{
            color: "var(--text2)",
            fontSize: "0.875rem",
          }}
        >
          Account security and access
          management
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        {tabs.map((tabItem) => {
          const Icon = tabItem.icon;

          return (
            <button
              key={tabItem.id}
              onClick={() =>
                setTab(tabItem.id)
              }
              className={`btn ${
                tab === tabItem.id
                  ? "btn-primary"
                  : "btn-ghost"
              } btn-sm`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Icon size={14} />
              {tabItem.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════
          PASSWORD
      ═══════════════════════════════════════ */}

      {tab === "password" && (
        <div
          className="card card-p-lg"
          style={{
            maxWidth: 480,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background:
                  "var(--accent-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Key
                size={18}
                color="var(--accent)"
              />
            </div>

            <div>
              <h3
                style={{
                  fontSize: "1rem",
                }}
              >
                Change Password
              </h3>

              <p
                style={{
                  color: "var(--text2)",
                  fontSize: "0.82rem",
                }}
              >
                Requires your current password
              </p>
            </div>
          </div>

          <FormField label="Your Email">
            <input
              type="email"
              className="input"
              value={pw.email}
              onChange={(e) =>
                setPw((prev) => ({
                  ...prev,
                  email:
                    e.target.value,
                }))
              }
              placeholder="admin@aiclub.in"
            />
          </FormField>

          <PwField
            label="Current Password"
            value={pw.current}
            onChange={(value) =>
              setPw((prev) => ({
                ...prev,
                current: value,
              }))
            }
          />

          <PwField
            label="New Password (min 8 chars)"
            value={pw.newPw}
            onChange={(value) =>
              setPw((prev) => ({
                ...prev,
                newPw: value,
              }))
            }
            placeholder="New password"
          />

          <PwField
            label="Confirm New Password"
            value={pw.confirm}
            onChange={(value) =>
              setPw((prev) => ({
                ...prev,
                confirm: value,
              }))
            }
          />

          {pw.newPw &&
            pw.confirm &&
            pw.newPw !== pw.confirm && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--red)",
                  marginBottom: "0.75rem",
                }}
              >
                ✗ Passwords do not match
              </p>
            )}

          <button
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
            }}
            onClick={handlePw}
            disabled={pwLoading}
          >
            {pwLoading ? (
              <>
                <Spinner size="sm" />
                Updating…
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════
          EMAIL
      ═══════════════════════════════════════ */}

      {tab === "email" && (
        <div
          className="card card-p-lg"
          style={{
            maxWidth: 480,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background:
                  "var(--green-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Mail
                size={18}
                color="var(--green)"
              />
            </div>

            <div>
              <h3
                style={{
                  fontSize: "1rem",
                }}
              >
                Change Email
              </h3>

              <p
                style={{
                  color: "var(--text2)",
                  fontSize: "0.82rem",
                }}
              >
                Update your login email
              </p>
            </div>
          </div>

          <FormField label="Current Email">
            <input
              type="email"
              className="input"
              value={em.currentEmail}
              onChange={(e) =>
                setEm((prev) => ({
                  ...prev,
                  currentEmail:
                    e.target.value,
                }))
              }
            />
          </FormField>

          <FormField label="New Email">
            <input
              type="email"
              className="input"
              value={em.newEmail}
              onChange={(e) =>
                setEm((prev) => ({
                  ...prev,
                  newEmail:
                    e.target.value,
                }))
              }
            />
          </FormField>

          <PwField
            label="Confirm with Password"
            value={em.password}
            onChange={(value) =>
              setEm((prev) => ({
                ...prev,
                password: value,
              }))
            }
          />

          <button
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
            }}
            onClick={handleEm}
            disabled={emLoading}
          >
            {emLoading ? (
              <>
                <Spinner size="sm" />
                Updating…
              </>
            ) : (
              "Update Email"
            )}
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════
          USER MANAGEMENT
      ═══════════════════════════════════════ */}

      {tab === "users" && (
        <div>
          {/* Role Cards */}
          <div
            className="grid-4"
            style={{
              marginBottom: "1.5rem",
            }}
          >
            {ROLE_CONFIG.map((role) => (
              <div
                key={role.role}
                className="card"
                style={{
                  padding: "1rem",
                  borderLeft: `3px solid ${role.color}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    marginBottom: "0.35rem",
                  }}
                >
                  <Shield
                    size={14}
                    color={role.color}
                  />

                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      color: role.color,
                    }}
                  >
                    {role.label}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--text2)",
                    lineHeight: 1.4,
                  }}
                >
                  {role.description}
                </p>
              </div>
            ))}
          </div>

          {/* User Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "1rem",
                  marginBottom: "0.2rem",
                }}
              >
                Users ({users.length})
              </h3>

              <p
                style={{
                  color: "var(--text3)",
                  fontSize: "0.74rem",
                }}
              >
                Manage admin panel accounts and
                permissions
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
              }}
            >
              <button
                className="btn btn-ghost btn-sm"
                onClick={loadUsers}
                title="Refresh users"
              >
                <RefreshCw
                  size={13}
                  style={{
                    animation: loadingUsers
                      ? "spin 1s linear infinite"
                      : "none",
                  }}
                />
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={() =>
                  setModal(null)
                }
              >
                <Plus size={13} />
                Add User
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div
            className="card"
            style={{
              overflow: "hidden",
            }}
          >
            {loadingUsers ? (
              <div
                style={{
                  padding: "3rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Spinner />
              </div>
            ) : users.length === 0 ? (
              <div
                style={{
                  padding: "3rem",
                  textAlign: "center",
                  color: "var(--text2)",
                }}
              >
                <Users
                  size={30}
                  style={{
                    margin:
                      "0 auto 0.75rem",
                    opacity: 0.5,
                  }}
                />

                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                  }}
                >
                  No users yet
                </div>

                <p
                  style={{
                    fontSize: "0.78rem",
                  }}
                >
                  Create an admin panel account
                  to get started.
                </p>
              </div>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Access</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user, index) => {
                      const roleColor =
                        ROLE_COLORS[user.role] ||
                        "var(--text3)";

                      const enabledCount =
                        PERMISSIONS.filter(
                          (permission) =>
                            user.permissions?.[
                              permission.key
                            ]
                        ).length;

                      return (
                        <tr key={user._id}>
                          {/* User */}
                          <td>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.65rem",
                              }}
                            >
                              <Avatar
                                name={user.name}
                                size="sm"
                                index={index}
                              />

                              <div>
                                <div
                                  style={{
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {user.name}
                                </div>

                                <div
                                  style={{
                                    fontSize: "0.72rem",
                                    color:
                                      "var(--text3)",
                                  }}
                                >
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td>
                            <div
                              style={{
                                display: "flex",
                                flexDirection:
                                  "column",
                                gap: 4,
                              }}
                            >
                              <span
                                className="badge"
                                style={{
                                  width: "fit-content",
                                  background: `${roleColor}18`,
                                  color: roleColor,
                                  border: `1px solid ${roleColor}30`,
                                  textTransform:
                                    "capitalize",
                                }}
                              >
                                {user.role === "core"
                                  ? "Core Member"
                                  : user.role ===
                                    "faculty"
                                  ? "Faculty"
                                  : user.role}
                              </span>

                              {user.role ===
                                "faculty" &&
                                user.facultyPosition && (
                                  <span
                                    style={{
                                      fontSize:
                                        "0.68rem",
                                      color:
                                        "var(--text3)",
                                    }}
                                  >
                                    {user.facultyPosition ===
                                    "faculty_head"
                                      ? "Faculty Head"
                                      : "Club Instructor"}
                                  </span>
                                )}
                            </div>
                          </td>

                          {/* Access */}
                          <td>
                            {user.role ===
                            "admin" ? (
                              <span
                                style={{
                                  fontSize:
                                    "0.75rem",
                                  color:
                                    "var(--red)",
                                  fontWeight: 600,
                                }}
                              >
                                Full Access
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize:
                                    "0.75rem",
                                  color:
                                    "var(--text2)",
                                }}
                              >
                                {enabledCount} /{" "}
                                {PERMISSIONS.length}{" "}
                                sections
                              </span>
                            )}
                          </td>

                          {/* Created */}
                          <td
                            style={{
                              fontSize:
                                "0.78rem",
                              color:
                                "var(--text3)",
                            }}
                          >
                            {new Date(
                              user.createdAt
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </td>

                          {/* Actions */}
                          <td>
                            <div
                              style={{
                                display: "flex",
                                gap: 4,
                              }}
                            >
                              <button
                                onClick={() =>
                                  setModal(user)
                                }
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Edit user"
                              >
                                <Edit size={13} />
                              </button>

                              <button
                                onClick={() =>
                                  delUser(
                                    user._id,
                                    user.name
                                  )
                                }
                                className="btn btn-danger btn-icon btn-sm"
                                title="Delete user"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Modal */}
      <Modal
        open={modal !== undefined}
        onClose={() =>
          setModal(undefined)
        }
        title={
          modal?._id
            ? "Edit User"
            : "Create User"
        }
      >
        <UserModal
          user={modal}
          onClose={() =>
            setModal(undefined)
          }
          onSave={handleUserSave}
        />
      </Modal>

      {/* Spinner Animation */}
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}