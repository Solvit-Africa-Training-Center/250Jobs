import http from "../lib/http";
import type { Job, Paginated, JobApplication } from "../types/job";

export async function listJobs(params?: Record<string, any>): Promise<Paginated<Job>> {
  const res = await http.get<Paginated<Job>>("/jobs/", { params });
  return res.data;
}

export async function getJob(id: number): Promise<Job> {
  const res = await http.get<Job>(`/jobs/${id}/`);
  return res.data;
}

export async function applyToJob(jobId: number, cover_letter?: string): Promise<JobApplication> {
  const res = await http.post<JobApplication>(`/technicians/jobs/${jobId}/apply/`, cover_letter ? { cover_letter } : {});
  return res.data;
}

export async function myApplications(page?: number, params?: Record<string, any>): Promise<Paginated<JobApplication>> {
  const res = await http.get<Paginated<JobApplication>>("/technicians/applications/mine/", { params: { page, ...(params || {}) } });
  return res.data;
}
