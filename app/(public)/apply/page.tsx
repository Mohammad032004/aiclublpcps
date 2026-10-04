"use client";

import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  User,
  BookOpen,
  Code2,
  FileText,
} from "lucide-react";

import {
  SectionHeader,
  FormField,
  showToast,
  Spinner,
} from "@/components/ui";

interface F {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  github: string;
  linkedin: string;
  branch: string;
  year: string;
  certifications: string;
  skills: string[];
  domains: string[];
  experience: string;
  projectDesc: string;
  whyJoin: string;
  contribution: string;
  goals: string;
}

const INIT: F = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "",
  github: "",
  linkedin: "",
  branch: "",
  year: "",
  certifications: "",
  skills: [],
  domains: [],
  experience: "",
  projectDesc: "",
  whyJoin: "",
  contribution: "",
  goals: "",
};

const SKILLS = [
  "Python",
  "JavaScript",
  "TypeScript",
  "C++",
  "Java",
  "R",
  "SQL",
  "TensorFlow",
  "PyTorch",
  "Scikit-learn",
  "HuggingFace",
  "LangChain",
  "React",
  "Next.js",
  "Docker",
  "Git",
  "Linux",
  "CUDA",
];

const DOMAINS = [
  "Machine Learning",
  "Deep Learning",
  "NLP & LLMs",
  "Computer Vision",
  "Reinforcement Learning",
  "Cybersecurity",
  "Web Development",
  "Data Science",
  "MLOps",
  "Research",
];

const STEPS = [
  { label: "Personal", icon: User },
  { label: "Academics", icon: BookOpen },
  { label: "Skills", icon: Code2 },
  { label: "Statement", icon: FileText },
];

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<F>(INIT);
  const [errors, setErrors] = useState<Partial<F>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const up = (k: keyof F, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const toggle = (k: "skills" | "domains", v: string) =>
    setForm((p) => ({
      ...p,
      [k]: p[k].includes(v)
        ? p[k].filter((x) => x !== v)
        : [...p[k], v],
    }));

  const validate = () => {
    const e: Partial<Record<keyof F, string>> = {};

    if (step === 0) {
      if (!form.firstName.trim()) e.firstName = "Required";

      if (!form.lastName.trim()) e.lastName = "Required";

      if (!form.email.trim()) {
        e.email = "Required";
      } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) {
        e.email = "Valid email required";
      }

      if (!form.phone.trim()) {
        e.phone = "Required";
      } else if (!/^\d{10}$/.test(form.phone)) {
        e.phone = "Phone number must be exactly 10 digits";
      }
    }

    if (step === 1) {
      if (!form.branch.trim()) e.branch = "Required";
      if (!form.year) e.year = "Required";
    }

    if (step === 3) {
      if (form.whyJoin.trim().length < 30) {
        e.whyJoin = "Please write at least 30 characters";
      }

      if (form.contribution.trim().length < 30) {
        e.contribution = "Please write at least 30 characters";
      }
    }

    setErrors(e as Partial<F>);

    return Object.keys(e).length === 0;
  };

  const next = async () => {
    if (!validate()) {
      showToast.error(
        "Please fill all required fields before continuing."
      );
      return;
    }

    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const d = await res.json();

      if (!res.ok) {
        throw new Error(d.error || "Submission failed");
      }

      setSubmitted(true);
    } catch (e: unknown) {
      showToast.error(
        e instanceof Error ? e.message : "Submission failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     APPLICATION SUBMITTED
  ================================= */

  if (submitted) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 520,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "var(--green-bg)",
              border: "2px solid var(--green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.75rem",
            }}
          >
            <CheckCircle size={40} color="var(--green)" />
          </div>

          <h2
            style={{
              fontSize: "2rem",
              marginBottom: "1rem",
            }}
          >
            Application Submitted!
          </h2>

          <p
            style={{
              color: "var(--text2)",
              lineHeight: 1.75,
              marginBottom: "0.75rem",
            }}
          >
            Thank you,{" "}
            <strong style={{ color: "var(--text1)" }}>
              {form.firstName}
            </strong>
            ! Your application for Batch 2026 has been received.
          </p>

          <p
            style={{
              color: "var(--text2)",
              lineHeight: 1.75,
              marginBottom: "2rem",
            }}
          >
            We'll review and respond to{" "}
            <strong style={{ color: "var(--accent2)" }}>
              {form.email}
            </strong>{" "}
            within 3 working days.
          </p>

          <div
            style={{
              background: "var(--accent-bg)",
              border: "1px solid var(--accent-border)",
              borderRadius: "var(--radius)",
              padding: "1rem 1.25rem",
              marginBottom: "2rem",
              fontSize: "0.875rem",
              color: "var(--text2)",
              lineHeight: 1.7,
              textAlign: "left",
            }}
          >
            <strong style={{ color: "var(--accent2)" }}>
              What's next?
            </strong>{" "}
            Shortlisted candidates will be invited for a test followed
            by a short technical/cultural interview over the next 2
            weeks.
          </div>

          <button
            className="btn btn-outline"
            onClick={() => {
              setSubmitted(false);
              setStep(0);
              setForm(INIT);
            }}
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  /* ================================
     REGISTRATION CLOSED PAGE
  ================================= */

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
          maxWidth: 620,
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
            fontSize: "2rem",
          }}
        >
          🔒
        </div>

        {/* Status */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "0.4rem 0.9rem",
            borderRadius: 100,
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            color: "var(--text2)",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            marginBottom: "1rem",
          }}
        >
          APPLICATIONS CLOSED
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: "2rem",
            marginBottom: "1rem",
          }}
        >
          AI Club Registration is Closed
        </h1>

        {/* Description */}
        <p
          style={{
            color: "var(--text2)",
            lineHeight: 1.8,
            marginBottom: "1rem",
          }}
        >
          Thank you for your interest in joining the AI Club.
          Applications for{" "}
          <strong style={{ color: "var(--text1)" }}>
            Batch 2026
          </strong>{" "}
          are now closed.
        </p>

        <p
          style={{
            color: "var(--text3)",
            lineHeight: 1.7,
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
          }}
        >
          The registration period has ended. If you have already
          submitted your application, please wait for further
          communication from the AI Club team.
        </p>

        {/* Information box */}
        <div
          className="alert alert-info"
          style={{
            textAlign: "left",
            marginBottom: "1.5rem",
          }}
        >
          <span>ℹ</span>

          <span>
            Shortlisted candidates will be contacted through their
            registered email or official AI Club communication
            channels.
          </span>
        </div>

        {/* Back button */}
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
