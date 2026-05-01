import { apiFetch } from '@/lib/api';

export const libraryService = {
  getBooks: async (query?: string) => {
    return apiFetch(`/api/v1/library/books${query ? `?search=${query}` : ''}`);
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

  getStats: async () => {
    return apiFetch('/api/v1/reporting/library-stats');
  }
};
