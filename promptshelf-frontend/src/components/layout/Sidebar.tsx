import type { FC } from 'react';
import {
  Bookmark,
  Star,
  Code2,
  Bug,
  PenTool,
  Compass,
  Zap,
  Folder,
  Plus,
  RefreshCw,
  Layers,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  currentCategory: string;
  onlyFavorites: boolean;
  categoryCounts: Record<string, number>;
  favoritesCount: number;
  onSelectCategory: (category: string) => void;
  onSelectFavorites: (onlyFavorites: boolean) => void;
  onOpenCreate: () => void;
  onResetToSeeds: () => void;
  backendStatus: 'checking' | 'connected' | 'disconnected';
  isSyncing: boolean;
  onSyncBackend: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const CATEGORIES = [
  { name: 'Coding', icon: Code2 },
  { name: 'Debugging', icon: Bug },
  { name: 'Writing', icon: PenTool },
  { name: 'Research', icon: Compass },
  { name: 'Productivity', icon: Zap },
  { name: 'Other', icon: Folder },
];

export const Sidebar: FC<SidebarProps> = ({
  currentCategory,
  onlyFavorites,
  categoryCounts,
  favoritesCount,
  onSelectCategory,
  onSelectFavorites,
  onOpenCreate,
  onResetToSeeds,
  backendStatus,
  isSyncing,
  onSyncBackend,
  isOpenMobile,
  onCloseMobile,
}) => {
  const isAllPromptsActive = !onlyFavorites && currentCategory === 'All';
  const isFavoritesActive = onlyFavorites;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-[#0D0D0D] border-r border-[#262626] transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:w-64 shrink-0',
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#171717] border border-[#262626] text-[#F5F5F5]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold tracking-tight text-[#F5F5F5] text-sm">
                  PromptShelf
                </span>
                <span className="px-1.5 py-0.2 text-[10px] font-mono text-[#737373] bg-[#171717] border border-[#262626] rounded">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-[#737373] leading-none mt-0.5">Workspace</p>
            </div>
          </div>

          {/* Close mobile button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden text-[#737373] hover:text-[#F5F5F5] p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="p-4 space-y-2">
          {/* New Prompt Button (White with black text) */}
          <button
            onClick={() => {
              onOpenCreate();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#090909] font-medium text-sm transition-all duration-150 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Prompt</span>
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-1 space-y-6 overflow-y-auto">
          {/* Main views */}
          <div className="space-y-1">
            <button
              onClick={() => {
                onSelectFavorites(false);
                onSelectCategory('All');
                onCloseMobile();
              }}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                isAllPromptsActive
                  ? 'bg-[#191919] text-[#F5F5F5] border border-[#262626]'
                  : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#141414] border border-transparent'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className={cn('w-4 h-4', isAllPromptsActive ? 'text-[#F5F5F5]' : 'text-[#737373]')} />
                <span>All Prompts</span>
              </div>
              <span
                className={cn(
                  'px-2 py-0.5 text-xs rounded border border-[#262626]',
                  isAllPromptsActive ? 'bg-[#262626] text-[#F5F5F5]' : 'bg-[#171717] text-[#737373]'
                )}
              >
                {categoryCounts['All'] || 0}
              </span>
            </button>

            <button
              onClick={() => {
                onSelectFavorites(true);
                onCloseMobile();
              }}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                isFavoritesActive
                  ? 'bg-[#191919] text-[#F5F5F5] border border-[#262626]'
                  : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#141414] border border-transparent'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Star className={cn('w-4 h-4', isFavoritesActive ? 'text-[#F5F5F5] fill-[#F5F5F5]' : 'text-[#737373]')} />
                <span>Favorites</span>
              </div>
              <span
                className={cn(
                  'px-2 py-0.5 text-xs rounded border border-[#262626]',
                  isFavoritesActive ? 'bg-[#262626] text-[#F5F5F5]' : 'bg-[#171717] text-[#737373]'
                )}
              >
                {favoritesCount}
              </span>
            </button>
          </div>

          {/* Categories section */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider text-[#737373] uppercase">
                Categories
              </span>
            </div>
            <div className="space-y-0.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isCatActive = !onlyFavorites && currentCategory.toLowerCase() === cat.name.toLowerCase();
                const count = categoryCounts[cat.name] || 0;

                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      onSelectFavorites(false);
                      onSelectCategory(cat.name);
                      onCloseMobile();
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer group',
                      isCatActive
                        ? 'bg-[#191919] text-[#F5F5F5] border border-[#262626]'
                        : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#141414] border border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn('w-4 h-4 transition-colors', isCatActive ? 'text-[#F5F5F5]' : 'text-[#737373] group-hover:text-[#A1A1AA]')} />
                      <span>{cat.name}</span>
                    </div>
                    {count > 0 && (
                      <span className="px-1.5 py-0.5 text-[11px] rounded bg-[#171717] text-[#737373] border border-[#262626]">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info & Backend status */}
        <div className="p-3 border-t border-[#262626] space-y-2 bg-[#0A0A0A]">
          {/* Backend Sync & Status */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#141414] border border-[#262626] text-xs text-[#A1A1AA]">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  backendStatus === 'connected' ? 'bg-[#F5F5F5]' : 'bg-[#737373]'
                )}
              />
              <span className="truncate">
                {backendStatus === 'connected' ? 'API Connected' : 'Local Storage'}
              </span>
            </div>

            {backendStatus === 'connected' && (
              <button
                onClick={onSyncBackend}
                disabled={isSyncing}
                title="Sync with Backend"
                className="text-[#737373] hover:text-[#F5F5F5] p-1 rounded transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', isSyncing && 'animate-spin text-[#F5F5F5]')} />
              </button>
            )}
          </div>

          {/* Reset button */}
          <button
            onClick={() => {
              if (window.confirm('Reset all prompts to the initial example templates? Any custom prompts will be replaced.')) {
                onResetToSeeds();
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#737373] hover:text-[#A1A1AA] hover:bg-[#141414] transition-colors cursor-pointer"
          >
            <span>Reset Demo Prompts</span>
          </button>
        </div>
      </aside>
    </>
  );
};
