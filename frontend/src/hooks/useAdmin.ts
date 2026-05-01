import { useQuery } from '@tanstack/react-query';
import { hostelService } from '@/services/hostel/hostelService';
import { libraryService } from '@/services/library/libraryService';

export function useHostelOccupancy() {
  return useQuery({
    queryKey: ['admin', 'hostel', 'occupancy'],
    queryFn: hostelService.getBedsAvailability,
  });
}

export function useLibraryStats() {
  return useQuery({
    queryKey: ['admin', 'library', 'stats'],
    queryFn: () => {

      return {};
    },
  });
}

export function useAllStudents(filters?: any) {
  return useQuery({
    queryKey: ['admin', 'students', filters],
    queryFn: () => {

      return [];
    },
  });
}
