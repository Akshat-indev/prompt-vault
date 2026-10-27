import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { LibraryHeader } from './features/library/LibraryHeader';
import { PromptList } from './features/library/PromptList';
import { PromptEditorModal } from './features/editor/PromptEditorModal';
import { PromptBuilderModal } from './features/builder/PromptBuilderModal';
import { NewPromptModal } from './features/creation/NewPromptModal';
import { DeleteConfirmModal } from './components/common/DeleteConfirmModal';
import { ToastContainer, type ToastMessage } from './components/common/Toast';
import { usePrompts } from './hooks/usePrompts';
import type { CreatePromptInput } from './types/prompt';

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
    // Modals & Active
    isEditorOpen,
    editingPrompt,
    openEditModal,
    closeEditorModal,
    promptToDelete,
    setPromptToDelete,
    activePromptForBuilder,
    setActivePromptForBuilder,
    // Operations
    handleCreatePrompt,
    handleUpdatePrompt,
    handleDeletePrompt,
    handleDuplicatePrompt,
    handleToggleFavorite,
    handleResetToSeeds,
    // Backend
    backendStatus,
    isSyncing,
    syncWithBackend,
  } = usePrompts();

  // Layout states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // New Prompt (AI-only) Modal state
  const [isNewPromptModalOpen, setIsNewPromptModalOpen] = useState<boolean>(false);

  // Toast notifications
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
    setToasts((prev) => prev.filter((t) => t.id !== id));
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

  // Determine current page title
  const pageTitle = filters.onlyFavorites
    ? 'Favorites'
    : filters.category === 'All'
    ? 'All Prompts'
    : filters.category;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090909] text-[#F5F5F5] antialiased selection:bg-[#262626] selection:text-[#F5F5F5]">
      {/* Left Sidebar */}
      <Sidebar
        currentCategory={filters.category}
        onlyFavorites={filters.onlyFavorites}
        categoryCounts={categoriesWithCounts}
        favoritesCount={favoritesCount}
        onSelectCategory={setCategoryFilter}
        onSelectFavorites={setOnlyFavoritesFilter}
        onOpenCreate={() => setIsNewPromptModalOpen(true)}
        onOpenAiAnalyze={() => setIsNewPromptModalOpen(true)}
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

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-4">
          {/* Header Controls (Search, Filters, Sort, View Toggle) */}
          <LibraryHeader
            title={pageTitle}
            count={filteredPrompts.length}
            searchQuery={filters.searchQuery}
            onSearchChange={setSearchQuery}
            onlyFavorites={filters.onlyFavorites}
            onToggleFavorites={setOnlyFavoritesFilter}
            sortBy={filters.sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedTag={filters.selectedTag}
            onClearTag={() => setSelectedTag(undefined)}
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          />

          {/* Prompt Cards Grid / List */}
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
            onResetToSeeds={() => {
              handleResetToSeeds();
              notify('Restored example developer prompts', 'info');
            }}
          />
        </div>
      </main>

      {/* Edit Existing Prompt Modal */}
      <PromptEditorModal
        isOpen={isEditorOpen && !!editingPrompt}
        editingPrompt={editingPrompt}
        onClose={closeEditorModal}
        onSave={handleUpdateExistingPrompt}
      />

      {/* AI-Powered New Prompt Creation Flow */}
      <NewPromptModal
        isOpen={isNewPromptModalOpen}
        onClose={() => setIsNewPromptModalOpen(false)}
        onSave={handleSaveFromNewPrompt}
        onNotify={notify}
      />

      {/* Dedicated Prompt Builder Modal */}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        prompt={promptToDelete}
        isOpen={!!promptToDelete}
        onClose={() => setPromptToDelete(null)}
        onConfirm={handleDeleteConfirmed}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
