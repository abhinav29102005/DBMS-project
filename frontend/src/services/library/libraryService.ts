import { apiFetch } from '@/lib/api';

export const libraryService = {
  getBooks: async (query?: string, subjectId?: string) => {
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (subjectId) params.append('subjectId', subjectId);
    return apiFetch(`/api/v1/library/books?${params.toString()}`);
  },

  getSubjects: async () => {
    return apiFetch('/api/v1/library/subjects');
  },

  getIssues: async (memberId: string) => {
    return apiFetch(`/api/v1/library/members/${memberId}/issues`);
  },

  getFines: async (memberId: string) => {
    return apiFetch(`/api/v1/library/fines?member_id=${memberId}`);
  },

  issueBook: async (data: any) => {
    return apiFetch('/api/v1/library/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  returnBook: async (id: string) => {
    return apiFetch(`/api/v1/library/issues/${id}/return`, {
      method: 'POST',
    });
  },

  addBook: async (data: any) => {
    return apiFetch('/api/v1/library/books', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getStats: async () => {
    return apiFetch('/api/v1/reporting/library-stats');
  }
};
