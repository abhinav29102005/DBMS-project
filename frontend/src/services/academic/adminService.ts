import { apiFetch } from '@/lib/api';

export interface AdminStats {
  totalStudents: number;
  totalFaculty: number;
  activeCourses: number;
  totalUsers: number;
  hostelOccupancy: number;
  library: {
    total_books: number;
    active_issues: number;
    overdue_books: number;
  };
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
  },

  getStudents: async (filters?: any): Promise<any[]> => {
    const params = new URLSearchParams(filters).toString();
    return apiFetch(`/api/v1/academic/students?${params}`);
  },

  createStudent: async (data: any): Promise<any> => {
    return apiFetch('/api/v1/academic/students', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
