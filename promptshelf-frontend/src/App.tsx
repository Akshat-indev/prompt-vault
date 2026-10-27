import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import {
  ArrowRight,
  ArrowUpDown,
  LayoutGrid,
  List,
  Menu,
  Search,
  Star,
  Tag,
  X,
} from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { PromptList } from './features/library/PromptList';
import { PromptEditorModal } from './features/editor/PromptEditorModal';
import { PromptBuilderModal } from './features/builder/PromptBuilderModal';
import { NewPromptModal } from './features/creation/NewPromptModal';
import { DeleteConfirmModal } from './components/common/DeleteConfirmModal';
import { ToastContainer, type ToastMessage } from './components/common/Toast';
import { usePrompts } from './hooks/usePrompts';
import type { CreatePromptInput } from './types/prompt';
import { cn } from './utils/cn';

export function App() {
  const {
    prompts,
    filteredPrompts,
    isLoading,
    filters,
    categoriesWithCounts,
    favoritesCount,
    setCategoryFilter,
    setOnlyFavoritesFilter,
    setSearchQuery,
    setSortBy,
    setSelectedTag,
    resetAllFilters,
    isEditorOpen,
    editingPrompt,
    openEditModal,
    closeEditorModal,
    promptToDelete,
    setPromptToDelete,
    activePromptForBuilder,
    setActivePromptForBuilder,
    handleCreatePrompt,
    handleUpdatePrompt,
    handleDeletePrompt,
    handleDuplicatePrompt,
    handleToggleFavorite,
    handleResetToSeeds,
    backendStatus,
    isSyncing,
    syncWithBackend,
  } = usePrompts();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isNewPromptModalOpen, setIsNewPromptModalOpen] = useState<boolean>(false);
  const [composerPrompt, setComposerPrompt] = useState<string>('');
  const [analysisRequest, setAnalysisRequest] = useState<{ id: number; prompt: string }>();
  const analysisRequestId = useRef(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = (
    message: string,
    type: 'success' | 'info' | 'error' = 'info',
    description?: string
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, description }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleAnalyzeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const prompt = composerPrompt.trim();
    if (!prompt) return;

    analysisRequestId.current += 1;
    setAnalysisRequest({ id: analysisRequestId.current, prompt });
    setIsNewPromptModalOpen(true);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const handleDuplicate = (id: string) => {
    const duplicated = handleDuplicatePrompt(id);
    notify(`Duplicated as "${duplicated.title}"`, 'success');
  };

  const handleDeleteConfirmed = (id: string) => {
    handleDeletePrompt(id);
    notify('Prompt deleted successfully', 'info');
  };

  const handleSaveFromNewPrompt = async (data: CreatePromptInput) => {
    const { created, syncError } = await handleCreatePrompt(data);
    notify(`Created prompt "${created.title}" via AI Prompt Intelligence`, 'success');
    if (syncError) {
      notify('Prompt was saved locally, but could not be synced to the backend', 'error', syncError);
    }
  };

  const handleUpdateExistingPrompt = (data: CreatePromptInput) => {
    if (editingPrompt) {
      handleUpdatePrompt(editingPrompt.id, data);
      notify(`Updated "${data.title}"`, 'success');
    }
  };

  const handleSyncWithBackend = async () => {
    notify('Syncing with backend API...', 'info');
    const result = await syncWithBackend();
    if (result.success) {
      notify('Backend synchronization complete', 'success');
    } else {
      notify('Failed to sync with backend', 'error', result.error);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090909] text-[#F5F5F5] antialiased selection:bg-[#262626] selection:text-[#F5F5F5]">
      <Sidebar
        currentCategory={filters.category}
        onlyFavorites={filters.onlyFavorites}
        categoryCounts={categoriesWithCounts}
        favoritesCount={favoritesCount}
        onSelectCategory={setCategoryFilter}
        onSelectFavorites={setOnlyFavoritesFilter}
        onOpenCreate={() => {
          setAnalysisRequest(undefined);
          setIsNewPromptModalOpen(true);
        }}
        onResetToSeeds={() => {
          handleResetToSeeds();
          notify('Restored example developer prompts', 'info');
        }}
        backendStatus={backendStatus}
        isSyncing={isSyncing}
        onSyncBackend={handleSyncWithBackend}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <main className="flex-1 h-full min-w-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-7 lg:px-10">
          <div className="flex h-14 items-center md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open navigation"
              className="rounded-lg border border-[#262626] bg-[#111111] p-2 text-[#A1A1AA] transition-colors hover:text-[#F5F5F5]"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>

          <section className="flex min-h-[min(68vh,720px)] flex-col items-center justify-center py-14 text-center sm:py-20">
            <div className="w-full max-w-[760px]">
              <h1 className="text-3xl font-medium tracking-tight text-[#F5F5F5] sm:text-4xl">
                What are we building today?
              </h1>
              <p className="mt-3 text-sm text-[#A1A1AA] sm:text-base">
                Turn raw prompts into reusable, searchable templates.
              </p>

              <form
                onSubmit={handleAnalyzeSubmit}
                className="mt-9 rounded-2xl border border-[#333333] bg-[#111111] p-3 text-left transition-colors focus-within:border-[#525252] sm:mt-10 sm:p-4"
              >
                <textarea
                  rows={2}
                  value={composerPrompt}
                  onChange={(event) => {
                    setComposerPrompt(event.target.value);
                    event.target.style.height = 'auto';
                    event.target.style.height = `${event.target.scrollHeight}px`;
                  }}
                  onKeyDown={handleComposerKeyDown}
                  maxLength={10000}
                  placeholder="Paste your prompt here, or describe what you want it to do..."
                  aria-label="Prompt to analyze"
                  className="max-h-80 min-h-20 w-full resize-none overflow-y-auto bg-transparent px-2 py-2 text-sm leading-6 text-[#F5F5F5] placeholder:text-[#737373] focus:outline-none sm:px-3 sm:text-base"
                />
                <div className="flex items-center justify-between gap-3 px-1 pt-2">
                  <span className="text-xs text-[#737373]">
                    Shift + Enter for a new line
                  </span>
                  <button
                    type="submit"
                    disabled={!composerPrompt.trim()}
                    className="flex shrink-0 items-center gap-2 rounded-xl bg-[#F5F5F5] px-4 py-2.5 text-sm font-medium text-[#090909] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span>Analyze</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section aria-labelledby="library-title" className="border-t border-[#262626] pt-7 sm:pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <h2 id="library-title" className="text-lg font-medium tracking-tight">
                  Your Library
                </h2>
                <span className="rounded-md border border-[#262626] bg-[#111111] px-2 py-0.5 text-xs text-[#A1A1AA]">
                  {filteredPrompts.length}
                </span>
                {filters.onlyFavorites && (
                  <span className="flex items-center gap-1 text-xs text-[#A1A1AA]">
                    <Star className="h-3 w-3" />
                    Favorites
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#737373]" />
                  <input
                    type="search"
                    value={filters.searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search prompts"
                    aria-label="Search your library"
                    className="w-full rounded-lg border border-[#262626] bg-[#111111] py-2 pl-8 pr-8 text-xs text-[#F5F5F5] placeholder:text-[#737373] focus:border-[#404040] focus:outline-none"
                  />
                  {filters.searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#F5F5F5]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </label>

                <div className="flex items-center rounded-lg border border-[#262626] bg-[#111111] p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                    aria-pressed={viewMode === 'grid'}
                    className={cn(
                      'rounded-md p-1.5 transition-colors',
                      viewMode === 'grid' ? 'bg-[#262626] text-[#F5F5F5]' : 'text-[#737373] hover:text-[#F5F5F5]'
                    )}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                    aria-pressed={viewMode === 'list'}
                    className={cn(
                      'rounded-md p-1.5 transition-colors',
                      viewMode === 'list' ? 'bg-[#262626] text-[#F5F5F5]' : 'text-[#737373] hover:text-[#F5F5F5]'
                    )}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>

                <label className="relative flex items-center">
                  <ArrowUpDown className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[#737373]" />
                  <select
                    value={filters.sortBy}
                    onChange={(event) => setSortBy(event.target.value as typeof filters.sortBy)}
                    aria-label="Sort prompts"
                    className="appearance-none rounded-lg border border-[#262626] bg-[#111111] py-2 pl-8 pr-2 text-xs text-[#A1A1AA] focus:border-[#404040] focus:outline-none"
                  >
                    <option value="updatedAt_desc">Recently updated</option>
                    <option value="createdAt_desc">Newest first</option>
                    <option value="title_asc">Title (A to Z)</option>
                    <option value="title_desc">Title (Z to A)</option>
                  </select>
                </label>
              </div>
            </div>

            {filters.selectedTag && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedTag(undefined)}
                  className="flex items-center gap-1.5 rounded-md border border-[#262626] bg-[#111111] px-2.5 py-1 text-xs text-[#A1A1AA] hover:text-[#F5F5F5]"
                >
                  <Tag className="h-3 w-3" />
                  <span>#{filters.selectedTag}</span>
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <PromptList
              prompts={filteredPrompts}
              totalPromptsCount={prompts.length}
              isLoading={isLoading}
              viewMode={viewMode}
              onCustomize={(prompt) => setActivePromptForBuilder(prompt)}
              onEdit={openEditModal}
              onDuplicate={handleDuplicate}
              onDeleteRequest={(prompt) => setPromptToDelete(prompt)}
              onToggleFavorite={handleToggleFavorite}
              onTagClick={(tag) => setSelectedTag(tag)}
              onNotify={notify}
              onOpenCreate={() => setIsNewPromptModalOpen(true)}
              onResetFilters={resetAllFilters}
            />
          </section>
        </div>
      </main>

      <PromptEditorModal
        isOpen={isEditorOpen && !!editingPrompt}
        editingPrompt={editingPrompt}
        onClose={closeEditorModal}
        onSave={handleUpdateExistingPrompt}
      />

      <NewPromptModal
        isOpen={isNewPromptModalOpen}
        analysisRequest={analysisRequest}
        onClose={() => setIsNewPromptModalOpen(false)}
        onSave={handleSaveFromNewPrompt}
        onNotify={notify}
      />

      <PromptBuilderModal
        prompt={activePromptForBuilder}
        isOpen={!!activePromptForBuilder}
        onClose={() => setActivePromptForBuilder(null)}
        onEdit={(prompt) => {
          setActivePromptForBuilder(null);
          openEditModal(prompt);
        }}
        onDuplicate={handleDuplicate}
        onDeleteRequest={(prompt) => {
          setActivePromptForBuilder(null);
          setPromptToDelete(prompt);
        }}
        onToggleFavorite={handleToggleFavorite}
        onNotify={notify}
      />

      <DeleteConfirmModal
        prompt={promptToDelete}
        isOpen={!!promptToDelete}
        onClose={() => setPromptToDelete(null)}
        onConfirm={handleDeleteConfirmed}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
