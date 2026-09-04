export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); this.name = "ApiError"; }
}

async function req<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, cache: "no-store", ...opts });
  const data = await res.json();
  if (!res.ok) throw new ApiError(res.status, data.error || "Request failed");
  return data as T;
}

export type AppStatus = "pending" | "accepted" | "rejected";
export interface Application {
  _id: string; firstName: string; lastName: string; email: string;
  phone?: string; branch?: string; year?: string; cgpa?: number;
  college?: string; certifications?: string; skills?: string[]; domains?: string[];
  experience?: string; projectDesc?: string; whyJoin?: string; contribution?: string;
  goals?: string; github?: string; linkedin?: string; gender?: string;
  status: AppStatus; submittedAt: string;
}
export const applicationsApi = {
  list: (status?: string) => req<{ applications: Application[]; total: number }>(`/api/applications${status ? `?status=${status}` : ""}`),
  updateStatus: (id: string, status: AppStatus) => req<{ success: boolean; application: Application }>(`/api/applications/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  delete: (id: string) => req<{ success: boolean }>(`/api/applications/${id}`, { method: "DELETE" }),
};

export interface Member {
  _id: string; name: string; email: string; phone?: string; branch?: string; year?: string;
  role: "admin" | "core" | "member"; status: "active" | "inactive" | "alumni";
  github?: string; linkedin?: string; joinedAt: string; bio?: string; skills?: string[];
  showOnAbout?: boolean;
}
export const membersApi = {
  list: (params?: { role?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.role) q.set("role", params.role);
    if (params?.status) q.set("status", params.status);
    return req<{ members: Member[]; total: number }>(`/api/members?${q}`);
  },
  create: (data: Partial<Member>) => req<{ success: boolean; member: Member }>("/api/members", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Member>) => req<{ success: boolean; member: Member }>(`/api/members/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => req<{ success: boolean }>(`/api/members/${id}`, { method: "DELETE" }),
};

export interface Message {
  _id: string; name: string; email: string; subject: string; message: string;
  read: boolean; createdAt: string;
}
export const messagesApi = {
  list: (read?: boolean) => req<{ messages: Message[]; total: number }>(`/api/messages${read !== undefined ? `?read=${read}` : ""}`),
  markRead: (id: string, read: boolean) => req<{ success: boolean }>(`/api/messages/${id}`, { method: "PATCH", body: JSON.stringify({ read }) }),
  delete: (id: string) => req<{ success: boolean }>(`/api/messages/${id}`, { method: "DELETE" }),
};

export interface FormField { id: string; label: string; type: string; required: boolean; options?: string[]; }
export interface ClubEvent {
  _id: string; title: string; type: string; description?: string; date?: string;
  location?: string; maxAttendees?: number; status: "upcoming" | "ongoing" | "past" | "cancelled";
  registrationOpen: boolean; tags?: string[]; formFields?: FormField[];
  allowTeams?: boolean; maxTeamSize?: number;
}
export const eventsApi = {
  list: (status?: string) => req<{ events: ClubEvent[] }>(`/api/events${status ? `?status=${status}` : ""}`),
  create: (data: Partial<ClubEvent>) => req<{ success: boolean; id: string }>("/api/events", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ClubEvent>) => req<{ success: boolean; event: ClubEvent }>(`/api/events/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => req<{ success: boolean }>(`/api/events/${id}`, { method: "DELETE" }),
};

export interface Project {
  _id: string; title: string; description: string; category: string; tags?: string[];
  github?: string; liveDemo?: string; builtBy?: string[]; year?: number;
  featured: boolean; visible: boolean; award?: string;
}
export const projectsApi = {
  list: () => req<{ projects: Project[] }>("/api/projects"),
  create: (data: Partial<Project>) => req<{ success: boolean; id: string }>("/api/projects", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Project>) => req<{ success: boolean; project: Project }>(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => req<{ success: boolean }>(`/api/projects/${id}`, { method: "DELETE" }),
};

export interface Resource {
  _id: string; title: string; description?: string; category: string; type: string;
  url?: string; fileSize?: string; access: "public" | "members"; downloads: number; createdAt: string;
}
export const resourcesApi = {
  list: () => req<{ resources: Resource[] }>("/api/resources"),
  create: (data: Partial<Resource>) => req<{ success: boolean; id: string }>("/api/resources", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Resource>) => req<{ success: boolean; resource: Resource }>(`/api/resources/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => req<{ success: boolean }>(`/api/resources/${id}`, { method: "DELETE" }),
};
