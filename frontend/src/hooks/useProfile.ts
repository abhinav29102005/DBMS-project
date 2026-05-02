
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface ProfileStatus {
  isComplete: boolean;
  role: string;
}

export function useProfileStatus() {
  return useQuery<ProfileStatus>({
    queryKey: ['profile', 'status'],
    queryFn: () => apiFetch.get('/api/v1/profile/status'),
    retry: false
  });
}

export function useSetupStudentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiFetch.post('/api/v1/profile/student', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'status'] });
    }
  });
}

export function useSetupFacultyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiFetch.post('/api/v1/profile/faculty', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'status'] });
    }
  });
}
