export interface Skill { id: number; name: string }

export interface TechnicianProfile {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  phone_number?: string;
  bio?: string;
  years_experience?: number;
  location?: string;
  rating_avg?: number;
  rating_count?: number;
  skills?: Skill[];
  certificates?: string | null;
}

export type TechnicianProfileUpdate = Partial<{
  first_name: string;
  last_name: string;
  phone: string;
  phone_number: string;
  bio: string;
  years_experience: number;
  location: string;
  skill_names: string[];
}>;
