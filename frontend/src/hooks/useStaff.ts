import { useQuery } from '@tanstack/react-query';
import { staffService } from '@/services/academic/staffService';

export function useStaffStats() {
  return useQuery({
    queryKey: ['staff', 'stats'],
    queryFn: staffService.getDashboardStats,
  });
}
