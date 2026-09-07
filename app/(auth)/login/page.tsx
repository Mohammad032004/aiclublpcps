"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

/**
 * LOGIN PAGE — route: /login
 * Clean white authentication page.
 * Role is determined by the backend after authentication.
 */

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials. Please try again.");
        return;
      }

      const next = searchParams.get("next");

      router.push(
        next && next.startsWith("/admin")
          ? next
          : "/admin/dashboard"
      );

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#dfdcdc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
        }}
      >
        {/* Logo + Brand */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "34px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              margin: "0 auto 18px",
              position: "relative",
            }}
          >
            <Image
              src="/ai-club-logo.png"
              alt="AI Club"
              fill
              priority
              style={{
                objectFit: "contain",
              }}
            />
          </div>

          <h1
            style={{
              margin: 0,
              color: "#111827",
              fontSize: "25px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              fontFamily: "'Syne', sans-serif",
            }}
          >
            Artificial Intelligence Club
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Learn. Build. Innovate.
          </p>
        </div>

        {/* Login Card */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "20px",
            padding: "32px",
            boxShadow:
              "0 12px 40px rgba(15, 23, 42, 0.07)",
          }}
        >
          {/* Heading */}
          <div style={{ marginBottom: "26px" }}>
            <h2
              style={{
                margin: 0,
                color: "#111827",
                fontSize: "21px",
                fontWeight: 750,
                letterSpacing: "-0.02em",
              }}
            >
              Welcome back
            </h2>

            <p
              style={{
                margin: "7px 0 0",
                color: "#6b7280",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              Sign in to access your AI Club account.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: "18px" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#374151",
                  fontSize: "13px",
                  fontWeight: 650,
                }}
              >
                Email address
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >
                <Mail
                  size={17}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                    pointerEvents: "none",
                  }}
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "46px",
                    boxSizing: "border-box",
                    padding: "0 14px 0 42px",
                    borderRadius: "11px",
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#111827",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#374151",
                  fontSize: "13px",
                  fontWeight: 650,
                }}
              >
                Password
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >
                <Lock
                  size={17}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                    pointerEvents: "none",
                  }}
                />

                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "46px",
                    boxSizing: "border-box",
                    padding: "0 44px 0 42px",
                    borderRadius: "11px",
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#111827",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  aria-label={
                    showPw
                      ? "Hide password"
                      : "Show password"
                  }
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "28px",
                    height: "28px",
                    background: "transparent",
                    border: "none",
                    color: "#9ca3af",
                    cursor: "pointer",
                  }}
                >
                  {showPw ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  padding: "11px 12px",
                  marginBottom: "18px",
                  borderRadius: "10px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  fontSize: "13px",
                  lineHeight: 1.45,
                }}
              >
                <AlertCircle
                  size={16}
                  style={{
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                />

                <span>{error}</span>
              </div>
            )}

            {/* Sign In */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "48px",
                border: "none",
                borderRadius: "11px",
                background: loading
                  ? "#93c5fd"
                  : "#111827",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s ease",
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid rgba(255,255,255,0.35)",
                      borderTopColor: "#ffffff",
                      borderRadius: "50%",
                      animation:
                        "loginSpin 0.8s linear infinite",
                      display: "inline-block",
                    }}
                  />

                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              marginTop: "22px",
              color: "#9ca3af",
              fontSize: "11px",
            }}
          >
            <ShieldCheck size={14} />

            <span>
              Secure access for authorized AI Club members
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
            color: "#9ca3af",
            fontSize: "11px",
          }}
        >
          <div>
            Artificial Intelligence Research & Development Cell
          </div>

          <div style={{ marginTop: "6px" }}>
            Developed by Irfan Ansari
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loginSpin {
          to {
            transform: rotate(360deg);
          }
        }

        input:focus {
          border-color: #111827 !important;
          box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
        }

        input::placeholder {
          color: #9ca3af;
        }

        button[type="submit"]:hover:not(:disabled) {
          background: #00c01a !important;
        }
      `}</style>
    </div>
  );
}