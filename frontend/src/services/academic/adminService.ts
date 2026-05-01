import { apiFetch } from '@/lib/api';

export interface AdminStats {
  totalStudents: number;
  totalFaculty: number;
  activeCourses: number;
  systemHealth: string;
  recentActivity: Array<{
    id: string;
    action: string;
    user: string;
    time: string;
  }>;
}

export const adminService = {
  getDashboardStats: async (): Promise<AdminStats> => {
    return apiFetch('/api/v1/reporting/admin/stats');
  },

  getSystemLogs: async (): Promise<any[]> => {
    return apiFetch('/api/v1/reporting/admin/logs');
  },

  getEnrollmentTrends: async (): Promise<any[]> => {
    return apiFetch('/api/v1/reporting/enrollment-trends');
  }
};
