import { apiFetch } from '@/lib/api';

export interface FacultyStats {
  totalStudents: number;
  activeCourses: number;
  avgAttendance: string;
  pendingMarks: number;
}

export interface Lecture {
  time: string;
  subject: string;
  section: string;
  room: string;
  color?: string;
}

export const facultyService = {
  getDashboardStats: async (): Promise<FacultyStats> => {
    return apiFetch('/api/v1/academic/faculty/me/stats');
  },

  getAdvisees: async (): Promise<any[]> => {
    return apiFetch('/api/v1/academic/faculty/me/advisees');
  },

  getSchedule: async (): Promise<Lecture[]> => {
    return apiFetch('/api/v1/academic/faculty/me/schedule');
  },

  getOfferings: async () => {
    return apiFetch('/api/v1/academic/faculty/me/offerings');
  },

  getOfferingStudents: async (offeringId: string): Promise<any[]> => {
    return apiFetch(`/api/v1/academic/faculty/offerings/${offeringId}/students`);
  },
  
  recordMarks: async (data: any) => {
    return apiFetch('/api/v1/academic/faculty/marks', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
