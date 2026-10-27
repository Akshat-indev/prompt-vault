import { Router } from 'express';
import {
  getAllPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
  toggleFavorite,
  resetPrompts,
  analyzePrompt,
  getAiStatus,
} from '../controllers/promptController';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middleware/validate';
import {
  createPromptSchema,
  updatePromptSchema,
  promptIdParamSchema,
  promptQuerySchema,
  toggleFavoriteSchema,
  analyzePromptInputSchema,
} from '../schemas/promptSchema';

const router = Router();

router.get('/', validateQuery(promptQuerySchema), getAllPrompts);
router.post('/', validateBody(createPromptSchema), createPrompt);
router.post('/reset', resetPrompts);
router.get('/ai-status', getAiStatus);
router.post('/analyze', validateBody(analyzePromptInputSchema), analyzePrompt);

router.get('/:id', validateParams(promptIdParamSchema), getPromptById);
router.put(
  '/:id',
  validateParams(promptIdParamSchema),
  validateBody(updatePromptSchema),
  updatePrompt
);
router.delete('/:id', validateParams(promptIdParamSchema), deletePrompt);
router.patch(
  '/:id/favorite',
  validateParams(promptIdParamSchema),
  validateBody(toggleFavoriteSchema),
  toggleFavorite
);

export default router;
