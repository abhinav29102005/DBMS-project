import { apiFetch } from '@/lib/api';

export const hostelService = {
  getBedsAvailability: async () => {
    return apiFetch('/api/v1/hostel/beds/availability');
  },

  getHostelStats: async () => {
    return apiFetch('/api/v1/reporting/hostel-stats');
  },

  getAllocations: async (filters?: any) => {
    const params = new URLSearchParams(filters).toString();
    return apiFetch(`/api/v1/hostel/allocations?${params}`);
  },

  allocateBed: async (data: any) => {
    return apiFetch('/api/v1/hostel/allocate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  raiseComplaint: async (data: { category: string; description: string; priority?: string }) => {
    return apiFetch('/api/v1/hostel/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  requestOutpass: async (data: { reason: string; destination: string; outTime: string; inTime: string }) => {
    return apiFetch('/api/v1/hostel/outpasses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deallocateBed: async (id: string) => {
    return apiFetch(`/api/v1/hostel/allocations/${id}/vacate`, {
      method: 'PUT',
    });
  }
};
