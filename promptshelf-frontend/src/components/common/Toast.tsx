import { useEffect, type FC } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: FC<{ toast: ToastMessage; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border border-[#262626] bg-[#141414] shadow-2xl transition-all duration-200 animate-in slide-in-from-bottom-2'
      )}
    >
      <div className="shrink-0 mt-0.5 text-[#F5F5F5]">
        {toast.type === 'success' && <Check className="w-4 h-4 text-[#F5F5F5]" />}
        {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#A1A1AA]" />}
        {toast.type === 'info' && <Info className="w-4 h-4 text-[#A1A1AA]" />}
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-[#F5F5F5]">{toast.message}</p>
        {toast.description && (
          <p className="text-xs text-[#737373] mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 text-[#737373] hover:text-[#F5F5F5] p-1 rounded hover:bg-[#191919] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
