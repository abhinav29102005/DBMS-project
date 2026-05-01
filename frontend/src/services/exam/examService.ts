import { apiFetch } from '@/lib/api';

export const examService = {
  getExams: async () => {
    return apiFetch('/api/v1/exam/exams');
  },

  getMarks: async (examId: string) => {
    return apiFetch(`/api/v1/exam/exams/${examId}/marks`);
  },

  updateMarks: async (examId: string, studentId: string, marks: number) => {
    return apiFetch(`/api/v1/exam/exams/${examId}/marks/${studentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ marks_obtained: marks }),
    });
  },

  publishResults: async (offeringId: string) => {
    return apiFetch(`/api/v1/exam/course-offerings/${offeringId}/results/publish`, {
      method: 'POST',
    });
  }
};
