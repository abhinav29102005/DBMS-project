import { apiFetch } from '@/lib/api';

export interface StaffStats {
  pendingTickets: number;
  upcomingEvents: number;
  pendingFacilities: number;
}

export const staffService = {
  getDashboardStats: async (): Promise<StaffStats> => {
    return apiFetch('/api/v1/reporting/staff/stats');
  }
};
