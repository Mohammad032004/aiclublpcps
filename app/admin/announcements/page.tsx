"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  Megaphone,
  ExternalLink,
} from "lucide-react";

import {
  announcementsApi,
  Announcement,
} from "@/lib/api";

import {
  Modal,
  FormField,
  Spinner,
  EmptyState,
  showToast,
  useConfirm,
} from "@/components/ui";


// ─────────────────────────────────────────────
// Announcement Form
// ─────────────────────────────────────────────

type AForm = {
  title: string;
  description: string;
  badge: string;
  buttonText: string;
  buttonLink: string;
  active: boolean;
  showPopup: boolean;
};

const AINIT: AForm = {
  title: "",
  description: "",
  badge: "Applications Open · Batch 2026",
  buttonText: "Apply Now",
  buttonLink: "/apply",
  active: true,
  showPopup: true,
};


// ─────────────────────────────────────────────
// Announcement Modal
// ─────────────────────────────────────────────

function AnnouncementModal({
  announcement,
  onClose,
  onSave,
}: {
  announcement?: Announcement | null;
  onClose: () => void;
  onSave: (
    data: Partial<Announcement>,
    id?: string
  ) => Promise<void>;
}) {
  const [form, setForm] = useState<AForm>(
    announcement
      ? {
          title: announcement.title,
          description: announcement.description,
          badge: announcement.badge || "",
          buttonText: announcement.buttonText || "",
          buttonLink: announcement.buttonLink || "",
          active: announcement.active,
          showPopup: announcement.showPopup,
        }
      : AINIT
  );

  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState<
    Partial<Record<keyof AForm, string>>
  >({});


  const validate = () => {
    const e: Partial<Record<keyof AForm, string>> = {};

    if (!form.title.trim()) {
      e.title = "Title is required";
    }

    if (!form.description.trim()) {
      e.description = "Description is required";
    }

    if (!form.buttonText.trim()) {
      e.buttonText = "Button text is required";
    }

    if (!form.buttonLink.trim()) {
      e.buttonLink = "Button link is required";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };


  const save = async () => {
    if (!validate()) return;

    setSaving(true);

    try {
      await onSave(
        {
          title: form.title.trim(),
          description: form.description.trim(),
          badge: form.badge.trim(),
          buttonText: form.buttonText.trim(),
          buttonLink: form.buttonLink.trim(),
          active: form.active,
          showPopup: form.showPopup,
        },
        announcement?._id
      );

      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setSaving(false);
    }
  };


  return (
    <>
      <div className="grid-2">

        {/* Title */}
        <FormField
          label="Announcement Title *"
          error={errors.title}
        >
          <input
            className={`input ${
              errors.title ? "error" : ""
            }`}
            value={form.title}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                title: e.target.value,
              }))
            }
            placeholder="AI Club Applications Are Open!"
          />
        </FormField>


        {/* Badge */}
        <FormField label="Badge / Tag">
          <input
            className="input"
            value={form.badge}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                badge: e.target.value,
              }))
            }
            placeholder="Applications Open · Batch 2026"
          />
        </FormField>


        {/* Button Text */}
        <FormField
          label="Button Text *"
          error={errors.buttonText}
        >
          <input
            className={`input ${
              errors.buttonText ? "error" : ""
            }`}
            value={form.buttonText}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                buttonText: e.target.value,
              }))
            }
            placeholder="Apply Now"
          />
        </FormField>


        {/* Button Link */}
        <FormField
          label="Button Link *"
          error={errors.buttonLink}
        >
          <input
            className={`input ${
              errors.buttonLink ? "error" : ""
            }`}
            value={form.buttonLink}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                buttonLink: e.target.value,
              }))
            }
            placeholder="/apply"
          />
        </FormField>

      </div>


      {/* Description */}
      <FormField
        label="Description *"
        error={errors.description}
      >
        <textarea
          className={`input ${
            errors.description ? "error" : ""
          }`}
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              description: e.target.value,
            }))
          }
          rows={4}
          placeholder="Want to learn, build, research, and innovate with AI?"
        />
      </FormField>


      {/* Settings */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.85rem",
          marginBottom: "1.5rem",
          padding: "1rem",
          borderRadius: 12,
          background: "var(--bg2)",
          border: "1px solid var(--border2)",
        }}
      >

        {/* Active */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            cursor: "pointer",
            fontSize: "0.875rem",
            color: "var(--text2)",
          }}
        >
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                active: e.target.checked,
              }))
            }
            style={{
              width: 16,
              height: 16,
              accentColor: "var(--accent)",
              cursor: "pointer",
            }}
          />

          <span>
            <strong style={{ color: "var(--text)" }}>
              Active
            </strong>
            <br />
            <span style={{ fontSize: "0.75rem" }}>
              Announcement is available on the website.
            </span>
          </span>
        </label>


        {/* Popup */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            cursor: "pointer",
            fontSize: "0.875rem",
            color: "var(--text2)",
          }}
        >
          <input
            type="checkbox"
            checked={form.showPopup}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                showPopup: e.target.checked,
              }))
            }
            style={{
              width: 16,
              height: 16,
              accentColor: "var(--accent)",
              cursor: "pointer",
            }}
          />

          <span>
            <strong style={{ color: "var(--text)" }}>
              Show as Popup
            </strong>
            <br />
            <span style={{ fontSize: "0.75rem" }}>
              Show this announcement to website visitors.
            </span>
          </span>
        </label>

      </div>


      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
        }}
      >
        <button
          className="btn btn-ghost"
          style={{ flex: 1 }}
          onClick={onClose}
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
              {announcement
                ? "Saving…"
                : "Creating…"}
            </>
          ) : announcement ? (
            "Save Changes"
          ) : (
            "Add Announcement"
          )}
        </button>
      </div>
    </>
  );
}


// ─────────────────────────────────────────────
// Admin Announcements Page
// ─────────────────────────────────────────────

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] =
    useState<Announcement[]>([]);

  const [loading, setLoading] = useState(true);

  const [modal, setModal] =
    useState<Announcement | null | undefined>(
      undefined
    );

  const [search, setSearch] = useState("");

  const { confirm, Dialog } = useConfirm();


  // ─────────────────────────────────────────────
  // Load announcements
  // ─────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const { announcements } =
        await announcementsApi.list();

      setAnnouncements(announcements);
    } catch (e: unknown) {
      showToast.error(
        e instanceof Error
          ? e.message
          : "Failed to load announcements"
      );
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    load();
  }, [load]);


  // ─────────────────────────────────────────────
  // Save announcement
  // ─────────────────────────────────────────────

  const handleSave = async (
    data: Partial<Announcement>,
    id?: string
  ) => {
    try {
      if (id) {
        const { announcement } =
          await announcementsApi.update(
            id,
            data
          );

        setAnnouncements((prev) =>
          prev.map((a) =>
            a._id === id
              ? announcement
              : a
          )
        );

        showToast.success(
          "Announcement updated successfully"
        );
      } else {
        const { announcement } =
          await announcementsApi.create(data);

        setAnnouncements((prev) => [
          announcement,
          ...prev,
        ]);

        showToast.success(
          "Announcement created successfully"
        );
      }
    } catch (e: unknown) {
      showToast.error(
        e instanceof Error
          ? e.message
          : "Failed to save announcement"
      );

      throw e;
    }
  };


  // ─────────────────────────────────────────────
  // Delete announcement
  // ─────────────────────────────────────────────

  const handleDelete = async (
    id: string,
    title: string
  ) => {
    const ok = await confirm(
      `Delete "${title}"?`
    );

    if (!ok) return;

    try {
      await announcementsApi.delete(id);

      setAnnouncements((prev) =>
        prev.filter((a) => a._id !== id)
      );

      showToast.success(
        "Announcement deleted"
      );
    } catch (e: unknown) {
      showToast.error(
        e instanceof Error
          ? e.message
          : "Delete failed"
      );
    }
  };


  // ─────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────

  const filtered = announcements.filter(
    (a) =>
      `${a.title} ${
        a.description
      } ${a.badge || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );


  return (
    <div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.75rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <Megaphone
              size={22}
              style={{
                color: "var(--accent)",
              }}
            />

            <h1
              style={{
                fontSize: "1.65rem",
                marginBottom: "0.2rem",
              }}
            >
              Announcements
            </h1>
          </div>

          <p
            style={{
              color: "var(--text2)",
              fontSize: "0.875rem",
            }}
          >
            {announcements.length}{" "}
            announcement
            {announcements.length !== 1
              ? "s"
              : ""}{" "}
            — manage website announcements
          </p>
        </div>


        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "0.65rem",
          }}
        >
          <button
            className="btn btn-ghost btn-sm"
            onClick={load}
            title="Refresh"
          >
            <RefreshCw
              size={14}
              style={{
                animation: loading
                  ? "spin 1s linear infinite"
                  : "none",
              }}
            />
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setModal(null)}
          >
            <Plus size={14} />
            Add Announcement
          </button>
        </div>
      </div>


      {/* Search */}
      <div
        style={{
          position: "relative",
          maxWidth: 380,
          marginBottom: "1.25rem",
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
          placeholder="Search announcements…"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>


      {/* Table */}
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
              justifyContent: "center",
            }}
          >
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📢"
            title={
              announcements.length === 0
                ? "No announcements yet"
                : "No matches"
            }
            description={
              announcements.length === 0
                ? "Create an announcement to show it on the website."
                : "Try a different search."
            }
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
                  <th>Announcement</th>
                  <th>Badge</th>
                  <th>Status</th>
                  <th>Popup</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((a) => (
                  <tr key={a._id}>

                    {/* Announcement */}
                    <td>
                      <div
                        style={{
                          maxWidth: 360,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            marginBottom:
                              "0.25rem",
                          }}
                        >
                          {a.title}
                        </div>

                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text3)",
                            lineHeight: 1.5,
                          }}
                        >
                          {a.description}
                        </div>
                      </div>
                    </td>


                    {/* Badge */}
                    <td>
                      <span className="badge badge-blue">
                        {a.badge || "—"}
                      </span>
                    </td>


                    {/* Active */}
                    <td>
                      <span
                        className={`badge ${
                          a.active
                            ? "badge-green"
                            : "badge-gray"
                        }`}
                      >
                        {a.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>


                    {/* Popup */}
                    <td>
                      <span
                        className={`badge ${
                          a.showPopup &&
                          a.active
                            ? "badge-green"
                            : "badge-gray"
                        }`}
                      >
                        {a.showPopup &&
                        a.active
                          ? "Visible"
                          : "Hidden"}
                      </span>
                    </td>


                    {/* Created */}
                    <td
                      style={{
                        fontSize: "0.78rem",
                        color:
                          "var(--text3)",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {new Date(
                        a.createdAt
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
                            setModal(a)
                          }
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Edit"
                        >
                          <Edit size={13} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              a._id,
                              a.title
                            )
                          }
                          className="btn btn-danger btn-icon btn-sm"
                          title="Delete"
                        >
                          <Trash2
                            size={13}
                          />
                        </button>

                        {a.buttonLink && (
                          <a
                            href={
                              a.buttonLink
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-icon btn-sm"
                            title="Open link"
                          >
                            <ExternalLink
                              size={13}
                            />
                          </a>
                        )}

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>


      {/* Modal */}
      <Modal
        open={modal !== undefined}
        onClose={() =>
          setModal(undefined)
        }
        title={
          modal?._id
            ? "Edit Announcement"
            : "Add Announcement"
        }
        size="lg"
      >
        <AnnouncementModal
          announcement={modal}
          onClose={() =>
            setModal(undefined)
          }
          onSave={handleSave}
        />
      </Modal>


      <Dialog />

      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

    </div>
  );
}