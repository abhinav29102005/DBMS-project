import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export const coreService = {
  getNotifications: async () => {
    return apiFetch('/api/v1/core/notifications');
  },
  markNotificationRead: async (id: string) => {
    return apiFetch(`/api/v1/core/notifications/${id}/read`, { method: 'PATCH' });
  }
};

export function useNotifications() {
  return useQuery({
    queryKey: ['core', 'notifications'],
    queryFn: coreService.getNotifications,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: coreService.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'notifications'] });
    },
  });
}
