import { useState, type FC, type MouseEvent } from 'react';
import {
  Star,
  Copy,
  Check,
  MoreVertical,
  Edit2,
  Trash2,
  CopyPlus,
} from 'lucide-react';
import type { Prompt } from '../../types/prompt';
import { copyToClipboard } from '../../utils/clipboard';
import { cn } from '../../utils/cn';

interface PromptCardProps {
  prompt: Prompt;
  onCustomize: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onDuplicate: (id: string) => void;
  onDeleteRequest: (prompt: Prompt) => void;
  onToggleFavorite: (id: string) => void;
  onTagClick?: (tag: string) => void;
  onNotify?: (message: string, type?: 'success' | 'info' | 'error') => void;
  viewMode?: 'grid' | 'list';
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Coding: { bg: 'bg-[#171717]', text: 'text-[#A1A1AA]', border: 'border-[#303030]' },
  Debugging: { bg: 'bg-[#171717]', text: 'text-[#A1A1AA]', border: 'border-[#303030]' },
  Writing: { bg: 'bg-[#171717]', text: 'text-[#A1A1AA]', border: 'border-[#303030]' },
  Research: { bg: 'bg-[#171717]', text: 'text-[#A1A1AA]', border: 'border-[#303030]' },
  Productivity: { bg: 'bg-[#171717]', text: 'text-[#A1A1AA]', border: 'border-[#303030]' },
  Other: { bg: 'bg-[#171717]', text: 'text-[#A1A1AA]', border: 'border-[#262626]' },
};

export const PromptCard: FC<PromptCardProps> = ({
  prompt,
  onCustomize,
  onEdit,
  onDuplicate,
  onDeleteRequest,
  onToggleFavorite,
  onNotify,
  viewMode = 'grid',
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const categoryStyle = CATEGORY_STYLES[prompt.category] || CATEGORY_STYLES.Other;

  const handleQuickCopy = async (e: MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(prompt.content);
    if (success) {
      setCopied(true);
      onNotify?.(`Template copied to clipboard`, 'success');
      setTimeout(() => setCopied(false), 2000);
    } else {
      onNotify?.('Failed to copy to clipboard', 'error');
    }
  };

  const handleCardClick = () => {
    onCustomize(prompt);
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleCardClick}
        tabIndex={0}
        className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#111111] hover:bg-[#191919] focus:bg-[#191919] border border-[#262626] hover:border-[#383838] rounded-xl transition-all duration-200 cursor-pointer gap-4 outline-none"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'px-2.5 py-0.5 text-xs font-medium rounded border shrink-0',
                categoryStyle.bg,
                categoryStyle.text,
                categoryStyle.border
              )}
            >
              {prompt.category}
            </span>

            <h3 className="text-sm font-medium text-[#F5F5F5] truncate">
              {prompt.title}
            </h3>
          </div>

          {/* Description revealed on hover/focus */}
          <div className="max-h-0 sm:opacity-0 group-hover:max-h-16 group-hover:opacity-100 group-focus:max-h-16 group-focus:opacity-100 transition-all duration-200 overflow-hidden">
            {prompt.description && (
              <p className="text-xs text-[#A1A1AA] mt-2 line-clamp-1">
                {prompt.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(prompt.id);
            }}
            title={prompt.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={cn(
              'p-2 rounded-lg border transition-colors cursor-pointer',
              prompt.isFavorite
                ? 'bg-[#191919] text-[#F5F5F5] border-[#262626]'
                : 'text-[#737373] border-transparent hover:text-[#F5F5F5] hover:bg-[#191919]'
            )}
          >
            <Star className={cn('w-4 h-4', prompt.isFavorite && 'fill-[#F5F5F5]')} />
          </button>

          <button
            type="button"
            onClick={handleQuickCopy}
            title="Quick copy template"
            className="p-2 rounded-lg text-[#737373] hover:text-[#F5F5F5] hover:bg-[#191919] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-[#F5F5F5]" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCustomize(prompt);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#090909] text-xs font-medium transition-colors cursor-pointer"
          >
            <span>Open</span>
          </button>
        </div>
      </div>
    );
  }

  // Grid view (Minimal default state: title + category tag only; reveals description & actions on hover)
  return (
    <div
      onClick={handleCardClick}
      tabIndex={0}
      className="group relative flex min-h-[124px] flex-col justify-between rounded-xl border border-[#262626] bg-[#111111] p-4 transition-colors duration-200 hover:border-[#383838] hover:bg-[#191919] focus:border-[#404040] focus:bg-[#191919] cursor-pointer outline-none"
    >
      {/* Top Header: Category Tag & Favorite (Revealed on hover / active) */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={cn(
              'px-2.5 py-0.5 text-xs font-medium rounded border shrink-0',
              categoryStyle.bg,
              categoryStyle.text,
              categoryStyle.border
            )}
          >
            {prompt.category}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(prompt.id);
            }}
            title={prompt.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={cn(
              'p-1 rounded transition-opacity duration-200 cursor-pointer',
              prompt.isFavorite
                ? 'opacity-100 text-[#F5F5F5]'
                : 'opacity-0 group-hover:opacity-100 group-focus:opacity-100 text-[#737373] hover:text-[#F5F5F5]'
            )}
          >
            <Star className={cn('w-4 h-4', prompt.isFavorite && 'fill-[#F5F5F5]')} />
          </button>
        </div>

        {/* Prompt Title */}
        <h3 className="text-base font-medium text-[#F5F5F5] line-clamp-2">
          {prompt.title}
        </h3>

        {/* Description revealed on hover / focus */}
        <div className="max-h-0 sm:opacity-0 group-hover:max-h-24 group-hover:opacity-100 group-focus:max-h-24 group-focus:opacity-100 transition-all duration-200 overflow-hidden">
          {prompt.description && (
            <p className="text-xs text-[#A1A1AA] mt-2.5 line-clamp-2 leading-relaxed">
              {prompt.description}
            </p>
          )}
        </div>
      </div>

      {/* Actions footer (revealed smoothly on hover / focus) */}
      <div className="pt-3 mt-3 border-t border-[#262626] flex items-center justify-between gap-2 max-h-0 opacity-0 group-hover:max-h-16 group-hover:opacity-100 group-focus:max-h-16 group-focus:opacity-100 sm:max-h-0 sm:opacity-0 sm:group-hover:max-h-16 sm:group-hover:opacity-100 transition-all duration-200 overflow-hidden">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleQuickCopy}
            title="Quick copy template"
            className="p-1.5 rounded text-[#737373] hover:text-[#F5F5F5] hover:bg-[#262626] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#F5F5F5]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 text-[#737373] hover:text-[#F5F5F5] hover:bg-[#262626] rounded transition-colors cursor-pointer"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                />
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 bottom-full mb-1 w-36 bg-[#141414] border border-[#262626] rounded-lg shadow-2xl py-1 z-40 animate-in fade-in zoom-in-95 duration-100"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(prompt);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#262626] text-left transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#737373]" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDuplicate(prompt.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#262626] text-left transition-colors"
                  >
                    <CopyPlus className="w-3.5 h-3.5 text-[#737373]" />
                    <span>Duplicate</span>
                  </button>
                  <div className="my-1 border-t border-[#262626]" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDeleteRequest(prompt);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#262626] text-left transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#737373]" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCustomize(prompt);
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#090909] text-xs font-medium transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>Open</span>
        </button>
      </div>
    </div>
  );
};
