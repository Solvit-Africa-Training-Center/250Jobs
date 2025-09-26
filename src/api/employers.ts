import http from "../lib/http";
import type { EmployerProfile, TechnicianMini, EmployerApplication, Paginated } from "../types/employer";
import type { Job } from "../types/job";
import type { ReviewItem } from "./technicians";

// Employer profile
export async function getEmployerMe(): Promise<EmployerProfile> {
  const res = await http.get<EmployerProfile>("/employers/me/");
  return res.data;
}

export async function updateEmployerMe(payload: Partial<EmployerProfile>): Promise<EmployerProfile> {
  const res = await http.patch<EmployerProfile>("/employers/me/", payload);
  return res.data;
}

export async function uploadEmployerLogo(file: File): Promise<EmployerProfile> {
  const form = new FormData();
  form.append("logo", file);
  const res = await http.patch<EmployerProfile>("/employers/me/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Browse technicians
export async function listTechnicians(params?: Record<string, any>): Promise<Paginated<TechnicianMini>> {
  const res = await http.get<Paginated<TechnicianMini>>("/employers/technicians/", { params });
  return res.data;
}

// Jobs
export type JobCreatePayload = Pick<Job, "title" | "description" | "category" | "location" | "budget" | "currency">;

export async function postJob(payload: JobCreatePayload): Promise<Job> {
  const res = await http.post<Job>("/employers/jobs/", payload);
  return res.data;
}

export async function myJobs(params?: Record<string, any>): Promise<Paginated<Job>> {
  const res = await http.get<Paginated<Job>>("/employers/jobs/mine/", { params });
  return res.data;
}

export async function getMyJob(id: number): Promise<Job> {
  const res = await http.get<Job>(`/employers/jobs/${id}/`);
  return res.data;
}

export async function updateMyJob(id: number, payload: Partial<JobCreatePayload>): Promise<Job> {
  const res = await http.patch<Job>(`/employers/jobs/${id}/`, payload);
  return res.data;
}

export async function deleteMyJob(id: number): Promise<void> {
  await http.delete(`/employers/jobs/${id}/`);
}

// Applications
export async function listApplicants(params?: Record<string, any>): Promise<Paginated<EmployerApplication>> {
  const res = await http.get<Paginated<EmployerApplication>>("/employers/applicants/", { params });
  return res.data;
}

export async function setApplicantStatus(applicationId: number, newStatus: "SHORTLISTED" | "HIRED" | "REJECTED" | "PENDING") {
  const res = await http.post<{ ok: boolean; status: string; application_id: number }>(
    `/employers/applicants/${applicationId}/status/${newStatus}/`,
    {}
  );
  return res.data;
}

export async function createTechnicianReview(technicianId: number, payload: { rating: number; comment?: string }): Promise<ReviewItem> {
  const res = await http.post<ReviewItem>(`/employers/technicians/${technicianId}/reviews/`, payload);
  return res.data;
}
