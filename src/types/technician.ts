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
  national_id_document?: string | null;
  criminal_record?: string | null;
  criminal_record_uploaded_at?: string | null;
  criminal_record_expires_at?: string | null;
  criminal_record_is_expired?: boolean;
  criminal_record_expiry_notice?: string;
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
  certificates: null;
  criminal_record: null;
  national_id_document: null;
}>;
