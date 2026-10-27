import { Request, Response, NextFunction } from 'express';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { PromptQueryParams } from '../types';

export const getAllPrompts = (req: Request, res: Response) => {
  const queryParams: PromptQueryParams = {
    search: req.query.search as string | undefined,
    category: req.query.category as string | undefined,
    isFavorite:
      req.query.isFavorite === 'true'
        ? true
        : req.query.isFavorite === 'false'
        ? false
        : undefined,
    sortBy: req.query.sortBy as any,
    sortOrder: req.query.sortOrder as any,
  };

  const prompts = storageService.getAll(queryParams);
  res.status(200).json({
    success: true,
    count: prompts.length,
    data: prompts,
  });
};

export const getPromptById = (req: Request, res: Response) => {
  const { id } = req.params;
  const prompt = storageService.getById(id);

  if (!prompt) {
    res.status(404).json({
      success: false,
      error: `Prompt with ID '${id}' not found`,
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: prompt,
  });
};

export const createPrompt = (req: Request, res: Response) => {
  const created = storageService.create(req.body);
  res.status(201).json({
    success: true,
    message: 'Prompt created successfully',
    data: created,
  });
};

export const updatePrompt = (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = storageService.update(id, req.body);

  if (!updated) {
    res.status(404).json({
      success: false,
      error: `Prompt with ID '${id}' not found`,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Prompt updated successfully',
    data: updated,
  });
};

export const deletePrompt = (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = storageService.delete(id);

  if (!deleted) {
    res.status(404).json({
      success: false,
      error: `Prompt with ID '${id}' not found`,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Prompt deleted successfully',
    id,
  });
};

export const toggleFavorite = (req: Request, res: Response) => {
  const { id } = req.params;
  const explicit = req.body?.isFavorite;
  const updated = storageService.toggleFavorite(id, explicit);

  if (!updated) {
    res.status(404).json({
      success: false,
      error: `Prompt with ID '${id}' not found`,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: `Prompt ${updated.isFavorite ? 'marked as favorite' : 'removed from favorites'}`,
    data: updated,
  });
};

export const resetPrompts = (_req: Request, res: Response) => {
  storageService.resetToSeeds();
  const prompts = storageService.getAll();
  res.status(200).json({
    success: true,
    message: 'Reset prompts to initial seed templates',
    count: prompts.length,
    data: prompts,
  });
};

export const analyzePrompt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { prompt } = req.body;
    const result = await aiService.analyzePrompt(prompt);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAiStatus = (_req: Request, res: Response) => {
  const info = aiService.getProviderInfo();
  res.status(200).json({
    success: true,
    configured: info.configured,
    provider: info.provider,
    model: info.model,
  });
};
