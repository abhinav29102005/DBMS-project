import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/services/academic/studentService';
import { StudentStats } from '@/types/api';

export function useStudentStats() {
  return useQuery<StudentStats>({
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

export function useStudentSchedule() {
  return useQuery({
    queryKey: ['student', 'schedule'],
    queryFn: studentService.getSchedule,
  });
}

export function useAvailableOfferings() {
  return useQuery({
    queryKey: ['student', 'offerings', 'available'],
    queryFn: studentService.getAvailableOfferings,
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useEnrollCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentService.enrollInCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'offerings', 'available'] });
    },
  });
}
