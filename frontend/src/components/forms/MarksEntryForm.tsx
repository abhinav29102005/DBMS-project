'use client';
 
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRecordMarks } from '@/hooks/useFaculty';

const MarksSchema = z.object({
  internal: z.number().min(0).max(50),
  external: z.number().min(0).max(50),
  grade: z.string().min(1).max(2).toUpperCase(),
});

type MarksFormValues = z.infer<typeof MarksSchema>;

interface Props {
  studentName: string;
  studentId: string;
  offeringId: string;
  onSuccess: () => void;
}

export function MarksEntryForm({ studentName, studentId, offeringId, onSuccess }: Props) {
  const { mutateAsync: recordMarks } = useRecordMarks();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MarksFormValues>({
    resolver: zodResolver(MarksSchema),
    defaultValues: {
      internal: 0,
      external: 0,
      grade: 'F'
    }
  });

  const onSubmit = async (data: MarksFormValues) => {
    try {
      await recordMarks({
        studentId,
        offeringId,
        marksInternal: data.internal,
        marksExternal: data.external,
        grade: data.grade
      });
      toast.success(`Marks updated for ${studentName}`);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update marks');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold">
          {studentName.charAt(0)}
        </div>
        <div className="font-bold text-gray-900">{studentName}</div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Internal (0-50)"
            type="number"
            error={errors.internal?.message}
            {...register('internal', { valueAsNumber: true })}
          />
          <Input
            label="External (0-50)"
            type="number"
            error={errors.external?.message}
            {...register('external', { valueAsNumber: true })}
          />
        </div>
        <Input
          label="Grade (e.g. A+, B, F)"
          placeholder="A+"
          error={errors.grade?.message}
          {...register('grade')}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" type="button" onClick={onSuccess}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" loading={isSubmitting}>
          Save & Submit
        </Button>
      </div>
    </form>
  );
}
