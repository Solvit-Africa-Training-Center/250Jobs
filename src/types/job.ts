export interface Job {
  id: number;
  employer_id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  budget: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  applications_count: number;
  // Optional fields if backend provides employment details
  employment_type?: 'Full-time' | 'Part-time' | 'Contract' | string;
  duration?: string; // e.g., '3 months', '9am–5pm'
  employer_company?: string;
  has_applied?: boolean;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface JobApplication {
  id: number;
  job: number;
  job_title: string;
  technician: number;
  technician_id: number;
  cover_letter: string;
  status: string;
  shortlisted_at: string | null;
  hired_at: string | null;
  created_at: string;
}
