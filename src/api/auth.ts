import http from "../lib/http";

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  role: "technician" | "employer" | "admin" | string;
  phone_number?: string | null;
  location?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await http.post<LoginResponse>("/accounts/login/", { email, password });
  return res.data;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role: "technician" | "employer" | "admin";
  phone_number?: string;
  location: string;
}

export async function register(data: RegisterPayload) {
  const res = await http.post("/accounts/register/", data);
  return res.data;
}

export async function me() {
  const res = await http.get("/accounts/me/");
  return res.data as { id: number; username: string; email: string; last_seen?: string | null };
}

export async function requestPasswordReset(email: string) {
  const res = await http.post("/accounts/password/reset/", { email });
  return res.data as { detail: string; uid?: string; token?: string };
}

export async function confirmPasswordReset(uid: string, token: string, new_password: string) {
  const res = await http.post("/accounts/password/reset/confirm/", { uid, token, new_password });
  return res.data as { detail: string };
}

