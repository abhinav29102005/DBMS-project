import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examService } from '@/services/exam/examService';
import { facultyService, FacultyStats, Lecture } from '@/services/academic/facultyService';

export function useFacultyStats() {
  return useQuery<FacultyStats>({
    queryKey: ['faculty', 'stats'],
    queryFn: facultyService.getDashboardStats,
  });
}

export function useFacultySchedule() {
  return useQuery<Lecture[]>({
    queryKey: ['faculty', 'schedule'],
    queryFn: facultyService.getSchedule,
  });
}

export function useFacultyOfferings() {
  return useQuery({
    queryKey: ['faculty', 'offerings'],
    queryFn: facultyService.getOfferings,
  });
}

export function useExamMarks(examId: string) {
  return useQuery({
    queryKey: ['exam', 'marks', examId],
    queryFn: () => examService.getMarks(examId),
    enabled: !!examId,
  });
}

export function useUpdateMarks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, studentId, marks }: { examId: string, studentId: string, marks: number }) =>
      examService.updateMarks(examId, studentId, marks),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['exam', 'marks', variables.examId] });
    },
  });
}
