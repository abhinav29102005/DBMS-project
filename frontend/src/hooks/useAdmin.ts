import { useQuery } from '@tanstack/react-query';
import { hostelService } from '@/services/hostel/hostelService';
import { libraryService } from '@/services/library/libraryService';
import { adminService, AdminStats } from '@/services/academic/adminService';

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: adminService.getDashboardStats,
  });
}

export function useEnrollmentTrends() {
  return useQuery<any[]>({
    queryKey: ['admin', 'trends', 'enrollment'],
    queryFn: adminService.getEnrollmentTrends,
  });
}

export function useHostelOccupancy() {
  return useQuery({
    queryKey: ['admin', 'hostel', 'occupancy'],
    queryFn: hostelService.getBedsAvailability,
  });
}

export function useLibraryStats() {
  return useQuery({
    queryKey: ['admin', 'library', 'stats'],
    queryFn: () => libraryService.getStats(),
  });
}

export function useAllStudents(filters?: any) {
  return useQuery({
    queryKey: ['admin', 'students', filters],
    queryFn: () => adminService.getStudents(filters),
  });
}

export function useAdminHostelStats() {
  return useQuery({
    queryKey: ['admin', 'hostel', 'stats'],
    queryFn: () => hostelService.getHostelStats(),
  });
}
