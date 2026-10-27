import type {
  Prompt,
  CreatePromptInput,
  UpdatePromptInput,
  AiAnalyzeResult,
} from '../types/prompt';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  uptime: number;
}

export interface AiStatusResponse {
  success: boolean;
  configured: boolean;
  model: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  error?: string;
  details?: unknown;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const details = Array.isArray(data?.details)
        ? data.details
            .map((detail: { field?: unknown; param?: unknown; message?: unknown }) => {
              const field = detail.field ?? detail.param;
              return typeof detail.message === 'string'
                ? `${typeof field === 'string' && field ? `${field}: ` : ''}${detail.message}`
                : null;
            })
            .filter((detail: string | null): detail is string => detail !== null)
        : [];
      const errorMessage = details.length > 0
        ? `${data?.error || 'Request validation failed'} — ${details.join('; ')}`
        : data?.error || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data as T;
  }

  public async checkHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  public async getAiStatus(): Promise<AiStatusResponse> {
    return this.request<AiStatusResponse>('/prompts/ai-status');
  }

  public async analyzePrompt(promptText: string): Promise<AiAnalyzeResult> {
    const res = await this.request<ApiResponse<AiAnalyzeResult>>('/prompts/analyze', {
      method: 'POST',
      body: JSON.stringify({ prompt: promptText }),
    });
    if (!res.data) {
      throw new Error('No analysis data received from backend');
    }
    return res.data;
  }

  public async getPrompts(params?: {
    search?: string;
    category?: string;
    isFavorite?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Prompt[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category && params.category !== 'All') searchParams.append('category', params.category);
    if (params?.isFavorite !== undefined) searchParams.append('isFavorite', String(params.isFavorite));
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const queryStr = searchParams.toString();
    const endpoint = `/prompts${queryStr ? `?${queryStr}` : ''}`;
    const res = await this.request<ApiResponse<Prompt[]>>(endpoint);
    return res.data || [];
  }

  public async getPrompt(id: string): Promise<Prompt> {
    const res = await this.request<ApiResponse<Prompt>>(`/prompts/${id}`);
    if (!res.data) throw new Error('Prompt not found');
    return res.data;
  }

  public async createPrompt(input: CreatePromptInput): Promise<Prompt> {
    const res = await this.request<ApiResponse<Prompt>>('/prompts', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (!res.data) throw new Error('Failed to create prompt');
    return res.data;
  }

  public async updatePrompt(id: string, input: UpdatePromptInput): Promise<Prompt> {
    const res = await this.request<ApiResponse<Prompt>>(`/prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    if (!res.data) throw new Error('Failed to update prompt');
    return res.data;
  }

  public async deletePrompt(id: string): Promise<void> {
    await this.request<ApiResponse<void>>(`/prompts/${id}`, {
      method: 'DELETE',
    });
  }

  public async toggleFavorite(id: string, isFavorite?: boolean): Promise<Prompt> {
    const res = await this.request<ApiResponse<Prompt>>(`/prompts/${id}/favorite`, {
      method: 'PATCH',
      body: JSON.stringify(isFavorite !== undefined ? { isFavorite } : {}),
    });
    if (!res.data) throw new Error('Failed to toggle favorite');
    return res.data;
  }

  public async resetPrompts(): Promise<Prompt[]> {
    const res = await this.request<ApiResponse<Prompt[]>>('/prompts/reset', {
      method: 'POST',
    });
    return res.data || [];
  }
}

export const api = new ApiClient();
