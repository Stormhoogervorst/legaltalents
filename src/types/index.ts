export type UserRole = "job_seeker" | "employer" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  company_name: string | null;
  company_logo_url: string | null;
  created_at: string;
}

export type EmploymentType = "full_time" | "part_time" | "contract" | "internship" | "freelance";
export type ExperienceLevel = "entry" | "mid" | "senior" | "lead" | "executive";
export type VacancyStatus = "open" | "closed" | "draft";

export interface Vacancy {
  id: string;
  employer_id: string;
  title: string;
  company_name: string;
  company_logo_url: string | null;
  location: string;
  remote: boolean;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  description: string;
  requirements: string;
  status: VacancyStatus;
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus = "pending" | "reviewing" | "interview" | "rejected" | "accepted";

export interface Application {
  id: string;
  vacancy_id: string;
  applicant_id: string;
  cover_letter: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  vacancy?: Vacancy;
  applicant?: Profile;
}
