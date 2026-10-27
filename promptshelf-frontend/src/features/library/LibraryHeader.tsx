import { useRef, useEffect, useState, type FC, type FormEvent } from 'react';
import {
  Search,
  X,
  LayoutGrid,
  List,
  Star,
  Tag,
  ArrowUpDown,
  Menu,
} from 'lucide-react';
import type { SortOption } from '../../types/prompt';
import { cn } from '../../utils/cn';

interface LibraryHeaderProps {
  title: string;
  count: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onlyFavorites: boolean;
  onToggleFavorites: (onlyFavorites: boolean) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  selectedTag?: string;
  onClearTag?: () => void;
  onOpenMobileMenu: () => void;
}

export const LibraryHeader: FC<LibraryHeaderProps> = ({
  title,
  count,
  searchQuery,
  onSearchChange,
  onlyFavorites,
  onToggleFavorites,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  selectedTag,
  onClearTag,
  onOpenMobileMenu,
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Global keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearchChange(localQuery.trim());
  };

  const handleClear = () => {
    setLocalQuery('');
    onSearchChange('');
    searchInputRef.current?.focus();
  };

  return (
    <div className="space-y-6 pb-6 border-b border-[#262626]">
      {/* Top Title Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-[#737373] hover:text-[#F5F5F5] bg-[#111111] rounded-lg border border-[#262626]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-[#F5F5F5]">
                {title}
              </h1>
              <span className="px-2 py-0.5 text-xs text-[#737373] bg-[#141414] border border-[#262626] rounded">
                {count}
              </span>
            </div>
            <p className="text-xs text-[#737373] mt-0.5 hidden sm:block">
              {onlyFavorites
                ? 'Your starred prompt templates.'
                : 'Browse, customize, and run deterministic prompt templates.'}
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 bg-[#111111] border border-[#262626] rounded-lg">
          <button
            onClick={() => onViewModeChange('grid')}
            title="Grid view"
            className={cn(
              'p-1.5 rounded transition-colors cursor-pointer',
              viewMode === 'grid'
                ? 'bg-[#262626] text-[#F5F5F5]'
                : 'text-[#737373] hover:text-[#F5F5F5]'
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            title="List view"
            className={cn(
              'p-1.5 rounded transition-colors cursor-pointer',
              viewMode === 'list'
                ? 'bg-[#262626] text-[#F5F5F5]'
                : 'text-[#737373] hover:text-[#F5F5F5]'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Quick Search Box (Prominent size, dark background, thin gray border, white submit button) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] block">
          Search your prompts
        </label>
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center bg-[#111111] border border-[#262626] focus-within:border-[#404040] rounded-xl p-1.5 transition-colors"
        >
          <Search className="w-4 h-4 text-[#737373] ml-3 mr-2 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={localQuery}
            onChange={(e) => {
              setLocalQuery(e.target.value);
              onSearchChange(e.target.value);
            }}
            placeholder="Describe what you need..."
            className="w-full bg-transparent px-2 py-2 text-sm text-[#F5F5F5] placeholder:text-[#737373] focus:outline-hidden"
          />

          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[#737373] hover:text-[#F5F5F5] p-1.5 mr-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#090909] text-xs font-medium transition-all shrink-0 cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter and Sort Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Favorites Filter */}
          <button
            onClick={() => onToggleFavorites(!onlyFavorites)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer',
              onlyFavorites
                ? 'bg-[#191919] text-[#F5F5F5] border-[#404040]'
                : 'bg-[#111111] text-[#A1A1AA] hover:text-[#F5F5F5] border-[#262626] hover:bg-[#191919]'
            )}
          >
            <Star className={cn('w-3.5 h-3.5', onlyFavorites ? 'text-[#F5F5F5] fill-[#F5F5F5]' : 'text-[#737373]')} />
            <span>Favorites</span>
          </button>

          {/* Active Tag Filter Pill */}
          {selectedTag && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-[#141414] text-[#A1A1AA] border border-[#262626] rounded-lg">
              <Tag className="w-3 h-3 text-[#737373]" />
              <span>#{selectedTag}</span>
              <button
                onClick={onClearTag}
                className="text-[#737373] hover:text-[#F5F5F5] ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {/* Sort selector */}
        <div className="relative flex items-center">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none pl-8 pr-7 py-1.5 bg-[#111111] text-xs font-medium text-[#A1A1AA] hover:text-[#F5F5F5] rounded-lg border border-[#262626] focus:outline-hidden focus:border-[#404040] cursor-pointer"
          >
            <option value="updatedAt_desc">Recently Updated</option>
            <option value="createdAt_desc">Newest First</option>
            <option value="title_asc">Title (A to Z)</option>
            <option value="title_desc">Title (Z to A)</option>
          </select>
          <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#737373] pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
