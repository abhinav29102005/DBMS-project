import { apiFetch } from '@/lib/api';
import { StudentStats } from '@/types/api';

export const studentService = {
  getDashboardStats: async () => {
    return apiFetch<StudentStats>('/api/v1/academic/students/me/stats');
  },

  getEnrollments: async () => {
    return apiFetch('/api/v1/academic/students/me/enrollments');
  },

  getResults: async (semesterId?: string) => {
    const query = semesterId ? `?semester_id=${semesterId}` : '';
    return apiFetch(`/api/v1/exam/students/me/results${query}`);
  },

  getAllocations: async () => {
    return apiFetch('/api/v1/hostel/students/me/allocations');
  },

  getLibraryIssues: async () => {
    return apiFetch('/api/v1/library/members/me/issues');
  }
};
