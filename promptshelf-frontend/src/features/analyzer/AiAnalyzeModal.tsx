import { useState, type FC } from 'react';
import {
  X,
  Sparkles,
  Check,
  AlertCircle,
  Tag as TagIcon,
  Copy,
  Braces,
  Save,
  Loader2,
  Columns,
} from 'lucide-react';
import type { AiAnalyzeResult, CreatePromptInput } from '../../types/prompt';
import { api } from '../../lib/api';
import { copyToClipboard } from '../../utils/clipboard';
import { cn } from '../../utils/cn';

interface AiAnalyzeModalProps {
  isOpen: boolean;
  initialPromptText?: string;
  onClose: () => void;
  onSaveAsPrompt: (data: CreatePromptInput) => void;
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

export const AiAnalyzeModal: FC<AiAnalyzeModalProps> = ({
  isOpen,
  initialPromptText = '',
  onClose,
  onSaveAsPrompt,
  onNotify,
}) => {
  const [rawPrompt, setRawPrompt] = useState<string>(initialPromptText);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AiAnalyzeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Editable analysis fields
  const [editableGeneralizedPrompt, setEditableGeneralizedPrompt] = useState<string>('');
  const [editableCategory, setEditableCategory] = useState<string>('Coding');
  const [editableTags, setEditableTags] = useState<string[]>([]);
  const [editableTitle, setEditableTitle] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [copiedGeneralized, setCopiedGeneralized] = useState<boolean>(false);
  const [viewTab, setViewTab] = useState<'comparison' | 'variables'>('comparison');

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!rawPrompt.trim() || rawPrompt.trim().length < 5) {
      setErrorMessage('Please enter at least 5 characters of prompt text to analyze.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await api.analyzePrompt(rawPrompt.trim());
      setAnalysisResult(result);
      setEditableGeneralizedPrompt(result.generalized_prompt);
      setEditableCategory(result.category || 'Coding');
      setEditableTags([...result.tags]);
      
      // Populate title from AI result or description
      const autoTitle = result.title || (result.description
        ? result.description.replace(/\.$/, '').slice(0, 60)
        : 'Generalized AI Prompt');
      setEditableTitle(autoTitle);

      onNotify?.('Prompt analyzed and generalized successfully', 'success');
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      const msg = err instanceof Error ? err.message : 'Failed to analyze prompt with AI.';
      setErrorMessage(msg);
      onNotify?.(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (clean && !editableTags.includes(clean)) {
        setEditableTags([...editableTags, clean]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditableTags(editableTags.filter((t) => t !== tagToRemove));
  };

  const handleCopyGeneralized = async () => {
    const success = await copyToClipboard(editableGeneralizedPrompt);
    if (success) {
      setCopiedGeneralized(true);
      onNotify?.('Template copied to clipboard', 'success');
      setTimeout(() => setCopiedGeneralized(false), 2000);
    }
  };

  const handleSaveResult = () => {
    if (!editableGeneralizedPrompt.trim()) {
      setErrorMessage('Template content cannot be empty.');
      return;
    }

    onSaveAsPrompt({
      title: editableTitle.trim() || 'Generalized AI Prompt',
      description: analysisResult?.description || '',
      category: editableCategory,
      tags: editableTags,
      content: editableGeneralizedPrompt.trim(),
      original_prompt: analysisResult?.original_prompt || rawPrompt.trim(),
      isFavorite: false,
    });

    onNotify?.('Saved prompt template', 'success');
    onClose();
  };

  const handleLoadSample = () => {
    setRawPrompt(
      `Please review this Python function calculate_metrics(data, window_size=5) for any index errors or division by zero, and explain how to optimize the sliding window calculation using numpy.`
    );
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-6xl bg-[#0D0D0D] border border-[#262626] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-analyze-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#111111]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#171717] border border-[#262626] text-[#F5F5F5]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="ai-analyze-title" className="text-base font-medium text-[#F5F5F5]">
                  AI Prompt Intelligence
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono text-[#737373] bg-[#171717] border border-[#262626] rounded">
                  Analyzer
                </span>
              </div>
              <p className="text-xs text-[#737373]">
                Transform specific prompts into reusable, variable-powered templates.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#737373] hover:text-[#F5F5F5] p-1.5 rounded-lg hover:bg-[#171717] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {/* Top: Raw Prompt Input Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
                <span>Raw Prompt to Analyze</span>
                <span className="text-[#737373]">*</span>
              </label>
              {!rawPrompt && (
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs text-[#A1A1AA] hover:text-[#F5F5F5] flex items-center gap-1 cursor-pointer"
                >
                  <span>Insert sample</span>
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                rows={4}
                value={rawPrompt}
                onChange={(e) => {
                  setRawPrompt(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Paste any prompt here (e.g. 'Can you check this python function calculate_metrics for bugs and suggest how to optimize it?')..."
                className="w-full px-4 py-3 bg-[#111111] text-[#F5F5F5] text-sm font-mono rounded-xl border border-[#262626] focus:outline-hidden focus:border-[#404040] transition-colors resize-y leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#737373] font-mono">
                {rawPrompt.length} characters
              </span>

              <div className="flex items-center gap-2">
                {analysisResult && (
                  <button
                    type="button"
                    onClick={() => {
                      setAnalysisResult(null);
                      setErrorMessage(null);
                    }}
                    className="px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-[#F5F5F5] bg-[#171717] hover:bg-[#262626] border border-[#262626] rounded-lg transition-colors cursor-pointer"
                  >
                    Clear Analysis
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isLoading || !rawPrompt.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#090909] text-xs font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#090909]" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{analysisResult ? 'Regenerate Analysis' : 'Run AI Analysis'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-[#171717] border border-[#262626] text-xs text-[#A1A1AA] flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-[#737373] shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <p className="font-medium text-[#F5F5F5]">{errorMessage}</p>
                {errorMessage.includes('OPENAI_API_KEY') && (
                  <div className="p-3 bg-[#111111] rounded-lg border border-[#262626] font-mono text-[11px] text-[#A1A1AA] space-y-1 mt-2">
                    <p className="text-[#737373]"># Configuration guide:</p>
                    <p>1. Open <code className="text-[#F5F5F5]">promptshelf-backend/.env</code></p>
                    <p>2. Add: <code className="text-[#F5F5F5]">OPENAI_API_KEY=your_key_here</code></p>
                    <p>3. Optionally set: <code className="text-[#737373]">OPENAI_MODEL=gpt-4o-mini</code></p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analysis Results Display */}
          {analysisResult && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Classification & Metadata Box */}
              <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Description / Purpose */}
                <div className="md:col-span-3 space-y-1">
                  <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                    Description / Purpose
                  </span>
                  <p className="text-sm font-medium text-[#F5F5F5]">
                    {analysisResult.description}
                  </p>
                </div>

                {/* Editable Title */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editableTitle}
                    onChange={(e) => setEditableTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#171717] text-xs text-[#F5F5F5] rounded-lg border border-[#262626] focus:outline-hidden focus:border-[#404040]"
                  />
                </div>

                {/* Editable Category */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={editableCategory}
                    onChange={(e) => setEditableCategory(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#171717] text-xs text-[#F5F5F5] rounded-lg border border-[#262626] focus:outline-hidden focus:border-[#404040] cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Suggested Tags (Monochrome gray) */}
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                    Tags
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {editableTags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-[#171717] text-[#A1A1AA] border border-[#262626] rounded"
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
                      className="px-2 py-0.5 text-xs bg-[#171717] text-[#F5F5F5] placeholder:text-[#737373] rounded border border-[#262626] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* View Switcher: Side-by-side vs Variables */}
              <div className="flex items-center justify-between border-b border-[#262626] pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewTab('comparison')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer',
                      viewTab === 'comparison'
                        ? 'bg-[#191919] text-[#F5F5F5] border border-[#262626]'
                        : 'text-[#737373] hover:text-[#A1A1AA]'
                    )}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Side-by-Side Comparison</span>
                  </button>

                  <button
                    onClick={() => setViewTab('variables')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer',
                      viewTab === 'variables'
                        ? 'bg-[#191919] text-[#F5F5F5] border border-[#262626]'
                        : 'text-[#737373] hover:text-[#A1A1AA]'
                    )}
                  >
                    <Braces className="w-3.5 h-3.5" />
                    <span>Variables ({analysisResult.variables.length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyGeneralized}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-[#A1A1AA] hover:text-[#F5F5F5] bg-[#171717] hover:bg-[#262626] border border-[#262626] rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedGeneralized ? (
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
              </div>

              {/* Tab 1: Side-by-Side Comparison */}
              {viewTab === 'comparison' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Original Prompt */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
                        Original Prompt
                      </span>
                      <span className="text-[11px] text-[#737373] font-mono">Unmodified</span>
                    </div>
                    <div className="p-4 bg-[#111111] rounded-xl border border-[#262626] text-xs font-mono text-[#A1A1AA] whitespace-pre-wrap min-h-[220px] max-h-[340px] overflow-y-auto leading-relaxed">
                      {rawPrompt}
                    </div>
                  </div>

                  {/* Generalized Template (Editable) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#F5F5F5] uppercase tracking-wider">
                        Generalized Template (Editable)
                      </span>
                      <span className="text-[11px] text-[#737373] font-mono">
                        {analysisResult.variables.length} variables
                      </span>
                    </div>
                    <textarea
                      rows={9}
                      value={editableGeneralizedPrompt}
                      onChange={(e) => setEditableGeneralizedPrompt(e.target.value)}
                      className="w-full p-4 bg-[#111111] rounded-xl border border-[#262626] text-xs font-mono text-[#F5F5F5] focus:outline-hidden focus:border-[#404040] whitespace-pre-wrap min-h-[220px] max-h-[340px] overflow-y-auto leading-relaxed resize-y"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Detected Variables Specifications */}
              {viewTab === 'variables' && (
                <div className="space-y-3">
                  {analysisResult.variables.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysisResult.variables.map((variable) => (
                        <div
                          key={variable.name}
                          className="p-3.5 rounded-xl bg-[#111111] border border-[#262626] space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 text-xs font-mono bg-[#171717] text-[#F5F5F5] border border-[#262626] rounded">
                              {`{{${variable.name}}}`}
                            </span>
                          </div>
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
                    <p className="text-xs text-[#737373] italic text-center py-6">
                      No dynamic variables were introduced.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#262626] bg-[#111111]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#737373] hover:text-[#F5F5F5] bg-[#171717] hover:bg-[#262626] border border-[#262626] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {analysisResult && (
            <button
              type="button"
              onClick={handleSaveResult}
              className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-[#090909] bg-[#F5F5F5] hover:bg-[#E5E5E5] rounded-lg transition-all duration-150 active:scale-[0.98] cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save to Prompt Library</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
