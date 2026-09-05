"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SectionHeader,
  Card,
  Avatar,
  Spinner,
  EmptyState,
} from "@/components/ui";
import { Search, ExternalLink } from "lucide-react";

/* =====================================================
   TYPES
====================================================== */

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  tier: string;
  department?: string;
  course?: string;
  bio?: string;
  email?: string;
  visible: boolean;
  order: number;
  linkedin?: string;
  github?: string;
}


/* =====================================================
   TIER COLORS
====================================================== */

const TIER_COLORS: Record<string, string> = {
  faculty: "var(--orange)",
  "Faculty Head": "var(--orange)",

  leadership: "var(--accent)",
  Leadership: "var(--accent)",

  core: "var(--green)",
  "Core Members": "var(--green)",

  member: "var(--purple)",
  Members: "var(--purple)",
};

/* =====================================================
   TIER ORDER
====================================================== */

const TIER_ORDER = [
  "faculty",
  "leadership",
  "core",
  "member",
];

/* =====================================================
   ABOUT PAGE
====================================================== */

export default function AboutPage() {
  const [teamFromDB, setTeamFromDB] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  /*
   * ONE GLOBAL SEARCH
   * Searches the complete Team Hierarchy.
   */
  const [teamSearch, setTeamSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<
    "all" | "leadership" | "core" | "member"
  >("all");

  /* ===================================================
     FETCH TEAM
  ================================================== */

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        setTeamFromDB(data.team || []);
      })
      .catch(() => {
        setTeamFromDB([]);
      })
      .finally(() => {
        setLoadingTeam(false);
      });
  }, []);

  /* ===================================================
     SEARCHABLE TEAM TEXT
  ================================================== */

  const getSearchableText = (member: TeamMember) => {
    return `
      ${member.name}
      ${member.role}
      ${member.tier}
      ${member.department || ""}
      ${member.course || ""}
      ${member.bio || ""}
    `.toLowerCase();
  };

  /* ===================================================
     FILTER DATABASE TEAM
  ================================================== */

  const normalizeTier = (tier: string) => {
    const value = tier.trim().toLowerCase();

    if (value === "faculty" || value === "faculty head") return "faculty";
    if (value === "leadership") return "leadership";
    if (value === "core" || value === "core members") return "core";
    if (value === "member" || value === "members") return "member";

    return value;
  };

  const filteredDBTeam = useMemo(() => {
    const searchValue = teamSearch.trim().toLowerCase();

    return teamFromDB.filter((member) => {
      const matchesSearch =
        !searchValue ||
        getSearchableText(member).includes(searchValue);

      const matchesFilter =
        teamFilter === "all" ||
        normalizeTier(member.tier) === teamFilter;

      return matchesSearch && matchesFilter;
    });
  }, [teamFromDB, teamSearch, teamFilter]);

  /* ===================================================
     GROUP DATABASE TEAM
  ================================================== */

  const groupedDB = useMemo(() => {
    const groups: Record<string, TeamMember[]> = {};

    filteredDBTeam.forEach((member) => {
      if (!groups[member.tier]) {
        groups[member.tier] = [];
      }

      groups[member.tier].push(member);
    });

    Object.keys(groups).forEach((tier) => {
      groups[tier].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );
    });

    return groups;
  }, [filteredDBTeam]);

  /* ===================================================
     DATABASE TEAM EXISTS
  ================================================== */

  const dbHasTeam = teamFromDB.length > 0;

  /* ===================================================
     GET TIER TITLE
  ================================================== */

  const getTierTitle = (tier: string) => {
    switch (tier) {
      case "faculty":
        return "Faculty Head";

      case "leadership":
        return "Leadership";

      case "core":
        return "Core Members";

      case "member":
        return "Members";

      default:
        return tier;
    }
  };

  /* ===================================================
     GET TIER COLOR
  ================================================== */

  const getTierColor = (tier: string) => {
    return TIER_COLORS[tier] || "var(--accent)";
  };

  /* ===================================================
     DATABASE CARD
  ================================================== */

  const renderTeamCard = (
    member: TeamMember,
    index: number
  ) => {
    const linkedInUrl = member.linkedin || member.github;

    return (
      <Card
        key={member._id}
        hover
        style={{
          width: "100%",
          maxWidth: 360,
          minHeight: 0,
          padding: 0,
          borderRadius: 22,
          overflow: "hidden",
          textAlign: "center",
          background: "var(--surface)",
          border: "1px solid var(--border2)",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          transition:
            "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
        }}
      >
        {/* Accent header */}
        <div
          style={{
            height: 7,
            width: "100%",
            background:
              "linear-gradient(90deg,var(--accent),var(--purple))",
          }}
        />

        <div
          style={{
            padding: "1.5rem 1.5rem 1.35rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              padding: 4,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg,var(--accent),var(--purple))",
              marginBottom: "0.8rem",
              boxShadow: "0 8px 24px rgba(99,102,241,0.18)",
            }}
          >
            <div
              style={{
                borderRadius: "50%",
                background: "var(--surface)",
                padding: 3,
                display: "flex",
              }}
            >
              <Avatar
                name={member.name}
                size="lg"
                index={index}
              />
            </div>
          </div>

          {/* Name */}
          <h3
            style={{
              fontSize: "1.05rem",
              fontWeight: 750,
              margin: "0 0 0.45rem",
              color: "var(--text1)",
              lineHeight: 1.3,
              wordBreak: "break-word",
            }}
          >
            {member.name}
          </h3>

          {/* Role */}
          {member.role && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "5px 12px",
                borderRadius: 999,
                background: "var(--accent-bg)",
                color: "var(--accent2)",
                border: "1px solid var(--accent-border)",
                fontSize: "0.68rem",
                fontWeight: 700,
                marginBottom: "0.75rem",
                lineHeight: 1.25,
                textAlign: "center",
                whiteSpace: "normal",
              }}
            >
              {member.role}
            </span>
          )}

          {/* Department + Course */}
          {(member.department || member.course) && (
            <p
              style={{
                fontSize: "0.72rem",
                color: "var(--text3)",
                lineHeight: 1.45,
                margin: "0 0 0.8rem",
                maxWidth: 320,
                wordBreak: "break-word",
              }}
            >
              {member.department}
              {member.department && member.course && <> • </>}
              {member.course}
            </p>
          )}

          {/* Bio */}
          {member.bio && (
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text2)",
                lineHeight: 1.6,
                margin: "0 0 1.15rem",
                maxWidth: 320,
                display: "block",
                overflow: "visible",
                whiteSpace: "normal",
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {member.bio}
            </p>
          )}

          {/* Actions */}
          {(member.email || linkedInUrl) && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "stretch",
                gap: "0.55rem",
                flexWrap: "wrap",
                width: "100%",
                marginTop: "auto",
              }}
            >
              {/* Contact */}
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="btn btn-primary btn-sm"
                  style={{
                    minWidth: 92,
                    minHeight: 36,
                    padding: "7px 14px",
                    borderRadius: 10,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                  }}
                >
                  Contact
                </a>
              )}

              {/* LinkedIn */}
              {linkedInUrl && (
                <a
                  href={linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${member.name}'s LinkedIn profile`}
                  className="btn btn-ghost btn-sm"
                  style={{
  minWidth: 108,
  minHeight: 36,
  padding: "7px 14px",
  borderRadius: 10,
  fontSize: "0.68rem",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  background: "#0A66C2",
  color: "#FFFFFF",
  border: "1px solid #0A66C2",
}}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 17,
                      height: 17,
                      borderRadius: 4,
                      background: "#0A66C2",
                      color: "var(--surface)",
                      fontSize: "0.6rem",
                      fontWeight: 900,
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    in
                  </span>
                  <span>LinkedIn</span>
                </a>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  };

  /* ===================================================
     RENDER
  ================================================== */

  return (
    <>
      {/* =====================================================
          HERO
      ====================================================== */}
      <section
        style={{
          padding: "6rem 1.5rem 4rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle,var(--border2) 1px,transparent 1px)",
            backgroundSize: "36px 36px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 680,
            margin: "0 auto",
          }}
        >
          <div
            className="section-tag"
            style={{
              margin: "0 auto 1.25rem",
            }}
          >
            About Us
          </div>

          <h1
            style={{
              fontSize:
                "clamp(2.5rem,6vw,4rem)",
              marginBottom: "1rem",
            }}
          >
            We are{" "}
            <span className="gradient-text">
              AI-CLUB
            </span>
          </h1>

          <p
            style={{
              color: "var(--text2)",
              fontSize: "1.05rem",
              lineHeight: 1.75,
              margin: 0,
            }}
          >
            AI-Club is a student-driven
            community at LPCPS focused on
            Artificial Intelligence, Machine
            Learning, innovation, research,
            and real-world problem solving.
            We learn together, build impactful
            projects, participate in hackathons,
            and explore the future of
            intelligent technology.
          </p>
        </div>
      </section>

      {/* =====================================================
          TEAM HIERARCHY
      ====================================================== */}
      <section
        style={{
          padding: "5rem 1.5rem",
          background: "var(--bg2)",
          borderTop: "1px solid var(--border2)",
          borderBottom: "1px solid var(--border2)",
        }}
      >
        <div className="container">

          {/* =================================================
              TEAM HEADER
          ================================================== */}
          <div
            style={{
              maxWidth: 1000,
              margin: "0 auto 3rem",
              textAlign: "center",
            }}
          >
            <SectionHeader
              tag="Our Team"
              title="Team Hierarchy"
              subtitle="Meet the people leading, building, and growing AI-Club."
            />

            {/* SEARCH + FILTER BUTTONS */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.65rem",
                flexWrap: "wrap",
                marginTop: "2rem",
                width: "100%",
              }}
            >
              {/* Search */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 300,
                  flexShrink: 0,
                }}
              >
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text3)",
                    pointerEvents: "none",
                  }}
                />

                <input
                  className="input"
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  placeholder="Search team members..."
                  aria-label="Search team members"
                  style={{
                    width: "100%",
                    height: 42,
                    paddingLeft: 40,
                    paddingRight: 14,
                    fontSize: "0.78rem",
                    borderRadius: 10,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* All */}
              <button
                type="button"
                onClick={() => setTeamFilter("all")}
                style={{
                  height: 42,
                  padding: "0 1rem",
                  borderRadius: 10,
                  border:
                    teamFilter === "all"
                      ? "1px solid var(--accent)"
                      : "1px solid var(--border2)",
                  background:
                    teamFilter === "all"
                      ? "var(--accent-bg)"
                      : "var(--surface)",
                  color:
                    teamFilter === "all"
                      ? "var(--accent)"
                      : "var(--text2)",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                All
              </button>

              {/* Leadership */}
              <button
                type="button"
                onClick={() => setTeamFilter("leadership")}
                style={{
                  height: 42,
                  padding: "0 1rem",
                  borderRadius: 10,
                  border:
                    teamFilter === "leadership"
                      ? "1px solid var(--accent)"
                      : "1px solid var(--border2)",
                  background:
                    teamFilter === "leadership"
                      ? "var(--accent-bg)"
                      : "var(--surface)",
                  color:
                    teamFilter === "leadership"
                      ? "var(--accent)"
                      : "var(--text2)",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Leadership
              </button>

              {/* Core Members */}
              <button
                type="button"
                onClick={() => setTeamFilter("core")}
                style={{
                  height: 42,
                  padding: "0 1rem",
                  borderRadius: 10,
                  border:
                    teamFilter === "core"
                      ? "1px solid var(--green)"
                      : "1px solid var(--border2)",
                  background:
                    teamFilter === "core"
                      ? "var(--accent-bg)"
                      : "var(--surface)",
                  color:
                    teamFilter === "core"
                      ? "var(--green)"
                      : "var(--text2)",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Core Members
              </button>

              {/* Members */}
              <button
                type="button"
                onClick={() => setTeamFilter("member")}
                style={{
                  height: 42,
                  padding: "0 1rem",
                  borderRadius: 10,
                  border:
                    teamFilter === "member"
                      ? "1px solid var(--purple)"
                      : "1px solid var(--border2)",
                  background:
                    teamFilter === "member"
                      ? "var(--accent-bg)"
                      : "var(--surface)",
                  color:
                    teamFilter === "member"
                      ? "var(--purple)"
                      : "var(--text2)",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Members
              </button>
            </div>
          </div>

          {/* =================================================
              LOADING
          ================================================== */}
          {loadingTeam ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "5rem 1rem",
              }}
            >
              <Spinner size="lg" />
            </div>
          ) : dbHasTeam ? (
            <>
              {/* =================================================
                  DATABASE TEAM
              ================================================== */}
              {TIER_ORDER.map((tier) => {
                const members = groupedDB[tier];

                if (!members || members.length === 0) {
                  return null;
                }

                const tierColor =
                  getTierColor(tier);

                return (
                  <div
                    key={tier}
                    style={{
                      marginBottom: "4rem",
                    }}
                  >
                    {/* =================================================
                        TIER HEADER
                    ================================================== */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        width: "100%",
                        marginBottom: "1.5rem",
                      }}
                    >
                      {/* Title */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.7rem",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            background: tierColor,
                            boxShadow:
                              `0 0 14px ${tierColor}`,
                            flexShrink: 0,
                          }}
                        />

                        <h3
                          style={{
                            margin: 0,
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            textTransform:
                              "uppercase",
                            letterSpacing:
                              "0.08em",
                            color: tierColor,
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {getTierTitle(tier)}
                        </h3>
                      </div>

                      {/* =================================================
                          LINE AFTER HEADING
                      ================================================== */}
                      <div
                        style={{
                          flex: 1,
                          height: 1,
                          background:
                            "var(--border2)",
                          minWidth: 30,
                        }}
                      />
                    </div>

                    {/* =================================================
                        CARDS
                    ================================================== */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "center",
                        alignItems:
                          "flex-start",
                        flexWrap: "wrap",
                        gap: "1.5rem",
                        width: "100%",
                      }}
                    >
                      {members.map(
                        (member, index) =>
                          renderTeamCard(
                            member,
                            index
                          )
                      )}
                    </div>
                  </div>
                );
              })}

              {/* =================================================
                  SEARCH FOUND NOTHING
              ================================================== */}
              {filteredDBTeam.length === 0 && (
                <EmptyState
                  icon="🔍"
                  title="No team members found"
                  description="Try searching by name, role, department, course, or bio."
                />
              )}

              {/* =================================================
                  UNKNOWN TIER FALLBACK
              ================================================== */}
              {Object.keys(groupedDB)
                .filter(
                  (tier) =>
                    !TIER_ORDER.includes(tier)
                )
                .map((tier) => {
                  const members =
                    groupedDB[tier];

                  const tierColor =
                    getTierColor(tier);

                  return (
                    <div
                      key={tier}
                      style={{
                        marginBottom:
                          "4rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "1rem",
                          width: "100%",
                          marginBottom:
                            "1.5rem",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "0.7rem",
                          }}
                        >
                          <div
                            style={{
                              width: 9,
                              height: 9,
                              borderRadius:
                                "50%",
                              background:
                                tierColor,
                              boxShadow:
                                `0 0 14px ${tierColor}`,
                            }}
                          />

                          <h3
                            style={{
                              margin: 0,
                              fontSize:
                                "0.95rem",
                              fontWeight:
                                700,
                              textTransform:
                                "uppercase",
                              letterSpacing:
                                "0.08em",
                              color:
                                tierColor,
                            }}
                          >
                            {getTierTitle(
                              tier
                            )}
                          </h3>
                        </div>

                        <div
                          style={{
                            flex: 1,
                            height: 1,
                            background:
                              "var(--border2)",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "center",
                          alignItems:
                            "flex-start",
                          flexWrap:
                            "wrap",
                          gap: "1.5rem",
                        }}
                      >
                        {members.map(
                          (
                            member,
                            index
                          ) =>
                            renderTeamCard(
                              member,
                              index
                            )
                        )}
                      </div>
                    </div>
                  );
                })}
            </>
          ) : (
            <EmptyState
              icon="👥"
              title="No team members found"
              description={
                teamSearch.trim()
                  ? "Try a different search term."
                  : "Team members will appear here once they are added from the admin panel."
              }
            />
          )}

        </div>
      </section>

      {/* =====================================================
          DOMAINS
      ====================================================== */}
      <section
        style={{
          padding: "4rem 1.5rem",
        }}
      >
        <div className="container">
          <SectionHeader
            tag="Domains"
            title="What We Cover"
            subtitle="Areas where AI-Club learns, builds, and experiments."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill,minmax(190px,1fr))",
              gap: "1rem",
            }}
          >
            {[
              {
                e: "🤖",
                l: "Machine Learning",
              },
              {
                e: "🧠",
                l: "Deep Learning",
              },
              {
                e: "💬",
                l: "NLP & LLMs",
              },
              {
                e: "👁",
                l: "Computer Vision",
              },
              {
                e: "🔐",
                l: "Cybersecurity",
              },
              {
                e: "⚡",
                l: "MLOps / DevOps",
              },
              {
                e: "🌐",
                l: "Web Development",
              },
              {
                e: "📡",
                l: "IoT & Edge AI",
              },
              {
                e: "📊",
                l: "Data Science",
              },
              {
                e: "🎮",
                l: "Reinforcement Learning",
              },
            ].map((domain) => (
              <div
                key={domain.l}
                style={{
                  background:
                    "var(--surface)",
                  border:
                    "1px solid var(--border2)",
                  borderRadius:
                    "var(--radius)",
                  padding:
                    "1.5rem 1.25rem",
                  transition:
                    "all 0.2s",
                }}
              >
                <div
                  style={{
                    fontSize: "1.75rem",
                    marginBottom:
                      "0.6rem",
                  }}
                >
                  {domain.e}
                </div>

                <h4
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {domain.l}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          OUR JOURNEY
      ====================================================== */}
      <section
        style={{
          padding: "4rem 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
          }}
        >
          <SectionHeader
            tag="History"
            title="Our Journey"
            center={false}
          />

          {[
            {
              y: "2022",
              t: "Founded",
              d: "Started with 12 members and a single Python ML workshop.",
            },
            {
              y: "2023",
              t: "First Win",
              d: "1st place at state ML hackathon. Grew to 50+ active members.",
            },
            {
              y: "2024",
              t: "Research & Scale",
              d: "First research paper published. Launched Cybersecurity track.",
            },
            {
              y: "2025",
              t: "100+ & Growing",
              d: "National 2nd place. LLM research pipeline. Batch 2025 open.",
            },
          ].map((event, index) => (
            <div
              key={event.y}
              style={{
                display: "flex",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              {/* Timeline icon */}
              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg,var(--accent),var(--purple))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    fontFamily:
                      "'Space Grotesk',sans-serif",
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  {event.y}
                </div>

                {index < 3 && (
                  <div
                    style={{
                      width: 2,
                      flex: 1,
                      background:
                        "var(--border2)",
                      marginTop: 4,
                    }}
                  />
                )}
              </div>

              {/* Timeline content */}
              <div
                style={{
                  paddingBottom:
                    "1.5rem",
                }}
              >
                <h4
                  style={{
                    marginBottom:
                      "0.4rem",
                  }}
                >
                  {event.t}
                </h4>

                <p
                  style={{
                    color:
                      "var(--text2)",
                    fontSize:
                      "0.875rem",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {event.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}