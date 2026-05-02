
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export function useHostels() {
  return useQuery<any[]>({
    queryKey: ['hostel', 'hostels'],
    queryFn: () => apiFetch.get('/api/v1/hostel/hostels')
  });
}

export function useRooms(hostelId?: string) {
  return useQuery<any[]>({
    queryKey: ['hostel', 'rooms', hostelId],
    queryFn: () => apiFetch.get(`/api/v1/hostel/rooms${hostelId ? `?hostelId=${hostelId}` : ''}`),
    enabled: !!hostelId || hostelId === undefined
  });
}

export function useAllocateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { roomId: string; bedId: string }) => apiFetch.post('/api/v1/hostel/allocations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'hostel'] });
    }
  });
}

export function useVacateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (allocationId: string) => apiFetch.put(`/api/v1/hostel/allocations/${allocationId}/vacate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'hostel'] });
    }
  });
}
