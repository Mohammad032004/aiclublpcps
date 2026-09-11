"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Lock,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "lucide-react";

type UserRole =
  | "admin"
  | "faculty"
  | "core"
  | "member";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  facultyPosition?: string | null;
};

type MessageState = {
  type: "success" | "error" | "";
  text: string;
};

// ─────────────────────────────────────────────
// Role Label
// ─────────────────────────────────────────────

function getRoleLabel(user: CurrentUser) {
  if (user.role === "admin") {
    return "Admin";
  }

  if (user.role === "faculty") {
    if (user.facultyPosition === "faculty_head") {
      return "Faculty Head";
    }

    if (user.facultyPosition === "club_instructor") {
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
// Main Page
// ─────────────────────────────────────────────

export default function MyAccountPage() {
  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [loading, setLoading] = useState(true);

  // Name
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Email
  const [email, setEmail] = useState("");
  const [emailPassword, setEmailPassword] =
    useState("");
  const [savingEmail, setSavingEmail] =
    useState(false);

  // Password
  const [currentPassword, setCurrentPassword] =
    useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [savingPassword, setSavingPassword] =
    useState(false);

  // Messages
  const [nameMessage, setNameMessage] =
    useState<MessageState>({
      type: "",
      text: "",
    });

  const [emailMessage, setEmailMessage] =
    useState<MessageState>({
      type: "",
      text: "",
    });

  const [passwordMessage, setPasswordMessage] =
    useState<MessageState>({
      type: "",
      text: "",
    });

  // ─────────────────────────────────────────
  // Load Current User
  // ─────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const response = await fetch(
          "/api/auth/session",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load account."
          );
        }

        const data = await response.json();

        if (!mounted) return;

        if (
          !data?.authenticated ||
          !data?.user
        ) {
          window.location.href = "/login";
          return;
        }

        const currentUser =
          data.user as CurrentUser;

        setUser(currentUser);
        setName(currentUser.name || "");
        setEmail(currentUser.email || "");
      } catch (error) {
        console.error(
          "Account loading error:",
          error
        );

        if (mounted) {
          window.location.href = "/login";
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  // ─────────────────────────────────────────
  // Update Name
  // ─────────────────────────────────────────

  const handleNameUpdate = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setNameMessage({
      type: "",
      text: "",
    });

    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameMessage({
        type: "error",
        text: "Name is required.",
      });
      return;
    }

    if (trimmedName.length < 2) {
      setNameMessage({
        type: "error",
        text: "Name must contain at least 2 characters.",
      });
      return;
    }

    if (trimmedName.length > 100) {
      setNameMessage({
        type: "error",
        text: "Name cannot exceed 100 characters.",
      });
      return;
    }

    if (user && trimmedName === user.name) {
      setNameMessage({
        type: "error",
        text: "This is already your current name.",
      });
      return;
    }

    setSavingName(true);

    try {
      const response = await fetch(
        "/api/auth/update-profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to update name."
        );
      }

      if (data?.user) {
        const updatedUser =
          data.user as CurrentUser;

        setUser(updatedUser);
        setName(updatedUser.name || "");
        setEmail(updatedUser.email || "");
      }

      setNameMessage({
        type: "success",
        text: "Name updated successfully.",
      });
    } catch (error) {
      setNameMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to update name.",
      });
    } finally {
      setSavingName(false);
    }
  };

  // ─────────────────────────────────────────
  // Update Email
  // ─────────────────────────────────────────

  const handleEmailUpdate = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setEmailMessage({
      type: "",
      text: "",
    });

    const newEmail =
      email.trim().toLowerCase();

    if (!newEmail) {
      setEmailMessage({
        type: "error",
        text: "Email address is required.",
      });
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        newEmail
      )
    ) {
      setEmailMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    if (!emailPassword) {
      setEmailMessage({
        type: "error",
        text: "Enter your current password.",
      });
      return;
    }

    if (
      user &&
      newEmail === user.email.toLowerCase()
    ) {
      setEmailMessage({
        type: "error",
        text: "This is already your current email.",
      });
      return;
    }

    setSavingEmail(true);

    try {
      const response = await fetch(
        "/api/auth/change-email",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            newEmail,
            password: emailPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to update email."
        );
      }

      if (data?.user) {
        const updatedUser =
          data.user as CurrentUser;

        setUser(updatedUser);
        setName(updatedUser.name || "");
        setEmail(updatedUser.email || "");
      }

      setEmailPassword("");

      setEmailMessage({
        type: "success",
        text: "Email updated successfully.",
      });
    } catch (error) {
      setEmailMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to update email.",
      });
    } finally {
      setSavingEmail(false);
    }
  };

  // ─────────────────────────────────────────
  // Change Password
  // ─────────────────────────────────────────

  const handlePasswordUpdate = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setPasswordMessage({
      type: "",
      text: "",
    });

    if (!currentPassword) {
      setPasswordMessage({
        type: "error",
        text: "Enter your current password.",
      });
      return;
    }

    if (!newPassword) {
      setPasswordMessage({
        type: "error",
        text: "Enter a new password.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "Password must be at least 8 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Passwords do not match.",
      });
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordMessage({
        type: "error",
        text: "New password must be different from your current password.",
      });
      return;
    }

    setSavingPassword(true);

    try {
      const response = await fetch(
        "/api/auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to change password."
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordMessage({
        type: "success",
        text: "Password changed successfully.",
      });
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to change password.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  // ─────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────

  if (loading) {
    return (
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text2)",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            border: "3px solid var(--border2)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation:
              "account-spin 0.8s linear infinite",
          }}
        />

        <style>{`
          @keyframes account-spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <div
      style={{
        maxWidth: 760,
        margin: "0 auto",
        paddingBottom: "2rem",
      }}
    >
      {/* Header */}

      <div
        style={{
          marginBottom: "1.25rem",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily:
              "'Space Grotesk', sans-serif",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--text1)",
          }}
        >
          My Account
        </h1>

        <p
          style={{
            margin: "0.25rem 0 0",
            fontSize: "0.78rem",
            color: "var(--text3)",
          }}
        >
          Manage your account information
        </p>
      </div>

      {/* User Info */}

      <div
        className="card"
        style={{
          padding: "1rem",
          marginBottom: "0.85rem",
          display: "flex",
          alignItems: "center",
          gap: "0.85rem",
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: "var(--accent)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.9rem",
            flexShrink: 0,
          }}
        >
          {user.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.9rem",
              color: "var(--text1)",
            }}
          >
            {user.name}
          </div>

          <div
            style={{
              fontSize: "0.72rem",
              color: "var(--text3)",
              marginTop: 2,
            }}
          >
            {user.email}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "0.35rem 0.55rem",
            borderRadius: 7,
            background: "var(--surface2)",
            border: "1px solid var(--border2)",
            color: "var(--text2)",
            fontSize: "0.68rem",
            fontWeight: 600,
          }}
        >
          <Shield size={12} />
          {getRoleLabel(user)}
        </div>
      </div>

      {/* Personal Information */}

      <div
        className="card"
        style={{
          padding: "1rem",
          marginBottom: "0.85rem",
        }}
      >
        <SectionTitle
          icon={<User size={16} />}
          title="Personal Information"
        />

        <form onSubmit={handleNameUpdate}>
          <div
            style={{
              display: "flex",
              gap: "0.6rem",
            }}
          >
            <div
              style={{
                position: "relative",
                flex: 1,
              }}
            >
              <User
                size={15}
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  color: "var(--text3)",
                }}
              />

              <input
                className="input"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Full name"
                style={{
                  width: "100%",
                  paddingLeft: 35,
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingName}
            >
              <Save size={14} />

              {savingName
                ? "Saving..."
                : "Save"}
            </button>
          </div>

          {nameMessage.text && (
            <Message message={nameMessage} />
          )}
        </form>
      </div>

      {/* Email */}

      <div
        className="card"
        style={{
          padding: "1rem",
          marginBottom: "0.85rem",
        }}
      >
        <SectionTitle
          icon={<Mail size={16} />}
          title="Email Address"
        />

        <form onSubmit={handleEmailUpdate}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "0.6rem",
            }}
          >
            <div
              style={{
                position: "relative",
              }}
            >
              <Mail
                size={15}
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  color: "var(--text3)",
                }}
              />

              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Email address"
                style={{
                  width: "100%",
                  paddingLeft: 35,
                }}
              />
            </div>

            <input
              type="password"
              className="input"
              value={emailPassword}
              onChange={(e) =>
                setEmailPassword(
                  e.target.value
                )
              }
              placeholder="Current password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={savingEmail}
            style={{
              marginTop: "0.6rem",
            }}
          >
            <Mail size={14} />

            {savingEmail
              ? "Updating..."
              : "Update Email"}
          </button>

          {emailMessage.text && (
            <Message message={emailMessage} />
          )}
        </form>
      </div>

      {/* Password */}

      <div
        className="card"
        style={{
          padding: "1rem",
        }}
      >
        <SectionTitle
          icon={<Lock size={16} />}
          title="Change Password"
        />

        <form onSubmit={handlePasswordUpdate}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr 1fr",
              gap: "0.6rem",
            }}
          >
            <PasswordInput
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Current password"
              visible={showCurrentPassword}
              onToggle={() =>
                setShowCurrentPassword(
                  !showCurrentPassword
                )
              }
            />

            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              placeholder="New password"
              visible={showNewPassword}
              onToggle={() =>
                setShowNewPassword(
                  !showNewPassword
                )
              }
            />

            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm password"
              visible={showConfirmPassword}
              onToggle={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={savingPassword}
            style={{
              marginTop: "0.6rem",
            }}
          >
            <Lock size={14} />

            {savingPassword
              ? "Changing..."
              : "Change Password"}
          </button>

          {passwordMessage.text && (
            <Message
              message={passwordMessage}
            />
          )}
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Section Title
// ─────────────────────────────────────────────

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.45rem",
        marginBottom: "0.8rem",
        color: "var(--text1)",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          color: "var(--accent)",
        }}
      >
        {icon}
      </span>

      <h2
        style={{
          margin: 0,
          fontFamily:
            "'Space Grotesk', sans-serif",
          fontSize: "0.9rem",
          fontWeight: 700,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

// ─────────────────────────────────────────────
// Password Input
// ─────────────────────────────────────────────

function PasswordInput({
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <input
        type={visible ? "text" : "password"}
        className="input"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        style={{
          width: "100%",
          paddingRight: 38,
        }}
      />

      <button
        type="button"
        onClick={onToggle}
        style={{
          position: "absolute",
          right: 7,
          top: "50%",
          transform:
            "translateY(-50%)",
          border: "none",
          background: "transparent",
          color: "var(--text3)",
          cursor: "pointer",
          padding: 5,
          display: "flex",
        }}
        aria-label={
          visible
            ? "Hide password"
            : "Show password"
        }
      >
        {visible ? (
          <EyeOff size={15} />
        ) : (
          <Eye size={15} />
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Message
// ─────────────────────────────────────────────

function Message({
  message,
}: {
  message: MessageState;
}) {
  if (!message.text) return null;

  const success =
    message.type === "success";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        marginTop: "0.6rem",
        padding: "0.55rem 0.65rem",
        borderRadius: 7,
        background: success
          ? "rgba(34,197,94,0.08)"
          : "rgba(239,68,68,0.08)",
        border: `1px solid ${
          success
            ? "rgba(34,197,94,0.2)"
            : "rgba(239,68,68,0.2)"
        }`,
        color: success
          ? "var(--green)"
          : "var(--red)",
        fontSize: "0.72rem",
      }}
    >
      {success ? (
        <CheckCircle2 size={14} />
      ) : (
        <AlertCircle size={14} />
      )}

      <span>{message.text}</span>
    </div>
  );
}