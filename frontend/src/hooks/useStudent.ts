import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/services/academic/studentService';

export function useStudentStats() {
  return useQuery({
    queryKey: ['student', 'stats'],
    queryFn: studentService.getDashboardStats,
  });
}

export function useStudentEnrollments() {
  return useQuery({
    queryKey: ['student', 'enrollments'],
    queryFn: studentService.getEnrollments,
  });
}

export function useStudentResults(semesterId?: string) {
  return useQuery({
    queryKey: ['student', 'results', semesterId],
    queryFn: () => studentService.getResults(semesterId),
  });
}

export function useStudentHostel() {
  return useQuery({
    queryKey: ['student', 'hostel'],
    queryFn: studentService.getAllocations,
  });
}

export function useStudentLibrary() {
  return useQuery({
    queryKey: ['student', 'library'],
    queryFn: studentService.getLibraryIssues,
  });
}
