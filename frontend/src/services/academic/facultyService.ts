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

  getSchedule: async (): Promise<Lecture[]> => {
    return apiFetch('/api/v1/academic/faculty/me/schedule');
  },

  getOfferings: async () => {
    return apiFetch('/api/v1/academic/faculty/me/offerings');
  }
};
