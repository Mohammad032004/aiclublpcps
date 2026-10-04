"use client";

import { ArrowLeft, CheckCircle, LockKeyhole } from "lucide-react";

export default function ApplyPage() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6rem 1.5rem 4rem",
      }}
    >
      <div
        className="card card-p-lg"
        style={{
          maxWidth: 650,
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            background: "var(--accent-bg)",
            border: "2px solid var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}
        >
          <LockKeyhole
            size={38}
            color="var(--accent2)"
          />
        </div>

        {/* Status Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.4rem 0.9rem",
            borderRadius: 100,
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            color: "var(--text2)",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            marginBottom: "1.2rem",
          }}
        >
          <CheckCircle size={14} />
          BATCH 2026 · MEMBERS SELECTED
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: "2.1rem",
            marginBottom: "1rem",
            lineHeight: 1.2,
          }}
        >
          AI Club Registration is Closed
        </h1>

        {/* Main Message */}
        <p
          style={{
            color: "var(--text2)",
            lineHeight: 1.8,
            marginBottom: "1rem",
          }}
        >
          Thank you for your interest in joining the{" "}
          <strong style={{ color: "var(--text1)" }}>
            AI Club
          </strong>
          .
        </p>

        <p
          style={{
            color: "var(--text2)",
            lineHeight: 1.8,
            marginBottom: "1.5rem",
          }}
        >
          Applications for{" "}
          <strong style={{ color: "var(--accent2)" }}>
            Batch 2026
          </strong>{" "}
          are officially closed. The recruitment process, including
          the test and interview rounds, has been completed and the
          new members have been selected.
        </p>

        {/* Success Box */}
        <div
          style={{
            background: "var(--green-bg)",
            border: "1px solid var(--green)",
            borderRadius: "var(--radius)",
            padding: "1.1rem 1.25rem",
            marginBottom: "1.5rem",
            textAlign: "left",
            display: "flex",
            gap: "0.8rem",
            alignItems: "flex-start",
          }}
        >
          <CheckCircle
            size={20}
            color="var(--green)"
            style={{
              flexShrink: 0,
              marginTop: 2,
            }}
          />

          <div
            style={{
              color: "var(--text2)",
              lineHeight: 1.7,
              fontSize: "0.9rem",
            }}
          >
            <strong style={{ color: "var(--text1)" }}>
              Selection Completed
            </strong>
            <br />
            The AI Club Batch 2026 members have been finalized.
          </div>
        </div>

        {/* What's Next */}
        <div
          className="alert alert-info"
          style={{
            textAlign: "left",
            marginBottom: "1.75rem",
          }}
        >
          <span>ℹ</span>

          <span>
            Stay connected with the AI Club for upcoming workshops,
            hackathons, technical sessions, events, and future
            recruitment opportunities.
          </span>
        </div>

        {/* Footer Message */}
        <p
          style={{
            color: "var(--text3)",
            fontSize: "0.85rem",
            lineHeight: 1.7,
            marginBottom: "1.5rem",
          }}
        >
          We appreciate everyone who participated in the recruitment
          process and showed interest in becoming a part of the AI
          Club community. ❤️
        </p>

        {/* Back Button */}
        <button
          className="btn btn-outline"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    </div>
  );
}
