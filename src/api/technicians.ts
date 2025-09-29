import http from "../lib/http";
import type { TechnicianProfile, TechnicianProfileUpdate } from "../types/technician";

export async function getCurrentTechnician(): Promise<TechnicianProfile> {
  const res = await http.get<TechnicianProfile>("/technicians/me/");
  return res.data;
}

export async function updateCurrentTechnician(payload: TechnicianProfileUpdate): Promise<TechnicianProfile> {
  const res = await http.patch<TechnicianProfile>("/technicians/me/", payload);
  return res.data;
}

export async function uploadCertificate(file: File): Promise<TechnicianProfile> {
  const form = new FormData();
  form.append("certificates", file);
  const res = await http.patch<TechnicianProfile>("/technicians/me/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function uploadCriminalRecord(file: File): Promise<TechnicianProfile> {
  const form = new FormData();
  form.append("criminal_record", file);
  const res = await http.patch<TechnicianProfile>("/technicians/me/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function uploadNationalIdDocument(file: File): Promise<TechnicianProfile> {
  const form = new FormData();
  form.append("national_id_document", file);
  const res = await http.patch<TechnicianProfile>("/technicians/me/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export interface ReviewItem {
  id: number;
  technician: number;
  technician_id: number;
  reviewer: number;
  reviewer_username: string;
  rating: number;
  comment: string;
  created_at: string;
}

export async function listTechnicianReviews(technicianId: number): Promise<ReviewItem[]> {
  const res = await http.get<ReviewItem[]>(`/technicians/${technicianId}/reviews/`);
  return res.data;
}
