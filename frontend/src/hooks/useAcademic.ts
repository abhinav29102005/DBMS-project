
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export function useDepartments() {
  return useQuery<any[]>({
    queryKey: ['academic', 'departments'],
    queryFn: () => apiFetch.get('/api/v1/academic/departments')
  });
}

export function usePrograms(departmentId?: string) {
  return useQuery<any[]>({
    queryKey: ['academic', 'programs', departmentId],
    queryFn: () => apiFetch.get(`/api/v1/academic/programs${departmentId ? `?departmentId=${departmentId}` : ''}`),
    enabled: !!departmentId || departmentId === undefined
  });
}

export function useSemesters() {
  return useQuery<any[]>({
    queryKey: ['academic', 'semesters'],
    queryFn: () => apiFetch.get('/api/v1/academic/semesters')
  });
}

export function useCourses(departmentId?: string) {
  return useQuery<any[]>({
    queryKey: ['academic', 'courses', departmentId],
    queryFn: () => apiFetch.get(`/api/v1/academic/courses${departmentId ? `?departmentId=${departmentId}` : ''}`)
  });
}
