export interface EmployerProfile {
  id: number;
  company_name: string;
  company_description?: string;
  location?: string;
  logo?: string | null;
}

export interface SkillMini { id: number; name: string }

export interface TechnicianMini {
  user_id: number;
  first_name: string;
  last_name: string;
  location?: string;
  years_experience?: number;
  rating_avg?: number;
  rating_count?: number;
  skills: SkillMini[];
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
