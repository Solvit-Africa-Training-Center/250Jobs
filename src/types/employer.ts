export interface EmployerProfile {
  id: number;
  company_name: string;
  company_description?: string;
  location?: string;
  logo?: string | null;
}

export interface SkillMini { id: number; name: string }

export interface TechnicianMini {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  bio?: string;
  location?: string;
  years_experience?: number;
  rating_avg?: number | string;
  rating_count?: number;
  skills: SkillMini[];
  certificates?: string | null;
  latest_review_comment?: string | null;
  is_approved: boolean;
}

export interface EmployerApplication {
  id: number;
  job: number;
  technician: number;
  technician_profile: TechnicianMini;
  cover_letter: string;
  status: string; // APPLIED | SHORTLISTED | HIRED | REJECTED
  created_at: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
