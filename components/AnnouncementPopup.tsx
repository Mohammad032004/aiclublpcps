"use client";

import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { announcementsApi, Announcement } from "@/lib/api";

export default function AnnouncementPopup() {
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] =
    useState<Announcement | null>(null);

  useEffect(() => {
    let timer: number | undefined;

    const loadAnnouncement = async () => {
      try {
        const { announcements } =
          await announcementsApi.list();

        // Only use an active announcement
        // that has been selected to show as popup.
        const popupAnnouncement = announcements.find(
          (item) =>
            item.active === true &&
            item.showPopup === true
        );

        if (!popupAnnouncement) return;

        setAnnouncement(popupAnnouncement);

        // Show only once per browser session.
        const alreadyShown = sessionStorage.getItem(
          "ai-club-announcement-popup"
        );

        if (alreadyShown) return;

        timer = window.setTimeout(() => {
          setOpen(true);

          sessionStorage.setItem(
            "ai-club-announcement-popup",
            "true"
          );
        }, 1200);
      } catch (error) {
        console.error(
          "Failed to load announcement:",
          error
        );
      }
    };

    loadAnnouncement();

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  if (!open || !announcement) {
    return null;
  }

  const closePopup = () => {
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-popup-title"
      onClick={closePopup}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.25rem",
        background: "rgba(5, 10, 20, 0.62)",
        backdropFilter: "blur(7px)",
      }}
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          padding: "2rem",
          borderRadius: 24,
          background:
            "linear-gradient(145deg, #FFF9F4 0%, #F9EBDD 100%)",
          border: "1px solid #EED6C2",
          boxShadow:
            "0 25px 80px rgba(0, 0, 0, 0.28)",
          overflow: "hidden",
        }}
      >
        {/* Decorative element */}
        <div
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: "50%",
            background:
              "rgba(10, 102, 194, 0.07)",
            top: -80,
            right: -70,
          }}
        />

        {/* Close button */}
        <button
          type="button"
          onClick={closePopup}
          aria-label="Close announcement"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid #E3CDBB",
            background:
              "rgba(255, 255, 255, 0.7)",
            color: "#555",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          <X size={18} />
        </button>

        {/* AI Club Logo + Name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.25rem",
          }}
        >
          {/* Logo */}
          <div
            style={{
              position: "relative",
              width: 72,
              height: 72,
              flexShrink: 0,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "rgba(255, 255, 255, 0.7)",
              border:
                "1px solid rgba(10, 102, 194, 0.15)",
              overflow: "hidden",
            }}
          >
            <img
              src="/ai-club-logo.png"
              alt="AI Club Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: "7px",
              }}
            />
          </div>

          {/* Club Name */}
          <div>
            <div
              style={{
                fontSize: "1.05rem",
                fontWeight: 800,
                color: "#171717",
                lineHeight: 1.2,
              }}
            >
              Artificial Intelligence Club
            </div>

            <div
              style={{
                marginTop: "0.35rem",
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "#6B6560",
                letterSpacing: "0.04em",
              }}
            >
              Learn. Build. Innovate.
            </div>
          </div>
        </div>

        {/* Badge */}
        {announcement.badge && (
          <div
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              padding: "0.4rem 0.7rem",
              borderRadius: 999,
              background:
                "rgba(10, 102, 194, 0.08)",
              border:
                "1px solid rgba(10, 102, 194, 0.15)",
              color: "#0A66C2",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              marginBottom: "0.85rem",
            }}
          >
            {announcement.badge}
          </div>
        )}

        {/* Heading */}
        <h2
          id="announcement-popup-title"
          style={{
            position: "relative",
            margin: "0 0 0.8rem",
            fontSize:
              "clamp(1.6rem, 5vw, 2.15rem)",
            lineHeight: 1.18,
            fontWeight: 800,
            color: "#171717",
          }}
        >
          {announcement.title}
        </h2>

        {/* Description */}
        <p
  style={{
    position: "relative",
    margin: "0 0 1.5rem",
    color: "#5F5A56",
    fontSize: "0.95rem",
    lineHeight: 1.7,
    whiteSpace: "pre-line",
  }}
>
  {announcement.description}
</p>

        {/* Buttons */}
        <div
          style={{
            position: "relative",
            display: "flex",
            gap: "0.7rem",
            flexWrap: "wrap",
          }}
        >
          {announcement.buttonText &&
            announcement.buttonLink && (
              <a
                href={announcement.buttonLink}
                onClick={closePopup}
                className="btn btn-primary"
                style={{
                  flex: "1 1 170px",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                {announcement.buttonText}
                <ArrowRight size={16} />
              </a>
            )}

          <button
            type="button"
            onClick={closePopup}
            className="btn btn-ghost"
            style={{
              flex: "1 1 120px",
            }}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}