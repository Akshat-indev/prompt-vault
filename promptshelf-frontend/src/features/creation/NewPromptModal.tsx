import { useState, type FC } from 'react';
import {
  X,
  Sparkles,
  AlertCircle,
  Tag as TagIcon,
  Copy,
  Braces,
  Save,
  Loader2,
  Check,
  ArrowLeft,
  FileText,
  RotateCcw,
} from 'lucide-react';
import type { AiAnalyzeResult, CreatePromptInput } from '../../types/prompt';
import { api } from '../../lib/api';
import { copyToClipboard } from '../../utils/clipboard';
import { detectVariables } from '../../utils/template';
import { cn } from '../../utils/cn';

interface NewPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreatePromptInput) => void;
  onNotify?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const CATEGORIES = [
  'Coding',
  'Debugging',
  'Writing',
  'Research',
  'Productivity',
  'Other',
];

const CATEGORY_STYLES: Record<string, string> = {
  Coding: 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40',
  Debugging: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
  Writing: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
  Research: 'bg-purple-950/40 text-purple-300 border-purple-800/40',
  Productivity: 'bg-blue-950/40 text-blue-300 border-blue-800/40',
  Other: 'bg-[#1c1c1c] text-[#A1A1AA] border-[#262626]',
};

export const NewPromptModal: FC<NewPromptModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onNotify,
}) => {
  // Wizard state: 'input' | 'loading' | 'review'
  const [step, setStep] = useState<'input' | 'loading' | 'review'>('input');

  // Input step state
  const [rawPrompt, setRawPrompt] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Review step state (editable fields populated by AI)
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Coding');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [originalPrompt, setOriginalPrompt] = useState<string>('');
  const [generalizedPrompt, setGeneralizedPrompt] = useState<string>('');
  const [variables, setVariables] = useState<AiAnalyzeResult['variables']>([]);

  // UI tabs in review screen: 'template' | 'original' | 'variables'
  const [reviewTab, setReviewTab] = useState<'template' | 'original' | 'variables'>('template');
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleResetAndClose = () => {
    setStep('input');
    setRawPrompt('');
    setErrorMessage(null);
    setTitle('');
    setDescription('');
    setTags([]);
    setOriginalPrompt('');
    setGeneralizedPrompt('');
    setVariables([]);
    onClose();
  };

  const handleAnalyzeAndGeneralize = async () => {
    const trimmed = rawPrompt.trim();
    if (!trimmed || trimmed.length < 5) {
      setErrorMessage('Please enter at least 5 characters of prompt text to analyze.');
      return;
    }
    if (trimmed.length > 10000) {
      setErrorMessage('Prompt text cannot exceed 10,000 characters.');
      return;
    }

    setStep('loading');
    setErrorMessage(null);

    try {
      const result: AiAnalyzeResult = await api.analyzePrompt(trimmed);

      // Populate review state with AI result
      setTitle(result.title || 'Reusable Prompt');
      setDescription(result.description || '');
      setCategory(result.category || 'Coding');
      setTags(
        Array.from(
          new Set(result.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))
        )
      );
      setOriginalPrompt(result.original_prompt || trimmed);
      setGeneralizedPrompt(result.generalized_prompt || trimmed);
      setVariables(result.variables || []);

      setStep('review');
      setReviewTab('template');
      onNotify?.('Prompt analyzed and generalized successfully', 'success');
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      const msg = err instanceof Error ? err.message : 'Failed to analyze prompt with AI.';
      setErrorMessage(msg);
      setStep('input');
      onNotify?.(msg, 'error');
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleCopyTemplate = async () => {
    const success = await copyToClipboard(generalizedPrompt);
    if (success) {
      setCopiedTemplate(true);
      onNotify?.('Template copied to clipboard', 'success');
      setTimeout(() => setCopiedTemplate(false), 2000);
    }
  };

  const handleSaveToPromptShelf = () => {
    if (!title.trim()) {
      onNotify?.('Title is required', 'error');
      return;
    }
    if (title.trim().length > 200) {
      onNotify?.('Title cannot exceed 200 characters', 'error');
      return;
    }
    if (description.trim().length > 500) {
      onNotify?.('Description cannot exceed 500 characters', 'error');
      return;
    }
    if (!category.trim() || category.trim().length > 50) {
      onNotify?.('Category must be between 1 and 50 characters', 'error');
      return;
    }
    if (!generalizedPrompt.trim()) {
      onNotify?.('Prompt template cannot be empty', 'error');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      tags,
      content: generalizedPrompt.trim(),
      original_prompt: originalPrompt.trim(),
      isFavorite: false,
    });

    handleResetAndClose();
  };

  const handleLoadSample = () => {
    setRawPrompt(
      `Can you review this Python function calculate_moving_average(values, window_size=5) for edge cases like empty lists or division by zero, and suggest how to optimize it using NumPy?`
    );
    setErrorMessage(null);
  };

  // Live variable detection for the review template textarea
  const detectedTemplateVars = detectVariables(generalizedPrompt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className={cn(
          'w-full bg-[#0D0D0D] border border-[#262626] rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto transition-all duration-200',
          step === 'review' ? 'max-w-5xl max-h-[92vh]' : 'max-w-2xl max-h-[90vh]'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-prompt-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#111111]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#171717] border border-[#262626] text-[#F5F5F5]">
              <Sparkles className="w-4 h-4 text-[#F5F5F5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="new-prompt-title" className="text-base font-medium text-[#F5F5F5]">
                  {step === 'review' ? 'Review & Customize Prompt' : 'New Prompt'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono text-[#737373] bg-[#171717] border border-[#262626] rounded">
                  {step === 'review' ? 'Step 2: Review' : 'Step 1: Input'}
                </span>
              </div>
              <p className="text-xs text-[#737373]">
                {step === 'review'
                  ? 'Inspect, refine, and save the AI-generated template to PromptShelf.'
                  : 'Paste any existing prompt to automatically generalize and structure it.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="text-[#737373] hover:text-[#F5F5F5] p-1.5 rounded-lg hover:bg-[#171717] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
          {/* STEP 1: SINGLE INPUT INTERFACE */}
          {step === 'input' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                  Prompt Text <span className="text-[#737373]">*</span>
                </label>
                {!rawPrompt && (
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="text-xs text-[#A1A1AA] hover:text-[#F5F5F5] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Insert sample prompt</span>
                  </button>
                )}
              </div>

              <div className="relative">
                <textarea
                  rows={10}
                  maxLength={10000}
                  value={rawPrompt}
                  onChange={(e) => {
                    setRawPrompt(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Paste your prompt here..."
                  className="w-full px-4 py-3 bg-[#111111] text-[#F5F5F5] text-sm font-mono rounded-xl border border-[#262626] focus:outline-hidden focus:border-[#404040] transition-colors resize-y leading-relaxed"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#737373] font-mono">
                <span>{rawPrompt.length} characters</span>
                <span>AI will categorize, tag, and detect variables</span>
              </div>

              {/* Error State Banner */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-[#171717] border border-[#262626] text-xs text-[#A1A1AA] flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-[#737373] shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p className="font-medium text-[#F5F5F5]">{errorMessage}</p>
                    {(errorMessage.includes('GEMINI_API_KEY') ||
                      errorMessage.includes('OPENAI_API_KEY') ||
                      errorMessage.includes('AI Provider is not configured')) && (
                      <div className="p-3 bg-[#111111] rounded-lg border border-[#262626] font-mono text-[11px] text-[#A1A1AA] space-y-1">
                        <p className="text-[#737373]"># To configure AI Prompt Intelligence:</p>
                        <p>1. Open <code className="text-[#F5F5F5]">promptshelf-backend/.env</code></p>
                        <p>
                          2. Set <code className="text-[#F5F5F5]">GEMINI_API_KEY=your_key_here</code>
                        </p>
                        <p className="text-[#737373]">
                          Get a free API key at: https://aistudio.google.com/
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: LOADING STATE */}
          {step === 'loading' && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-[#F5F5F5]" />
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-[#F5F5F5]">
                  Analyzing & Generalizing Prompt...
                </h3>
                <p className="text-xs text-[#737373] max-w-sm">
                  Calling configured AI Provider to classify category, extract variables, and generate a reusable template.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: EDITABLE REVIEW SCREEN */}
          {step === 'review' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Generated Metadata Card */}
              <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Title */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                    Title <span className="text-neutral-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Concise, descriptive title..."
                    className="w-full px-3 py-2 bg-[#171717] text-sm text-[#F5F5F5] rounded-lg border border-[#262626] focus:outline-hidden focus:border-[#404040]"
                  />
                </div>

                {/* Category with color indicator */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                      Category <span className="text-neutral-400">*</span>
                    </label>
                    <span
                      className={cn(
                        'px-2 py-0.5 text-[11px] rounded border font-medium',
                        CATEGORY_STYLES[category] || CATEGORY_STYLES.Other
                      )}
                    >
                      {category}
                    </span>
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#171717] text-xs text-[#F5F5F5] rounded-lg border border-[#262626] focus:outline-hidden focus:border-[#404040] cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                    Description / Purpose
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description of what this prompt accomplishes..."
                    className="w-full px-3 py-2 bg-[#171717] text-xs text-[#F5F5F5] rounded-lg border border-[#262626] focus:outline-hidden focus:border-[#404040]"
                  />
                </div>

                {/* Tags */}
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                    Tags <span className="text-[#737373] font-normal lowercase">(press Enter to add)</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#171717] rounded-lg border border-[#262626]">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-[#141414] text-[#A1A1AA] border border-[#262626] rounded"
                      >
                        <TagIcon className="w-3 h-3 text-[#737373]" />
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-[#737373] hover:text-[#F5F5F5] ml-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Add tag and hit Enter..."
                      className="px-2 py-0.5 text-xs bg-transparent text-[#F5F5F5] placeholder:text-[#737373] focus:outline-hidden min-w-[140px]"
                    />
                  </div>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center justify-between border-b border-[#262626] pb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewTab('template')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer',
                      reviewTab === 'template'
                        ? 'bg-[#191919] text-[#F5F5F5] border border-[#262626]'
                        : 'text-[#737373] hover:text-[#A1A1AA]'
                    )}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generalized Template (Editable)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewTab('original')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer',
                      reviewTab === 'original'
                        ? 'bg-[#191919] text-[#F5F5F5] border border-[#262626]'
                        : 'text-[#737373] hover:text-[#A1A1AA]'
                    )}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Original Prompt (Preserved)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewTab('variables')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer',
                      reviewTab === 'variables'
                        ? 'bg-[#191919] text-[#F5F5F5] border border-[#262626]'
                        : 'text-[#737373] hover:text-[#A1A1AA]'
                    )}
                  >
                    <Braces className="w-3.5 h-3.5" />
                    <span>Variables ({variables.length})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyTemplate}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-[#A1A1AA] hover:text-[#F5F5F5] bg-[#171717] hover:bg-[#262626] border border-[#262626] rounded-lg transition-colors cursor-pointer"
                >
                  {copiedTemplate ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#F5F5F5]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Template</span>
                    </>
                  )}
                </button>
              </div>

              {/* TAB 1: GENERALIZED TEMPLATE (EDITABLE) */}
              {reviewTab === 'template' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                      Prompt Template Content <span className="text-neutral-400">*</span>
                    </span>
                    <span className="text-[11px] font-mono text-[#737373]">
                      Detected {detectedTemplateVars.length} variable(s)
                    </span>
                  </div>

                  <textarea
                    rows={9}
                    value={generalizedPrompt}
                    onChange={(e) => setGeneralizedPrompt(e.target.value)}
                    className="w-full p-4 bg-[#111111] text-[#F5F5F5] text-xs font-mono rounded-xl border border-[#262626] focus:outline-hidden focus:border-[#404040] leading-relaxed resize-y"
                  />

                  {/* Detected variables chips */}
                  <div className="p-3 bg-[#111111] rounded-lg border border-[#262626] space-y-1.5">
                    <span className="text-[11px] text-[#737373] uppercase tracking-wider font-semibold">
                      Variables in template:
                    </span>
                    {detectedTemplateVars.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {detectedTemplateVars.map((v) => (
                          <span
                            key={v.name}
                            className="px-2 py-0.5 text-xs font-mono bg-[#171717] text-[#F5F5F5] border border-[#262626] rounded"
                          >
                            {`{{${v.name}}}`}
                            {v.occurrences > 1 && (
                              <span className="ml-1 text-[10px] text-[#737373]">
                                x{v.occurrences}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#737373] italic">
                        No variable placeholders detected. Add variables with{' '}
                        <code className="text-[#A1A1AA]">{'{{variable_name}}'}</code>.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: ORIGINAL PROMPT (PRESERVED) */}
              {reviewTab === 'original' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                      Original Prompt
                    </span>
                    <span className="text-[11px] font-mono text-[#737373]">
                      Preserved verbatim in persistent storage
                    </span>
                  </div>
                  <div className="p-4 bg-[#111111] rounded-xl border border-[#262626] text-xs font-mono text-[#A1A1AA] whitespace-pre-wrap leading-relaxed min-h-[200px] max-h-[360px] overflow-y-auto">
                    {originalPrompt}
                  </div>
                </div>
              )}

              {/* TAB 3: DETECTED VARIABLES DEFINITIONS */}
              {reviewTab === 'variables' && (
                <div className="space-y-3">
                  {variables.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {variables.map((variable) => (
                        <div
                          key={variable.name}
                          className="p-3.5 rounded-xl bg-[#111111] border border-[#262626] space-y-1.5"
                        >
                          <span className="px-2 py-0.5 text-xs font-mono bg-[#171717] text-[#F5F5F5] border border-[#262626] rounded inline-block">
                            {`{{${variable.name}}}`}
                          </span>
                          <p className="text-xs text-[#A1A1AA]">
                            {variable.description || 'Dynamic placeholder.'}
                          </p>
                          {variable.example && (
                            <p className="text-[11px] font-mono text-[#737373] bg-[#141414] px-2 py-1 rounded border border-[#262626]">
                              <span className="text-[#A1A1AA]">Example:</span> {variable.example}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#737373] italic text-center py-8">
                      No variable definitions were identified.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#262626] bg-[#111111]">
          {step === 'input' && (
            <>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-medium text-[#737373] hover:text-[#F5F5F5] bg-[#171717] hover:bg-[#262626] border border-[#262626] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAnalyzeAndGeneralize}
                disabled={!rawPrompt.trim() || rawPrompt.trim().length < 5}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#090909] text-xs font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze & Generalize</span>
              </button>
            </>
          )}

          {step === 'loading' && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="px-4 py-2 text-xs font-medium text-[#737373] hover:text-[#F5F5F5] bg-[#171717] hover:bg-[#262626] border border-[#262626] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {step === 'review' && (
            <>
              <button
                type="button"
                onClick={() => setStep('input')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#737373] hover:text-[#F5F5F5] bg-[#171717] hover:bg-[#262626] border border-[#262626] rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit Raw Prompt</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToPromptShelf}
                className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-[#090909] bg-[#F5F5F5] hover:bg-[#E5E5E5] rounded-lg transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save to PromptShelf</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
