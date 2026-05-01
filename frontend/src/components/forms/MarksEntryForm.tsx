'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const MarksSchema = z.object({
  internal: z.number().min(0).max(30),
  final: z.number().min(0).max(70),
});

type MarksFormValues = z.infer<typeof MarksSchema>;

interface Props {
  studentName: string;
  initialMarks: number;
  onSuccess: () => void;
}

export function MarksEntryForm({ studentName, initialMarks, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MarksFormValues>({
    resolver: zodResolver(MarksSchema),
    defaultValues: {
      internal: Math.min(initialMarks, 30),
      final: Math.max(0, initialMarks - 20),
    }
  });

  const onSubmit = async (data: MarksFormValues) => {
    try {

      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success(`Marks updated for ${studentName}: Total ${data.internal + data.final}`);
      onSuccess();
    } catch (err: any) {
      toast.error('Failed to update marks');
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
        <Input
          label="Internal Marks (0-30)"
          type="number"
          error={errors.internal?.message}
          {...register('internal', { valueAsNumber: true })}
        />
        <Input
          label="Final Exam Marks (0-70)"
          type="number"
          error={errors.final?.message}
          {...register('final', { valueAsNumber: true })}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" type="button" onClick={onSuccess}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" loading={isSubmitting}>
          Save Marks
        </Button>
      </div>
    </form>
  );
}
