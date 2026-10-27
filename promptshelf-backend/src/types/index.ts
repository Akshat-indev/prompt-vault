export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  original_prompt?: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export type CreatePromptDTO = Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePromptDTO = Partial<Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>>;

export interface PromptQueryParams {
  search?: string;
  category?: string;
  isFavorite?: boolean;
  sortBy?: 'updatedAt' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: unknown;
}
