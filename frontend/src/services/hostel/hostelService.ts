import { apiFetch } from '@/lib/api';

export const hostelService = {
  getBedsAvailability: async () => {
    return apiFetch('/api/v1/hostel/beds/availability');
  },

  getAllocations: async (filters?: any) => {
    const params = new URLSearchParams(filters).toString();
    return apiFetch(`/api/v1/hostel/allocations?${params}`);
  },

  allocateBed: async (data: any) => {
    return apiFetch('/api/v1/hostel/allocations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deallocateBed: async (id: string) => {
    return apiFetch(`/api/v1/hostel/allocations/${id}`, {
      method: 'DELETE',
    });
  }
};
