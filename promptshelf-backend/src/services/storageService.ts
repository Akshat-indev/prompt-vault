import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Prompt, CreatePromptDTO, UpdatePromptDTO, PromptQueryParams } from '../types';
import { SEED_PROMPTS } from './seedPrompts';

export class StorageService {
  private prompts: Map<string, Prompt> = new Map();
  private filePath: string;
  private isPersisted: boolean = false;

  constructor() {
    const dataDir = path.resolve(__dirname, '../../data');
    this.filePath = path.join(dataDir, 'prompts.json');
    this.init();
  }

  private init(): void {
    try {
      const dataDir = path.dirname(this.filePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const fileData = fs.readFileSync(this.filePath, 'utf-8');
        const parsed: Prompt[] = JSON.parse(fileData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((p) => this.prompts.set(p.id, p));
          this.isPersisted = true;
          return;
        }
      }

      // Seed with initial prompts if file doesn't exist or is empty
      SEED_PROMPTS.forEach((p) => this.prompts.set(p.id, p));
      this.saveToFile();
      this.isPersisted = true;
    } catch (error) {
      console.warn('File persistence initialization warning (falling back to in-memory):', error);
      // Fallback in-memory
      SEED_PROMPTS.forEach((p) => this.prompts.set(p.id, p));
    }
  }

  private saveToFile(): void {
    try {
      const dataDir = path.dirname(this.filePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const data = Array.from(this.prompts.values());
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
      this.isPersisted = true;
    } catch (error) {
      console.error('Failed to persist prompts to file:', error);
    }
  }

  public getAll(params: PromptQueryParams = {}): Prompt[] {
    let results = Array.from(this.prompts.values());

    // Search filter across title, description, tags, content
    if (params.search && params.search.trim() !== '') {
      const query = params.search.toLowerCase().trim();
      results = results.filter((p) => {
        const inTitle = p.title.toLowerCase().includes(query);
        const inDesc = p.description.toLowerCase().includes(query);
        const inContent = p.content.toLowerCase().includes(query);
        const inOriginal = p.original_prompt ? p.original_prompt.toLowerCase().includes(query) : false;
        const inTags = p.tags.some((t) => t.toLowerCase().includes(query));
        const inCategory = p.category.toLowerCase().includes(query);
        return inTitle || inDesc || inContent || inOriginal || inTags || inCategory;
      });
    }

    // Category filter
    if (params.category && params.category.trim() !== '' && params.category !== 'All') {
      const cat = params.category.toLowerCase().trim();
      results = results.filter((p) => p.category.toLowerCase() === cat);
    }

    // Favorite filter
    if (params.isFavorite !== undefined) {
      results = results.filter((p) => p.isFavorite === params.isFavorite);
    }

    // Sorting
    const sortBy = params.sortBy || 'updatedAt';
    const sortOrder = params.sortOrder || 'desc';

    results.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        // default: updatedAt
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return results;
  }

  public getById(id: string): Prompt | null {
    return this.prompts.get(id) || null;
  }

  public create(dto: CreatePromptDTO): Prompt {
    const now = new Date().toISOString();
    const prompt: Prompt = {
      id: uuidv4(),
      title: dto.title,
      description: dto.description || '',
      content: dto.content,
      original_prompt: dto.original_prompt,
      category: dto.category,
      tags: dto.tags || [],
      isFavorite: dto.isFavorite ?? false,
      createdAt: now,
      updatedAt: now,
    };

    this.prompts.set(prompt.id, prompt);
    this.saveToFile();
    return prompt;
  }

  public update(id: string, dto: UpdatePromptDTO): Prompt | null {
    const existing = this.prompts.get(id);
    if (!existing) return null;

    const updated: Prompt = {
      ...existing,
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.content !== undefined && { content: dto.content }),
      ...(dto.original_prompt !== undefined && { original_prompt: dto.original_prompt }),
      ...(dto.category !== undefined && { category: dto.category }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
      ...(dto.isFavorite !== undefined && { isFavorite: dto.isFavorite }),
      updatedAt: new Date().toISOString(),
    };

    this.prompts.set(id, updated);
    this.saveToFile();
    return updated;
  }

  public delete(id: string): boolean {
    if (!this.prompts.has(id)) return false;
    this.prompts.delete(id);
    this.saveToFile();
    return true;
  }

  public toggleFavorite(id: string, explicitValue?: boolean): Prompt | null {
    const existing = this.prompts.get(id);
    if (!existing) return null;

    const newFavoriteState = explicitValue !== undefined ? explicitValue : !existing.isFavorite;
    const updated: Prompt = {
      ...existing,
      isFavorite: newFavoriteState,
      updatedAt: new Date().toISOString(),
    };

    this.prompts.set(id, updated);
    this.saveToFile();
    return updated;
  }

  public resetToSeeds(): void {
    this.prompts.clear();
    SEED_PROMPTS.forEach((p) => this.prompts.set(p.id, p));
    this.saveToFile();
  }
}

export const storageService = new StorageService();
