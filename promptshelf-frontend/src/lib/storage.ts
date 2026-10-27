import type { Prompt, CreatePromptInput, UpdatePromptInput } from '../types/prompt';
import { SEED_PROMPTS } from './seeds';

const STORAGE_KEY = 'promptshelf:v1';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class LocalStorageManager {
  private key: string;

  constructor(key: string = STORAGE_KEY) {
    this.key = key;
  }

  /**
   * Safely reads prompts from localStorage.
   * If empty or first time, initializes with seed prompts.
   * If data is corrupted, returns seeds safely without crashing.
   */
  public getPrompts(): Prompt[] {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) {
        // First launch: initialize with seeds
        this.savePrompts(SEED_PROMPTS);
        return SEED_PROMPTS;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Validate items loosely
        const valid = parsed.filter(
          (p) => p && typeof p.id === 'string' && typeof p.title === 'string'
        );
        if (valid.length > 0) {
          return valid;
        }
      }

      // If array is empty or corrupt, fallback to seeds
      this.savePrompts(SEED_PROMPTS);
      return SEED_PROMPTS;
    } catch (error) {
      console.warn('Error reading prompts from localStorage, restoring seeds:', error);
      try {
        this.savePrompts(SEED_PROMPTS);
      } catch {}
      return SEED_PROMPTS;
    }
  }

  /**
   * Saves prompt list to localStorage safely.
   */
  public savePrompts(prompts: Prompt[]): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(prompts));
    } catch (error) {
      console.error('Error saving prompts to localStorage:', error);
    }
  }

  public getPromptById(id: string): Prompt | null {
    const prompts = this.getPrompts();
    return prompts.find((p) => p.id === id) || null;
  }

  public createPrompt(input: CreatePromptInput): Prompt {
    const prompts = this.getPrompts();
    const now = new Date().toISOString();
    const newPrompt: Prompt = {
      id: generateId(),
      title: input.title.trim(),
      description: input.description?.trim() || '',
      content: input.content,
      original_prompt: input.original_prompt,
      category: input.category.trim(),
      tags: input.tags || [],
      isFavorite: input.isFavorite ?? false,
      createdAt: now,
      updatedAt: now,
    };

    const updatedList = [newPrompt, ...prompts];
    this.savePrompts(updatedList);
    return newPrompt;
  }

  public updatePrompt(id: string, input: UpdatePromptInput): Prompt {
    const prompts = this.getPrompts();
    const index = prompts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Prompt with ID '${id}' not found`);
    }

    const current = prompts[index];
    const updated: Prompt = {
      ...current,
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.description !== undefined && { description: input.description.trim() }),
      ...(input.content !== undefined && { content: input.content }),
      ...(input.original_prompt !== undefined && { original_prompt: input.original_prompt }),
      ...(input.category !== undefined && { category: input.category.trim() }),
      ...(input.tags !== undefined && { tags: input.tags }),
      ...(input.isFavorite !== undefined && { isFavorite: input.isFavorite }),
      updatedAt: new Date().toISOString(),
    };

    prompts[index] = updated;
    this.savePrompts(prompts);
    return updated;
  }

  public deletePrompt(id: string): void {
    const prompts = this.getPrompts();
    const filtered = prompts.filter((p) => p.id !== id);
    this.savePrompts(filtered);
  }

  public duplicatePrompt(id: string): Prompt {
    const prompts = this.getPrompts();
    const original = prompts.find((p) => p.id === id);
    if (!original) {
      throw new Error(`Prompt with ID '${id}' not found`);
    }

    const now = new Date().toISOString();
    const duplicated: Prompt = {
      ...original,
      id: generateId(),
      title: `${original.title} (Copy)`,
      original_prompt: original.original_prompt,
      createdAt: now,
      updatedAt: now,
    };

    const updatedList = [duplicated, ...prompts];
    this.savePrompts(updatedList);
    return duplicated;
  }

  public toggleFavorite(id: string): Prompt {
    const prompts = this.getPrompts();
    const index = prompts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Prompt with ID '${id}' not found`);
    }

    const current = prompts[index];
    const updated: Prompt = {
      ...current,
      isFavorite: !current.isFavorite,
      updatedAt: new Date().toISOString(),
    };

    prompts[index] = updated;
    this.savePrompts(prompts);
    return updated;
  }

  public resetToSeeds(): Prompt[] {
    this.savePrompts(SEED_PROMPTS);
    return SEED_PROMPTS;
  }
}

export const localStore = new LocalStorageManager();
