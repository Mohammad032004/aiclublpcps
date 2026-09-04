// This module is for server-safe imports; for client usage prefer @/components/ui showToast
export const toast = {
  success: (msg: string) => { if (typeof window !== "undefined") { try { const e = new CustomEvent("toast", { detail: { message: msg, type: "success" } }); window.dispatchEvent(e); } catch {} } },
  error: (msg: string) => { if (typeof window !== "undefined") { try { const e = new CustomEvent("toast", { detail: { message: msg, type: "error" } }); window.dispatchEvent(e); } catch {} } },
};
