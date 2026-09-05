"use client";

import { useState, useEffect, useCallback } from "react";

import {
  Plus,
  Edit,
  Trash2,
  X,
  Users,
  RefreshCw,
  Calendar,
  MapPin,
  Eye,
  Mail,
  Phone,
  ExternalLink,
  Search,
} from "lucide-react";

import { eventsApi, ClubEvent } from "@/lib/api";

import {
  Modal,
  StatusBadge,
  FormField,
  Spinner,
  EmptyState,
  showToast,
  useConfirm,
} from "@/components/ui";

type FormFieldConfig = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
};

type EventRegistration = {
  _id: string;
  eventId: string;
  name?: string;
  email?: string;
  phone?: string;
  branch?: string;
  year?: string;
  formData?: Record<string, unknown>;
  extraFields?: Record<string, unknown>;
  teamName?: string;
  teamMembers?: Array<{
    name?: string;
    email?: string;
    phone?: string;
    branch?: string;
    year?: string;
    [key: string]: unknown;
  }>;
  createdAt?: string;
  submittedAt?: string;
};

type EventWithTeams = ClubEvent & {
  allowTeams?: boolean;
  maxTeamSize?: number;
  formFields?: FormFieldConfig[];
};

type EForm = {
  title: string;
  type: string;
  description: string;
  date: string;
  location: string;
  maxAttendees: string;
  status: string;
  registrationOpen: boolean;
  tags: string;
  allowTeams: boolean;
  maxTeamSize: string;
};

const INIT: EForm = {
  title: "",
  type: "workshop",
  description: "",
  date: "",
  location: "",
  maxAttendees: "",
  status: "upcoming",
  registrationOpen: true,
  tags: "",
  allowTeams: false,
  maxTeamSize: "4",
};

const EVENT_TYPES = [
  "workshop",
  "hackathon",
  "talk",
  "meetup",
  "competition",
];

const EVENT_STATUSES = [
  "upcoming",
  "ongoing",
  "past",
  "cancelled",
];

function EventModal({
  event,
  onClose,
  onSave,
}: {
  event?: EventWithTeams | null;
  onClose: () => void;
  onSave: (
    data: Partial<EventWithTeams>,
    id?: string
  ) => Promise<void>;
}) {
  const [form, setForm] = useState<EForm>(
    event
      ? {
          title: event.title || "",
          type: event.type || "workshop",
          description: event.description || "",
          date: event.date?.slice(0, 10) || "",
          location: event.location || "",
          maxAttendees:
            event.maxAttendees?.toString() || "",
          status: event.status || "upcoming",
          registrationOpen:
            event.registrationOpen ?? true,
          tags: event.tags?.join(", ") || "",
          allowTeams:
            event.allowTeams ?? event.type === "hackathon",
          maxTeamSize:
            event.maxTeamSize?.toString() || "4",
        }
      : { ...INIT }
  );

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EForm, string>>
  >({});

  const isHackathon = form.type === "hackathon";

  const update = <K extends keyof EForm>(
    key: K,
    value: EForm[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: undefined,
      }));
    }
  };

  const validate = () => {
    const nextErrors: Partial<
      Record<keyof EForm, string>
    > = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required";
    }

    if (!form.type) {
      nextErrors.type = "Type is required";
    }

    if (
      isHackathon &&
      (!form.maxTeamSize ||
        Number(form.maxTeamSize) < 1)
    ) {
      nextErrors.maxTeamSize =
        "Enter a valid team size";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const save = async () => {
    if (!validate()) return;

    setSaving(true);

    try {
      const tags = form.tags
        ? form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      const payload: Partial<EventWithTeams> = {
        title: form.title.trim(),
        type: form.type,
        description: form.description.trim(),
        date: form.date || undefined,
        location: form.location.trim() || undefined,
        maxAttendees: form.maxAttendees
          ? Number(form.maxAttendees)
          : undefined,
        status:
          form.status as ClubEvent["status"],
        registrationOpen:
          form.registrationOpen,
        tags,

        // Hackathons automatically support teams.
        allowTeams: isHackathon
          ? true
          : form.allowTeams,

        maxTeamSize: isHackathon || form.allowTeams
          ? Number(form.maxTeamSize) || 4
          : undefined,
      };

      await onSave(payload, event?._id);
      onClose();
    } catch {
      // Parent handles the error toast.
    } finally {
      setSaving(false);
    }
  };

  const Field = ({
    label,
    error,
    children,
    full = false,
  }: {
    label: string;
    error?: string;
    children: React.ReactNode;
    full?: boolean;
  }) => (
    <FormField label={label} error={error}>
      <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
        {children}
      </div>
    </FormField>
  );

  return (
    <div
      className="modal-bg"
      onClick={onClose}
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 680,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h3
              style={{
                fontWeight: 700,
                fontSize: "1.15rem",
              }}
            >
              {event
                ? "Edit Event"
                : "Create New Event"}
            </h3>

            <p
              style={{
                color: "var(--text3)",
                fontSize: "0.78rem",
                marginTop: "0.2rem",
              }}
            >
              Configure event details and
              registration settings.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-icon btn-sm"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid-2">
          <FormField
            label="Title *"
            error={errors.title}
          >
            <input
              className="input"
              value={form.title}
              onChange={(e) =>
                update(
                  "title",
                  e.target.value
                )
              }
              placeholder="AI/ML Hackathon 2026"
            />
          </FormField>

          <FormField
            label="Type *"
            error={errors.type}
          >
            <select
              className="input"
              value={form.type}
              onChange={(e) =>
                update(
                  "type",
                  e.target.value
                )
              }
            >
              {EVENT_TYPES.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type
                    .charAt(0)
                    .toUpperCase() +
                    type.slice(1)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Date">
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={(e) =>
                update(
                  "date",
                  e.target.value
                )
              }
            />
          </FormField>

          <FormField label="Location">
            <input
              className="input"
              value={form.location}
              onChange={(e) =>
                update(
                  "location",
                  e.target.value
                )
              }
              placeholder="Lab 3, Block C"
            />
          </FormField>

          <FormField label="Max Attendees">
            <input
              type="number"
              min="1"
              className="input"
              value={form.maxAttendees}
              onChange={(e) =>
                update(
                  "maxAttendees",
                  e.target.value
                )
              }
              placeholder="50"
            />
          </FormField>

          <FormField label="Status">
            <select
              className="input"
              value={form.status}
              onChange={(e) =>
                update(
                  "status",
                  e.target.value
                )
              }
            >
              {EVENT_STATUSES.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status
                      .charAt(0)
                      .toUpperCase() +
                      status.slice(1)}
                  </option>
                )
              )}
            </select>
          </FormField>

          <FormField label="Tags (comma-separated)">
            <input
              className="input"
              value={form.tags}
              onChange={(e) =>
                update(
                  "tags",
                  e.target.value
                )
              }
              placeholder="AI, ML, Python"
            />
          </FormField>
        </div>

        <FormField label="Description">
          <textarea
            className="input"
            value={form.description}
            onChange={(e) =>
              update(
                "description",
                e.target.value
              )
            }
            rows={4}
            placeholder="Event description…"
            style={{
              resize: "vertical",
            }}
          />
        </FormField>

        {/* HACKATHON TEAM SETTINGS */}
        <div
          style={{
            marginTop: "0.5rem",
            marginBottom: "1.25rem",
            padding: "1rem",
            borderRadius: 12,
            border:
              "1px solid var(--border2)",
            background: isHackathon
              ? "var(--accent-bg)"
              : "var(--bg2)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "1rem",
              marginBottom:
                isHackathon || form.allowTeams
                  ? "1rem"
                  : 0,
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                Team Registration
              </div>

              <div
                style={{
                  color: "var(--text3)",
                  fontSize: "0.72rem",
                  marginTop: "0.2rem",
                }}
              >
                {isHackathon
                  ? "Hackathons automatically use team registration."
                  : "Allow participants to register as a team."}
              </div>
            </div>

            {!isHackathon && (
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.allowTeams}
                  onChange={(e) =>
                    update(
                      "allowTeams",
                      e.target.checked
                    )
                  }
                  style={{
                    width: 16,
                    height: 16,
                    accentColor:
                      "var(--accent)",
                  }}
                />
                Allow Teams
              </label>
            )}
          </div>

          {(isHackathon ||
            form.allowTeams) && (
            <FormField
              label="Maximum Team Size *"
              error={errors.maxTeamSize}
            >
              <input
                type="number"
                min="1"
                max="20"
                className="input"
                value={
                  form.maxTeamSize
                }
                onChange={(e) =>
                  update(
                    "maxTeamSize",
                    e.target.value
                  )
                }
                placeholder="4"
              />

              <div
                style={{
                  color: "var(--text3)",
                  fontSize: "0.7rem",
                  marginTop: "0.35rem",
                }}
              >
                Example: enter 4 for a
                maximum of 4 members per
                team.
              </div>
            </FormField>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            marginBottom: "1.25rem",
          }}
        >
          <input
            type="checkbox"
            id="registration-open"
            checked={
              form.registrationOpen
            }
            onChange={(e) =>
              update(
                "registrationOpen",
                e.target.checked
              )
            }
            style={{
              width: 16,
              height: 16,
              accentColor:
                "var(--accent)",
              cursor: "pointer",
            }}
          />

          <label
            htmlFor="registration-open"
            style={{
              cursor: "pointer",
              fontSize: "0.875rem",
              color: "var(--text2)",
            }}
          >
            Registration Open
          </label>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
          }}
        >
          <button
            type="button"
            className="btn btn-ghost"
            style={{ flex: 1 }}
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            style={{
              flex: 2,
              justifyContent: "center",
            }}
            onClick={save}
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner size="sm" />
                {event
                  ? "Saving…"
                  : "Creating…"}
              </>
            ) : event ? (
              "Save Changes"
            ) : (
              "Create Event"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function RegistrationDetails({
  event,
  onClose,
}: {
  event: EventWithTeams;
  onClose: () => void;
}) {
  const [registrations, setRegistrations] =
    useState<EventRegistration[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [search, setSearch] =
    useState("");

  const loadRegistrations =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/event-registrations?eventId=${encodeURIComponent(
            event._id
          )}&admin=true`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              "Failed to load registrations"
          );
        }

        const list =
          data.registrations ||
          data.eventRegistrations ||
          data.data ||
          [];

        setRegistrations(
          Array.isArray(list)
            ? list
            : []
        );
      } catch (e: unknown) {
        const message =
          e instanceof Error
            ? e.message
            : "Failed to load registrations";

        setError(message);
      } finally {
        setLoading(false);
      }
    }, [event._id]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const getValue = (
    registration: EventRegistration,
    key: string
  ) => {
    const directValue =
      (registration as unknown as Record<string, unknown>)[key];

    const formData =
      registration.formData || {};
    const extraFields =
      registration.extraFields || {};

    return (
      directValue ??
      formData[key] ??
      extraFields[key] ??
      ""
    );
  };

  const getName = (
    registration: EventRegistration
  ) => {
    const directName =
      (registration as unknown as Record<string, unknown>)
        .name;

    if (directName) {
      return String(directName);
    }

    const fullName =
      getValue(
        registration,
        "name"
      );

    if (fullName) {
      return String(fullName);
    }

    const firstName = String(
      getValue(
        registration,
        "firstName"
      ) || ""
    );

    const lastName = String(
      getValue(
        registration,
        "lastName"
      ) || ""
    );

    return (
      `${firstName} ${lastName}`.trim() ||
      "Participant"
    );
  };

  const filtered =
    registrations.filter(
      (registration) => {
        const searchable = [
          getName(registration),
          getValue(
            registration,
            "email"
          ),
          getValue(
            registration,
            "phone"
          ),
          getValue(
            registration,
            "branch"
          ),
          getValue(
            registration,
            "year"
          ),
          registration.teamName ||
            "",
          ...(registration.teamMembers || []).flatMap(
            (member) => [
              member.name || "",
              member.email || "",
              member.phone || "",
              member.branch || "",
              member.year || "",
              String(
                (member as Record<string, unknown>).course ??
                (member as Record<string, unknown>).program ??
                (member as Record<string, unknown>).courseName ??
                ""
              ),
              String(
                (member as Record<string, unknown>).currentYear ??
                (member as Record<string, unknown>).current_year ??
                ""
              ),
            ]
          ),
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(
          search.toLowerCase()
        );
      }
    );

  const fields =
    event.formFields || [];

  return (
    <div
      className="modal-bg"
      onClick={onClose}
    >
      <div
        className="modal"
        onClick={(e) =>
          e.stopPropagation()
        }
        style={{
          maxWidth: 1000,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "flex-start",
            gap: "1rem",
            marginBottom: "1.25rem",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
              }}
            >
              Event Registrations
            </h3>

            <p
              style={{
                color: "var(--text3)",
                fontSize: "0.78rem",
                marginTop: "0.25rem",
              }}
            >
              {event.title} ·{" "}
              {registrations.length}{" "}
              registration
              {registrations.length !==
              1
                ? "s"
                : ""}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={
                loadRegistrations
              }
              disabled={loading}
              title="Refresh registrations"
            >
              <RefreshCw
                size={13}
                style={{
                  animation: loading
                    ? "spin 1s linear infinite"
                    : "none",
                }}
              />
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-icon btn-sm"
              onClick={onClose}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <div
            className="card"
            style={{
              padding: "0.9rem 1rem",
            }}
          >
            <div
              style={{
                color: "var(--text3)",
                fontSize: "0.68rem",
                textTransform:
                  "uppercase",
                fontWeight: 700,
              }}
            >
              Registrations
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                marginTop: "0.25rem",
              }}
            >
              {registrations.length}
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: "0.9rem 1rem",
            }}
          >
            <div
              style={{
                color: "var(--text3)",
                fontSize: "0.68rem",
                textTransform:
                  "uppercase",
                fontWeight: 700,
              }}
            >
              Team Event
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                marginTop: "0.25rem",
              }}
            >
              {event.allowTeams ||
              event.type === "hackathon"
                ? `Max ${event.maxTeamSize || 4}`
                : "Individual"}
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: "0.9rem 1rem",
            }}
          >
            <div
              style={{
                color: "var(--text3)",
                fontSize: "0.68rem",
                textTransform:
                  "uppercase",
                fontWeight: 700,
              }}
            >
              Showing
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                marginTop: "0.25rem",
              }}
            >
              {filtered.length}
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            marginBottom: "1rem",
          }}
        >
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform:
                "translateY(-50%)",
              color: "var(--text3)",
            }}
          />

          <input
            className="input"
            style={{
              paddingLeft: 36,
            }}
            placeholder="Search participant, email, phone, team…"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />
        </div>

        {loading ? (
          <div
            style={{
              padding: "3rem",
              display: "flex",
              justifyContent:
                "center",
            }}
          >
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--red)",
              background:
                "var(--red-bg)",
              borderRadius: 10,
            }}
          >
            <p
              style={{
                marginBottom: "0.75rem",
              }}
            >
              {error}
            </p>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={
                loadRegistrations
              }
            >
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="👥"
            title={
              registrations.length ===
              0
                ? "No registrations yet"
                : "No matching registrations"
            }
            description={
              registrations.length ===
              0
                ? "Registrations for this event will appear here."
                : "Try a different search."
            }
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {filtered.map(
              (
                registration,
                index
              ) => {
                const name =
                  getName(
                    registration
                  );

                const email = String(
                  getValue(
                    registration,
                    "email"
                  ) || ""
                );

                const phone = String(
                  getValue(
                    registration,
                    "phone"
                  ) || ""
                );

                const branch = String(
                  getValue(
                    registration,
                    "branch"
                  ) || ""
                );

                const year = String(
                  getValue(
                    registration,
                    "year"
                  ) || ""
                );

                const teamMembers =
                  registration.teamMembers ||
                  [];

                return (
                  <div
                    key={
                      registration._id ||
                      `${name}-${index}`
                    }
                    style={{
                      border:
                        "1px solid var(--border2)",
                      borderRadius: 12,
                      padding:
                        "1rem",
                      background:
                        "var(--bg2)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius:
                              "50%",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            background:
                              "var(--accent-bg)",
                            color:
                              "var(--accent2)",
                            fontWeight: 800,
                          }}
                        >
                          {name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                            }}
                          >
                            {name}
                          </div>

                          {registration.teamName && (
                            <div
                              style={{
                                color:
                                  "var(--green)",
                                fontSize:
                                  "0.72rem",
                                fontWeight: 700,
                                marginTop:
                                  "0.15rem",
                              }}
                            >
                              Team:{" "}
                              {
                                registration.teamName
                              }
                            </div>
                          )}
                        </div>
                      </div>

                      <span
                        className="badge"
                        style={{
                          background:
                            "var(--accent-bg)",
                          color:
                            "var(--accent2)",
                        }}
                      >
                        #{index + 1}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(3, minmax(0, 1fr))",
                        gap: "0.6rem",
                        marginTop:
                          "0.9rem",
                      }}
                    >
                      {email && (
                        <a
                          href={`mailto:${email}`}
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 6,
                            color:
                              "var(--text2)",
                            fontSize:
                              "0.78rem",
                            textDecoration:
                              "none",
                          }}
                        >
                          <Mail
                            size={13}
                          />
                          {email}
                        </a>
                      )}

                      {phone && (
                        <a
                          href={`tel:${phone}`}
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 6,
                            color:
                              "var(--text2)",
                            fontSize:
                              "0.78rem",
                            textDecoration:
                              "none",
                          }}
                        >
                          <Phone
                            size={13}
                          />
                          {phone}
                        </a>
                      )}

                      {branch && (
                        <div
                          style={{
                            color:
                              "var(--text2)",
                            fontSize:
                              "0.78rem",
                          }}
                        >
                          {branch}
                        </div>
                      )}

                      {year && (
                        <div
                          style={{
                            color:
                              "var(--text2)",
                            fontSize:
                              "0.78rem",
                          }}
                        >
                          {year}
                        </div>
                      )}
                    </div>

                    {teamMembers.length >
                      0 && (
                      <div
                        style={{
                          marginTop:
                            "1rem",
                          paddingTop:
                            "0.85rem",
                          borderTop:
                            "1px solid var(--border2)",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 6,
                            fontSize:
                              "0.72rem",
                            fontWeight: 700,
                            color:
                              "var(--accent2)",
                            textTransform:
                              "uppercase",
                            marginBottom:
                              "0.65rem",
                          }}
                        >
                          <Users
                            size={13}
                          />
                          Team Members (
                          {
                            teamMembers.length
                          }
                          )
                        </div>

                        <div
                          style={{
                            display:
                              "grid",
                            gridTemplateColumns:
                              "repeat(2, minmax(0, 1fr))",
                            gap: "0.5rem",
                          }}
                        >
                          {teamMembers.map(
                            (
                              member,
                              memberIndex
                            ) => (
                              <div
                                key={`${registration._id}-member-${memberIndex}`}
                                style={{
                                  padding:
                                    "0.6rem 0.7rem",
                                  border:
                                    "1px solid var(--border2)",
                                  borderRadius: 8,
                                  background:
                                    "var(--surface)",
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: 600,
                                    fontSize:
                                      "0.78rem",
                                  }}
                                >
                                  {member.name ||
                                    `Member ${
                                      memberIndex +
                                      1
                                    }`}
                                </div>

                                {member.email && (
                                  <div
                                    style={{
                                      color:
                                        "var(--text3)",
                                      fontSize:
                                        "0.68rem",
                                      marginTop:
                                        "0.15rem",
                                    }}
                                  >
                                    {
                                      member.email
                                    }
                                  </div>
                                )}

                                {member.phone && (
                                  <div
                                    style={{
                                      color:
                                        "var(--text3)",
                                      fontSize:
                                        "0.68rem",
                                      marginTop:
                                        "0.1rem",
                                    }}
                                  >
                                    {
                                      member.phone
                                    }
                                  </div>
                                )}

                                {(() => {
                                  const memberData =
                                    member as Record<string, unknown>;

                                  // Support branch/course naming used by different
                                  // versions of the registration form/API.
                                  const memberCourse =
                                    memberData.branch ??
                                    memberData.course ??
                                    memberData.program ??
                                    memberData["courseName"] ??
                                    "";

                                  const memberYear =
                                    memberData.year ??
                                    memberData.currentYear ??
                                    memberData["current_year"] ??
                                    "";

                                  return (
                                    <>
                                      {String(memberCourse || "").trim() && (
                                        <div
                                          style={{
                                            color: "var(--text3)",
                                            fontSize: "0.68rem",
                                            marginTop: "0.1rem",
                                          }}
                                        >
                                          Course: {String(memberCourse)}
                                        </div>
                                      )}

                                      {String(memberYear || "").trim() && (
                                        <div
                                          style={{
                                            color: "var(--text3)",
                                            fontSize: "0.68rem",
                                            marginTop: "0.1rem",
                                          }}
                                        >
                                          Year: {String(memberYear)}
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* All registration fields */}
                    {Object.keys(
                      {
                        ...registration.formData,
                        ...registration.extraFields,
                      }
                    ).filter(
                      (key) =>
                        ![
                          "name",
                          "firstName",
                          "lastName",
                          "email",
                          "phone",
                          "branch",
                          "year",
                        ].includes(key)
                    ).length > 0 && (
                      <div
                        style={{
                          marginTop:
                            "1rem",
                          paddingTop:
                            "0.85rem",
                          borderTop:
                            "1px solid var(--border2)",
                        }}
                      >
                        <div
                          style={{
                            fontSize:
                              "0.72rem",
                            fontWeight: 700,
                            color:
                              "var(--accent2)",
                            textTransform:
                              "uppercase",
                            marginBottom:
                              "0.6rem",
                          }}
                        >
                          Additional Information
                        </div>

                        <div
                          style={{
                            display:
                              "grid",
                            gridTemplateColumns:
                              "repeat(2, minmax(0, 1fr))",
                            gap: "0.5rem",
                          }}
                        >
                          {Object.entries({
                            ...registration.formData,
                            ...registration.extraFields,
                          })
                            .filter(
                              ([key]) =>
                                ![
                                  "name",
                                  "firstName",
                                  "lastName",
                                  "email",
                                  "phone",
                                  "branch",
                                ].includes(
                                  key
                                )
                            )
                            .map(
                              (
                                [
                                  key,
                                  value,
                                ]
                              ) => (
                                <div
                                  key={key}
                                  style={{
                                    padding:
                                      "0.55rem 0.7rem",
                                    border:
                                      "1px solid var(--border2)",
                                    borderRadius: 8,
                                    background:
                                      "var(--surface)",
                                  }}
                                >
                                  <div
                                    style={{
                                      color:
                                        "var(--text3)",
                                      fontSize:
                                        "0.62rem",
                                      textTransform:
                                        "uppercase",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {key}
                                  </div>

                                  <div
                                    style={{
                                      fontSize:
                                        "0.76rem",
                                      marginTop:
                                        "0.2rem",
                                      wordBreak:
                                        "break-word",
                                    }}
                                  >
                                    {Array.isArray(
                                      value
                                    )
                                      ? value.join(
                                          ", "
                                        )
                                      : String(
                                          value ??
                                            ""
                                        )}
                                  </div>
                                </div>
                              )
                            )}
                        </div>
                      </div>
                    )}

                    {registration.createdAt ||
                    registration.submittedAt ? (
                      <div
                        style={{
                          color:
                            "var(--text3)",
                          fontSize:
                            "0.65rem",
                          marginTop:
                            "0.75rem",
                        }}
                      >
                        Registered:{" "}
                        {new Date(
                          registration.createdAt ||
                            registration.submittedAt ||
                            ""
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              }
            )}
          </div>
        )}

        {fields.length > 0 && (
          <div
            style={{
              marginTop: "1rem",
              color: "var(--text3)",
              fontSize: "0.68rem",
            }}
          >
            This event has{" "}
            {fields.length} custom
            registration field
            {fields.length !== 1
              ? "s"
              : ""}.
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminEventsPage() {
  const [events, setEvents] =
    useState<EventWithTeams[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [modal, setModal] =
    useState<
      EventWithTeams | null | undefined
    >(undefined);
  const [registrationEvent, setRegistrationEvent] =
    useState<EventWithTeams | null>(null);
  const [busyId, setBusyId] =
    useState<string | null>(null);

  const { confirm, Dialog } =
    useConfirm();

  const load = useCallback(
    async () => {
      setLoading(true);

      try {
        const { events } =
          await eventsApi.list();

        setEvents(
          (events || []) as EventWithTeams[]
        );
      } catch (e: unknown) {
        showToast.error(
          e instanceof Error
            ? e.message
            : "Failed to load events"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (
    data: Partial<EventWithTeams>,
    id?: string
  ) => {
    try {
      if (id) {
        const { event } =
          await eventsApi.update(
            id,
            data
          );

        setEvents((prev) =>
          prev.map((item) =>
            item._id === id
              ? (event as EventWithTeams)
              : item
          )
        );

        showToast.success(
          "Event updated — changes are live"
        );
      } else {
        await eventsApi.create(data);

        showToast.success(
          "Event created — now visible on website"
        );

        await load();
      }
    } catch (e: unknown) {
      showToast.error(
        e instanceof Error
          ? e.message
          : "Save failed"
      );

      throw e;
    }
  };

  const handleDelete = async (
    id: string,
    title: string
  ) => {
    const ok = await confirm(
      `Delete "${title}"? This cannot be undone.`
    );

    if (!ok) return;

    setBusyId(id);

    try {
      await eventsApi.delete(id);

      setEvents((prev) =>
        prev.filter(
          (event) => event._id !== id
        )
      );

      showToast.success(
        "Event deleted"
      );
    } catch (e: unknown) {
      showToast.error(
        e instanceof Error
          ? e.message
          : "Delete failed"
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom:
            "1.75rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.65rem",
              marginBottom:
                "0.2rem",
            }}
          >
            Events
          </h1>

          <p
            style={{
              color:
                "var(--text2)",
              fontSize:
                "0.875rem",
            }}
          >
            {events.length} events ·
            manage events and
            registrations
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.65rem",
          }}
        >
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw
              size={14}
              style={{
                animation: loading
                  ? "spin 1s linear infinite"
                  : "none",
              }}
            />
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() =>
              setModal(null)
            }
          >
            <Plus size={14} />
            Create Event
          </button>
        </div>
      </div>

      {/* EVENTS TABLE */}
      <div
        className="card"
        style={{
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div
            style={{
              padding: "3rem",
              display: "flex",
              justifyContent:
                "center",
            }}
          >
            <Spinner size="lg" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No events yet"
            description="Create your first event — it will appear on the website immediately."
          />
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table className="table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Teams</th>
                  <th>Registration</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => {
                  const isTeamEvent =
                    event.allowTeams ||
                    event.type ===
                      "hackathon";

                  return (
                    <tr
                      key={event._id}
                      style={{
                        opacity:
                          busyId ===
                          event._id
                            ? 0.5
                            : 1,
                      }}
                    >
                      <td>
                        <div
                          style={{
                            fontWeight: 600,
                          }}
                        >
                          {event.title}
                        </div>

                        {event.description && (
                          <div
                            style={{
                              fontSize:
                                "0.72rem",
                              color:
                                "var(--text3)",
                              maxWidth: 220,
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {
                              event.description
                            }
                          </div>
                        )}
                      </td>

                      <td>
                        <span
                          className="badge badge-blue"
                          style={{
                            textTransform:
                              "capitalize",
                          }}
                        >
                          {event.type}
                        </span>
                      </td>

                      <td
                        style={{
                          color:
                            "var(--text2)",
                          fontSize:
                            "0.82rem",
                        }}
                      >
                        {event.date ? (
                          <span
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 4,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            <Calendar
                              size={12}
                            />
                            {new Date(
                              event.date
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td
                        style={{
                          color:
                            "var(--text2)",
                          fontSize:
                            "0.82rem",
                          maxWidth: 160,
                        }}
                      >
                        {event.location ? (
                          <span
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 4,
                            }}
                          >
                            <MapPin
                              size={12}
                            />
                            {event.location}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td>
                        <StatusBadge
                          status={
                            event.status
                          }
                        />
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            isTeamEvent
                              ? "badge-green"
                              : "badge-gray"
                          }`}
                        >
                          {isTeamEvent
                            ? `Max ${
                                event.maxTeamSize ||
                                4
                              }`
                            : "Individual"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            event.registrationOpen
                              ? "badge-green"
                              : "badge-gray"
                          }`}
                        >
                          {event.registrationOpen
                            ? "Open"
                            : "Closed"}
                        </span>
                      </td>

                      <td>
                        <div
                          style={{
                            display:
                              "flex",
                            gap: 4,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setRegistrationEvent(
                                event
                              )
                            }
                            className="btn btn-ghost btn-sm"
                            title="View registrations"
                          >
                            <Users
                              size={13}
                            />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setModal(
                                event
                              )
                            }
                            className="btn btn-ghost btn-icon btn-sm"
                            title="Edit event"
                          >
                            <Edit
                              size={13}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                event._id,
                                event.title
                              )
                            }
                            disabled={
                              busyId ===
                              event._id
                            }
                            className="btn btn-danger btn-icon btn-sm"
                            title="Delete event"
                          >
                            <Trash2
                              size={13}
                            />
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

      {/* CREATE / EDIT MODAL */}
      {modal !== undefined && (
        <EventModal
          event={modal}
          onClose={() =>
            setModal(undefined)
          }
          onSave={handleSave}
        />
      )}

      {/* REGISTRATION DETAILS MODAL */}
      {registrationEvent && (
        <RegistrationDetails
          event={registrationEvent}
          onClose={() =>
            setRegistrationEvent(null)
          }
        />
      )}

      <Dialog />

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 700px) {
          .grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
