export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  original_prompt?: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type CreatePromptInput = Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePromptInput = Partial<Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>>;

export type PromptCategory =
  | 'All'
  | 'Coding'
  | 'Debugging'
  | 'Writing'
  | 'Research'
  | 'Productivity'
  | 'Other';

export type SortOption =
  | 'updatedAt_desc'
  | 'updatedAt_asc'
  | 'createdAt_desc'
  | 'title_asc'
  | 'title_desc';

export interface PromptFilters {
  category: string;
  onlyFavorites: boolean;
  searchQuery: string;
  selectedTag?: string;
  sortBy: SortOption;
}

export interface DetectedVariable {
  name: string;
  label: string;
  occurrences: number;
}

export interface PromptVariableDefinition {
  name: string;
  description: string;
  example: string;
}

export interface AiAnalyzeResult {
  title: string;
  description: string;
  category: string;
  tags: string[];
  original_prompt: string;
  generalized_prompt: string;
  variables: PromptVariableDefinition[];
}
