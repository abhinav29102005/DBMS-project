import { apiFetch } from '@/lib/api';
import { StudentStats } from '@/types/api';

export const studentService = {
  getDashboardStats: async () => {
    return apiFetch<StudentStats>('/api/v1/academic/students/me/stats');
  },

  getEnrollments: async () => {
    return apiFetch('/api/v1/academic/students/me/courses');
  },

  getResults: async (semesterId?: string) => {
    const query = semesterId ? `?semesterId=${semesterId}` : '';
    return apiFetch(`/api/v1/academic/students/me/results${query}`);
  },

  getAllocations: async () => {
    return apiFetch('/api/v1/hostel/my-allocation');
  },

  getLibraryIssues: async () => {
    return apiFetch('/api/v1/library/my-issues');
  },

  getExams: async () => {
    return apiFetch('/api/v1/academic/students/me/exams');
  },

  getSchedule: async () => {
    return apiFetch('/api/v1/academic/students/me/schedule');
  },

  getAvailableOfferings: async () => {
    return apiFetch('/api/v1/academic/offerings/available');
  },

  enrollInCourse: async (offeringId: string) => {
    return apiFetch('/api/v1/academic/enroll', {
      method: 'POST',
      body: JSON.stringify({ offeringId })
    });
  }
};
