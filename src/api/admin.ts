import http from "../lib/http";

// Types
export type AdminUser = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  phone_number?: string;
  location?: string;
  profile_picture?: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login?: string | null;
};

export type AdminTechnician = {
  id: number;
  user: number;
  user_username: string;
  bio?: string;
  years_experience?: number;
  location?: string;
  is_approved: boolean;
  is_paused: boolean;
  trial_ends_at?: string | null;
  rating_avg?: number;
  rating_count?: number;
  has_active_subscription?: boolean;
};

export type AdminSubscription = {
  id: number;
  user: number;
  user_username: string;
  plan: number;
  plan_name: string;
  amount: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

export async function getAnalyticsSummary() {
  const res = await http.get("/admin/analytics/summary/");
  return res.data as { total_users: number; posted_jobs: number; total_revenue: number; pending_approvals: number };
}

// Users
export async function listAdminUsers(params?: Record<string, any>) {
  const res = await http.get("/admin/users/", { params });
  return res.data as AdminUser[];
}

export async function createAdminUser(payload: Partial<AdminUser> & { password?: string }) {
  const res = await http.post("/admin/users/", payload);
  return res.data as AdminUser;
}

export async function updateAdminUser(id: number, payload: Partial<AdminUser> & { password?: string }) {
  const res = await http.patch(`/admin/users/${id}/`, payload);
  return res.data as AdminUser;
}

export async function deleteAdminUser(id: number) {
  await http.delete(`/admin/users/${id}/`);
}

// Technicians
export async function listAdminTechnicians(params?: Record<string, any>) {
  const res = await http.get("/admin/technicians/", { params });
  return res.data as AdminTechnician[];
}

export async function approveTechnician(id: number) {
  const res = await http.post(`/admin/technicians/${id}/approve/`);
  return res.data;
}
export async function revokeTechnician(id: number) {
  const res = await http.post(`/admin/technicians/${id}/revoke/`);
  return res.data;
}
export async function pauseTechnician(id: number) {
  const res = await http.post(`/admin/technicians/${id}/pause/`);
  return res.data;
}
export async function resumeTechnician(id: number) {
  const res = await http.post(`/admin/technicians/${id}/resume/`);
  return res.data;
}

export async function listPendingTechnicians() {
  const res = await http.get("/admin/technicians/pending/");
  return res.data as AdminTechnician[];
}

// Subscriptions
export async function listAdminSubscriptions(params?: Record<string, any>) {
  const res = await http.get("/admin/subscriptions/", { params });
  return res.data as AdminSubscription[];
}

