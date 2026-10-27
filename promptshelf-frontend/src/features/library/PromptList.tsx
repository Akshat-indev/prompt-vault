import type { FC } from 'react';
import { PromptCard } from './PromptCard';
import type { Prompt } from '../../types/prompt';
import { Plus, SearchX } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PromptListProps {
  prompts: Prompt[];
  totalPromptsCount: number;
  isLoading: boolean;
  viewMode: 'grid' | 'list';
  onCustomize: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onDuplicate: (id: string) => void;
  onDeleteRequest: (prompt: Prompt) => void;
  onToggleFavorite: (id: string) => void;
  onTagClick?: (tag: string) => void;
  onNotify?: (message: string, type?: 'success' | 'info' | 'error') => void;
  onOpenCreate: () => void;
  onResetFilters: () => void;
}

export const PromptList: FC<PromptListProps> = ({
  prompts,
  totalPromptsCount,
  isLoading,
  viewMode,
  onCustomize,
  onEdit,
  onDuplicate,
  onDeleteRequest,
  onToggleFavorite,
  onTagClick,
  onNotify,
  onOpenCreate,
  onResetFilters,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-36 rounded-xl bg-[#111111] border border-[#262626] animate-pulse p-5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-5 w-20 bg-[#1A1A1A] rounded" />
              <div className="h-5 w-3/4 bg-[#1A1A1A] rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (prompts.length === 0) {
    if (totalPromptsCount > 0) {
      // Filters or search caused 0 results
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] text-[#737373] mb-4">
            <SearchX className="w-7 h-7" />
          </div>
          <h3 className="text-base font-medium text-[#F5F5F5]">No matching prompts found</h3>
          <p className="text-xs text-[#A1A1AA] max-w-sm mt-1 mb-5">
            Try adjusting your search query, clearing filters, or switching categories.
          </p>
          <button
            onClick={onResetFilters}
            className="px-4 py-2 text-xs font-medium text-[#F5F5F5] bg-[#171717] hover:bg-[#262626] border border-[#262626] rounded-lg transition-colors cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      );
    }

    // Keep an empty library unobtrusive; examples remain available from the sidebar.
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center">
        <h3 className="text-sm font-medium text-[#F5F5F5]">Your library is empty</h3>
        <p className="max-w-sm text-xs text-[#737373]">
          Analyze a prompt above to create your first reusable template.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-2 rounded-lg border border-[#333333] bg-[#171717] px-3 py-2 text-xs font-medium text-[#F5F5F5] transition-colors hover:bg-[#262626] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create a prompt</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'pt-4',
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'flex flex-col gap-3'
      )}
    >
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          viewMode={viewMode}
          onCustomize={onCustomize}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDeleteRequest={onDeleteRequest}
          onToggleFavorite={onToggleFavorite}
          onTagClick={onTagClick}
          onNotify={onNotify}
        />
      ))}
    </div>
  );
};
