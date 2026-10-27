import type { FC } from 'react';
import { Trash2, X } from 'lucide-react';
import type { Prompt } from '../../types/prompt';

interface DeleteConfirmModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const DeleteConfirmModal: FC<DeleteConfirmModalProps> = ({
  prompt,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !prompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#0D0D0D] border border-[#262626] rounded-xl shadow-2xl p-6 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#171717] border border-[#262626] text-[#F5F5F5]">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 id="delete-dialog-title" className="text-base font-medium text-[#F5F5F5]">
              Delete Prompt
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#737373] hover:text-[#F5F5F5] p-1.5 rounded-lg hover:bg-[#171717] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4">
          <p className="text-sm text-[#A1A1AA]">
            Are you sure you want to permanently delete{' '}
            <span className="font-medium text-[#F5F5F5]">"{prompt.title}"</span>?
          </p>
          <p className="text-xs text-[#737373] mt-2">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#A1A1AA] hover:text-[#F5F5F5] bg-[#171717] hover:bg-[#262626] rounded-lg border border-[#262626] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(prompt.id);
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#090909] bg-[#F5F5F5] hover:bg-[#E5E5E5] rounded-lg transition-all active:scale-[0.98]"
          >
            <span>Delete Prompt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
