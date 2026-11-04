export interface Confession {
  id: string;
  sender_name: string | null;
  crush_name: string;
  department: string;
  academic_year: string;
  confession_message: string;
  publication_consent: boolean;
  status: 'pending' | 'approved' | 'rejected';
  instagram_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModerationLog {
  id: string;
  confession_id: string;
  admin_id: string;
  action: string;
  previous_status: string | null;
  new_status: string | null;
  notes: string | null;
  created_at: string;
}

export interface AdminProfile {
  id: string;
  role: string;
  created_at: string;
}

export interface ConfessionFilters {
  status?: string;
  department?: string;
  academicYear?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  published: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

export type Department = 'B.Tech' | 'MBA' | 'MCA' | 'Pharm B' | 'Pharm D';

export const DEPARTMENTS: Department[] = ['B.Tech', 'MBA', 'MCA', 'Pharm B', 'Pharm D'];

export const DEPARTMENT_YEARS: Record<Department, string[]> = {
  'B.Tech': ['1st', '2nd', '3rd', '4th', 'Graduated'],
  'MBA': ['1st', '2nd'],
  'MCA': ['1st', '2nd'],
  'Pharm B': ['1st', '2nd', '3rd', '4th'],
  'Pharm D': ['1st', '2nd', '3rd', '4th', '5th'],
};
