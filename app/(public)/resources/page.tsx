"use client";

import { useState, useEffect } from "react";

import {
  SectionHeader,
  Card,
  Spinner,
  EmptyState,
  StatusBadge,
} from "@/components/ui";

import {
  FileText,
  Video,
  BookOpen,
  Link as LinkIcon,
  Download,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";

import { resourcesApi } from "@/lib/api";

interface Resource {
  _id: string;
  title: string;
  description?: string;
  category: string;
  type: string;
  url?: string;
  fileSize?: string;
  access: "public" | "members";
  views: number;
  downloads: number;
}

const CATS = [
  "All",
  "ai_ml",
  "web_dev",
  "cybersecurity",
  "research",
  "career",
];

const CAT_LABELS: Record<string, string> = {
  ai_ml: "AI/ML",
  web_dev: "Web Development",
  cybersecurity: "Cybersecurity",
  research: "Research",
  career: "Career",
};

const TYPE_ICONS: Record<
  string,
  React.ComponentType<{
    size?: number;
    color?: string;
  }>
> = {
  pdf: FileText,
  video: Video,
  guide: BookOpen,
  notebook: BookOpen,
  link: LinkIcon,
};

const TYPE_COLORS: Record<string, string> = {
  pdf: "var(--red)",
  video: "var(--purple)",
  guide: "var(--green)",
  notebook: "var(--orange)",
  link: "var(--cyan)",
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [cat, setCat] = useState("All");

  useEffect(() => {
    fetch("/api/resources?access=all", {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) =>
        setResources(d.resources || [])
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = resources.filter(
    (r) =>
      cat === "All" ||
      r.category === cat
  );

  /*
   * Track resource interaction.
   *
   * Link resources → view
   * Other resources → download
   *
   * The statistics are NOT displayed to users.
   * They are only used for admin analytics.
   */
  const handleResourceAction = async (
    resource: Resource,
    action: "view" | "download"
  ) => {
    if (!resource.url) return;

    /*
     * Open immediately to prevent popup blockers.
     */
    let newWindow: Window | null = null;

    newWindow = window.open(
      resource.url,
      "_blank",
      "noopener,noreferrer"
    );

    /*
     * Track the interaction in the background.
     */
    try {
      const result =
        await resourcesApi.track(
          resource._id,
          action
        );

      /*
       * Keep the local data updated.
       *
       * These values are intentionally NOT
       * displayed on the public page.
       */
      setResources((current) =>
        current.map((item) =>
          item._id === resource._id
            ? {
                ...item,
                views: result.views,
                downloads:
                  result.downloads,
              }
            : item
        )
      );
    } catch {
      /*
       * Analytics failure should never
       * prevent resource access.
       */
    }

    /*
     * Popup fallback.
     */
    if (!newWindow) {
      window.location.href = resource.url;
    }
  };

  return (
    <div className="page-hero">
      <div className="container">

        {/* =========================
            HEADER
        ========================= */}

        <SectionHeader
          tag="Resources"
          title="Curated Learning Materials"
          subtitle="Notes, recordings, guides, and research papers from our team."
        />

        {/* =========================
            CATEGORY FILTERS
        ========================= */}

        <div
          style={{
            display: "flex",
            gap: "0.55rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "2.5rem",
          }}
        >
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`btn btn-sm ${
                cat === c
                  ? "btn-primary"
                  : "btn-ghost"
              }`}
            >
              {c === "All"
                ? "All"
                : CAT_LABELS[c] || c}
            </button>
          ))}
        </div>

        {/* =========================
            LOADING
        ========================= */}

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "5rem",
            }}
          >
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No resources yet"
            description="Resources added by admin will appear here."
          />
        ) : (
          /* =========================
             RESOURCE GRID
          ========================= */

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.4rem",
            }}
          >
            {filtered.map((r) => {
              const Icon =
                TYPE_ICONS[r.type] ||
                FileText;

              const color =
                TYPE_COLORS[r.type] ||
                "var(--accent)";

              const isLink =
                r.type === "link";

              return (
                <Card
                  key={r._id}
                  hover
                  style={{
                    padding: 0,
                    overflow: "hidden",
                    border:
                      "1px solid var(--accent-border)",
                    borderRadius: 20,
                    background:
                      "var(--surface)",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 300,
                    transition:
                      "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  {/* =========================
                      CARD CONTENT
                  ========================= */}

                  <div
                    style={{
                      padding: "1.5rem",
                      flex: 1,
                    }}
                  >
                    {/* Top */}
                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "flex-start",
                        justifyContent:
                          "space-between",
                        gap: "1rem",
                        marginBottom:
                          "1.25rem",
                      }}
                    >
                      {/* Icon */}
                      <div
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: 16,
                          background: `${color}12`,
                          border: `1px solid ${color}30`,
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon
                          size={24}
                          color={color}
                        />
                      </div>

                      {/* Access */}
                      <StatusBadge
                        status={r.access}
                      />
                    </div>

                    {/* =========================
                        CATEGORY
                    ========================= */}

                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: "0.5rem",
                        marginBottom:
                          "0.55rem",
                      }}
                    >
                      <span
                        style={{
                          color:
                            "var(--accent2)",
                          fontSize:
                            "0.7rem",
                          fontWeight: 700,
                          letterSpacing:
                            "0.02em",
                        }}
                      >
                        {CAT_LABELS[
                          r.category
                        ] || r.category}
                      </span>

                      <span
                        style={{
                          color:
                            "var(--text3)",
                          fontSize:
                            "0.7rem",
                        }}
                      >
                        •
                      </span>

                      <span
                        style={{
                          color:
                            "var(--text3)",
                          fontSize:
                            "0.7rem",
                          fontWeight: 600,
                          textTransform:
                            "uppercase",
                        }}
                      >
                        {r.type}
                      </span>
                    </div>

                    {/* =========================
                        TITLE
                    ========================= */}

                    <h3
                      style={{
                        fontSize:
                          "1.08rem",
                        fontWeight: 750,
                        lineHeight: 1.4,
                        margin: 0,
                        marginBottom:
                          "0.65rem",
                        color:
                          "var(--text1)",
                      }}
                    >
                      {r.title}
                    </h3>

                    {/* =========================
                        DESCRIPTION
                    ========================= */}

                    {r.description ? (
                      <p
                        style={{
                          color:
                            "var(--text2)",
                          fontSize:
                            "0.82rem",
                          lineHeight: 1.65,
                          margin: 0,
                          display:
                            "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient:
                            "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {r.description}
                      </p>
                    ) : (
                      <p
                        style={{
                          color:
                            "var(--text3)",
                          fontSize:
                            "0.82rem",
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        Learning material
                        provided by the
                        AI Club.
                      </p>
                    )}
                  </div>

                  {/* =========================
                      FOOTER
                  ========================= */}

                  <div
                    style={{
                      borderTop:
                        "1px solid var(--accent-border)",
                      padding:
                        "0.95rem 1.5rem",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "space-between",
                      gap: "1rem",
                      background:
                        "var(--surface)",
                    }}
                  >
                    {/* File information */}

                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: "0.45rem",
                        minWidth: 0,
                      }}
                    >
                      {r.fileSize && (
                        <span
                          style={{
                            color:
                              "var(--text3)",
                            fontSize:
                              "0.72rem",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {r.fileSize}
                        </span>
                      )}

                      {!r.fileSize && (
                        <span
                          style={{
                            color:
                              "var(--text3)",
                            fontSize:
                              "0.72rem",
                          }}
                        >
                          {isLink
                            ? "External resource"
                            : "Learning resource"}
                        </span>
                      )}
                    </div>

                    {/* Action */}

                    {r.url && (
                      <button
                        type="button"
                        onClick={() =>
                          handleResourceAction(
                            r,
                            isLink
                              ? "view"
                              : "download"
                          )
                        }
                        className="btn btn-sm"
                        style={{
                          display: "inline-flex",
                          alignItems:
                            "center",
                          gap: "0.4rem",
                          background:
                            "var(--accent-bg)",
                          color:
                            "var(--accent2)",
                          border:
                            "1px solid var(--accent-border)",
                          fontSize:
                            "0.74rem",
                          fontWeight: 700,
                          padding:
                            "0.5rem 0.8rem",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {isLink ? (
                          <>
                            Open
                            <ArrowUpRight
                              size={13}
                            />
                          </>
                        ) : (
                          <>
                            <Download
                              size={13}
                            />
                            Download
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}