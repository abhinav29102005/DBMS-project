import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = "Something went wrong", 
  message = "We encountered an error while loading this data. Please try again later.",
  onRetry 
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-red-100 shadow-sm">
      <div className="h-16 w-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RotateCcw size={16} />
          Retry Request
        </Button>
      )}
    </div>
  );
}
