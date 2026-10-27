import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Prompt, CreatePromptInput, UpdatePromptInput, PromptFilters, SortOption } from '../types/prompt';
import { localStore } from '../lib/storage';
import { api } from '../lib/api';

const DEFAULT_FILTERS: PromptFilters = {
  category: 'All',
  onlyFavorites: false,
  searchQuery: '',
  selectedTag: undefined,
  sortBy: 'updatedAt_desc',
};

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<PromptFilters>(DEFAULT_FILTERS);
  
  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);
  const [activePromptForBuilder, setActivePromptForBuilder] = useState<Prompt | null>(null);

  // Backend connection status
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Load initial prompts from localStorage
  const reloadFromStorage = useCallback(() => {
    const loaded = localStore.getPrompts();
    setPrompts(loaded);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reloadFromStorage();
  }, [reloadFromStorage]);

  // Check backend health in background
  useEffect(() => {
    let isMounted = true;
    api.checkHealth()
      .then(() => {
        if (isMounted) setBackendStatus('connected');
      })
      .catch(() => {
        if (isMounted) setBackendStatus('disconnected');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync with backend (push local prompts or sync)
  const syncWithBackend = useCallback(async () => {
    setIsSyncing(true);
    try {
      // First verify backend is responsive
      await api.checkHealth();
      setBackendStatus('connected');
      
      // Pull current backend prompts
      const backendPrompts = await api.getPrompts();
      if (backendPrompts.length > 0) {
        // Merge strategy: map by id, newer updatedAt wins
        const mergedMap = new Map<string, Prompt>();
        prompts.forEach((p) => mergedMap.set(p.id, p));
        backendPrompts.forEach((bp) => {
          const local = mergedMap.get(bp.id);
          if (!local || new Date(bp.updatedAt) > new Date(local.updatedAt)) {
            mergedMap.set(bp.id, bp);
          }
        });

        const mergedList = Array.from(mergedMap.values());
        localStore.savePrompts(mergedList);
        setPrompts(mergedList);
      }
      return { success: true };
    } catch (err) {
      console.warn('Backend sync failed:', err);
      setBackendStatus('disconnected');
      return { success: false, error: err instanceof Error ? err.message : 'Sync failed' };
    } finally {
      setIsSyncing(false);
    }
  }, [prompts]);

  // Filter & Search & Sort Logic
  const filteredPrompts = useMemo(() => {
    let result = [...prompts];

    // Search query: checks title, description, content, tags, category
    if (filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(q);
        const descMatch = p.description.toLowerCase().includes(q);
        const contentMatch = p.content.toLowerCase().includes(q);
        const categoryMatch = p.category.toLowerCase().includes(q);
        const tagMatch = p.tags.some((t) => t.toLowerCase().includes(q));
        return titleMatch || descMatch || contentMatch || categoryMatch || tagMatch;
      });
    }

    // Category filter
    if (filters.category && filters.category !== 'All') {
      result = result.filter(
        (p) => p.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Favorites filter
    if (filters.onlyFavorites) {
      result = result.filter((p) => p.isFavorite);
    }

    // Specific tag filter
    if (filters.selectedTag) {
      result = result.filter((p) =>
        p.tags.some((t) => t.toLowerCase() === filters.selectedTag?.toLowerCase())
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        case 'createdAt_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updatedAt_asc':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'updatedAt_desc':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return result;
  }, [prompts, filters]);

  // Unique categories calculation with counts
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: prompts.length,
      Coding: 0,
      Debugging: 0,
      Writing: 0,
      Research: 0,
      Productivity: 0,
      Other: 0,
    };

    prompts.forEach((p) => {
      const cat = p.category;
      if (counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts[cat] = 1;
      }
    });

    return counts;
  }, [prompts]);

  // Total favorites count
  const favoritesCount = useMemo(() => {
    return prompts.filter((p) => p.isFavorite).length;
  }, [prompts]);

  // CRUD actions
  const handleCreatePrompt = useCallback(async (input: CreatePromptInput) => {
    const created = localStore.createPrompt(input);
    setPrompts((prev) => [created, ...prev]);

    try {
      await api.createPrompt(input);
      return { created };
    } catch (error) {
      console.error('Backend prompt creation failed:', error);
      return {
        created,
        syncError: error instanceof Error ? error.message : 'Backend prompt creation failed',
      };
    }
  }, []);

  const handleUpdatePrompt = useCallback((id: string, input: UpdatePromptInput) => {
    const updated = localStore.updatePrompt(id, input);
    setPrompts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    
    // If updating currently active prompt in builder, update it too
    setActivePromptForBuilder((prev) => (prev?.id === id ? updated : prev));

    // Also fire-and-forget sync to backend if connected
    api.updatePrompt(id, input).catch(() => {});
    return updated;
  }, []);

  const handleDeletePrompt = useCallback((id: string) => {
    localStore.deletePrompt(id);
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    
    if (activePromptForBuilder?.id === id) {
      setActivePromptForBuilder(null);
    }

    // Also fire-and-forget sync to backend if connected
    api.deletePrompt(id).catch(() => {});
  }, [activePromptForBuilder]);

  const handleDuplicatePrompt = useCallback((id: string) => {
    const duplicated = localStore.duplicatePrompt(id);
    setPrompts((prev) => [duplicated, ...prev]);

    // Also fire-and-forget sync to backend
    api.createPrompt({
      title: duplicated.title,
      description: duplicated.description,
      content: duplicated.content,
      category: duplicated.category,
      tags: duplicated.tags,
      isFavorite: duplicated.isFavorite,
    }).catch(() => {});

    return duplicated;
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    const updated = localStore.toggleFavorite(id);
    setPrompts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    
    if (activePromptForBuilder?.id === id) {
      setActivePromptForBuilder(updated);
    }

    // Sync to backend
    api.toggleFavorite(id, updated.isFavorite).catch(() => {});
    return updated;
  }, [activePromptForBuilder]);

  const handleResetToSeeds = useCallback(() => {
    const seeds = localStore.resetToSeeds();
    setPrompts(seeds);
    setActivePromptForBuilder(null);
  }, []);

  const setCategoryFilter = useCallback((category: string) => {
    setFilters((prev) => ({
      ...prev,
      category,
      onlyFavorites: false, // Reset favorite toggle when selecting category
    }));
  }, []);

  const setOnlyFavoritesFilter = useCallback((onlyFavorites: boolean) => {
    setFilters((prev) => ({
      ...prev,
      onlyFavorites,
    }));
  }, []);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery,
    }));
  }, []);

  const setSortBy = useCallback((sortBy: SortOption) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
    }));
  }, []);

  const setSelectedTag = useCallback((selectedTag?: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedTag,
    }));
  }, []);

  const resetAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingPrompt(null);
    setIsEditorOpen(true);
  }, []);

  const openEditModal = useCallback((prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsEditorOpen(true);
  }, []);

  const closeEditorModal = useCallback(() => {
    setIsEditorOpen(false);
    setEditingPrompt(null);
  }, []);

  return {
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
    openCreateModal,
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
  };
}
