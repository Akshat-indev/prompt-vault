import { useState, useEffect, useMemo, type FC } from 'react';
import {
  X,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Braces,
  Edit2,
  CopyPlus,
  Trash2,
  Star,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import type { Prompt } from '../../types/prompt';
import { detectVariables, substituteTemplate } from '../../utils/template';
import { copyToClipboard } from '../../utils/clipboard';
import { cn } from '../../utils/cn';

interface PromptBuilderModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (prompt: Prompt) => void;
  onDuplicate: (id: string) => void;
  onDeleteRequest: (prompt: Prompt) => void;
  onToggleFavorite: (id: string) => void;
  onNotify?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Coding: { bg: 'bg-cyan-950/25', text: 'text-cyan-400', border: 'border-cyan-800/30' },
  Debugging: { bg: 'bg-amber-950/25', text: 'text-amber-400', border: 'border-amber-800/30' },
  Writing: { bg: 'bg-emerald-950/25', text: 'text-emerald-400', border: 'border-emerald-800/30' },
  Research: { bg: 'bg-violet-950/25', text: 'text-violet-400', border: 'border-violet-800/30' },
  Productivity: { bg: 'bg-blue-950/25', text: 'text-blue-400', border: 'border-blue-800/30' },
  Other: { bg: 'bg-[#171717]', text: 'text-[#A1A1AA]', border: 'border-[#262626]' },
};

export const PromptBuilderModal: FC<PromptBuilderModalProps> = ({
  prompt,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onDeleteRequest,
  onToggleFavorite,
  onNotify,
}) => {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<boolean>(false);
  const [copyAttemptedWithErrors, setCopyAttemptedWithErrors] = useState<boolean>(false);

  // Extract detected variables
  const variables = useMemo(() => {
    if (!prompt) return [];
    return detectVariables(prompt.content);
  }, [prompt]);

  // Reset or initialize values when prompt opens
  useEffect(() => {
    if (prompt) {
      setVariableValues({});
      setCopied(false);
      setCopyAttemptedWithErrors(false);
    }
  }, [prompt]);

  // Substitution evaluation
  const substitution = useMemo(() => {
    if (!prompt) {
      return {
        renderedText: '',
        missingVariables: [],
        totalVariables: 0,
        filledVariables: 0,
        isComplete: true,
      };
    }
    return substituteTemplate(prompt.content, variableValues);
  }, [prompt, variableValues]);

  if (!isOpen || !prompt) return null;

  const categoryStyle = CATEGORY_STYLES[prompt.category] || CATEGORY_STYLES.Other;

  const handleInputChange = (varName: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [varName]: value,
    }));
    if (copyAttemptedWithErrors && value.trim() !== '') {
      setCopyAttemptedWithErrors(false);
    }
  };

  const handleResetValues = () => {
    setVariableValues({});
    setCopyAttemptedWithErrors(false);
    onNotify?.('Reset all variable values', 'info');
  };

  // Demo prefill to quickly test the prompt
  const handleQuickDemoFill = () => {
    const demoValues: Record<string, string> = {};
    variables.forEach((v) => {
      const name = v.name.toLowerCase();
      if (name.includes('lang')) demoValues[v.name] = 'TypeScript';
      else if (name.includes('role')) demoValues[v.name] = 'Staff Software Engineer';
      else if (name.includes('task')) demoValues[v.name] = 'Build an authenticated webhook listener';
      else if (name.includes('context')) demoValues[v.name] = 'High-throughput Node.js microservice handling payment events';
      else if (name.includes('error')) demoValues[v.name] = 'TypeError: Cannot read properties of undefined (reading "id")';
      else if (name.includes('feature')) demoValues[v.name] = 'Real-time collaborative cursor tracking';
      else if (name.includes('audience')) demoValues[v.name] = 'Frontend Engineers and Technical Leads';
      else demoValues[v.name] = `Example ${v.label} value`;
    });
    setVariableValues(demoValues);
    setCopyAttemptedWithErrors(false);
    onNotify?.('Sample values filled', 'info');
  };

  const handleCopyGenerated = async () => {
    if (!substitution.isComplete) {
      setCopyAttemptedWithErrors(true);
      onNotify?.(
        `Fill in all variables (${substitution.missingVariables.length} remaining) before copying.`,
        'error'
      );
      return;
    }

    const success = await copyToClipboard(substitution.renderedText);
    if (success) {
      setCopied(true);
      onNotify?.('Generated prompt copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2500);
    } else {
      onNotify?.('Failed to copy to clipboard', 'error');
    }
  };

  const wordCount = substitution.renderedText.trim()
    ? substitution.renderedText.trim().split(/\s+/).length
    : 0;
  const charCount = substitution.renderedText.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-6xl bg-[#0D0D0D] border border-[#262626] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="builder-title"
      >
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 border-b border-[#262626] bg-[#111111] gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={cn(
                  'px-2.5 py-0.5 text-xs font-medium rounded border',
                  categoryStyle.bg,
                  categoryStyle.text,
                  categoryStyle.border
                )}
              >
                {prompt.category}
              </span>
              <h2 id="builder-title" className="text-base font-medium text-[#F5F5F5] truncate">
                {prompt.title}
              </h2>
            </div>
            {prompt.description && (
              <p className="text-xs text-[#737373] mt-1 line-clamp-1">
                {prompt.description}
              </p>
            )}
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {/* Favorite button */}
            <button
              type="button"
              onClick={() => onToggleFavorite(prompt.id)}
              title={prompt.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className={cn(
                'p-2 rounded-lg border transition-colors cursor-pointer',
                prompt.isFavorite
                  ? 'bg-[#191919] text-[#F5F5F5] border-[#262626]'
                  : 'text-[#737373] border-transparent hover:text-[#F5F5F5] hover:bg-[#191919]'
              )}
            >
              <Star className={cn('w-4 h-4', prompt.isFavorite && 'fill-[#F5F5F5]')} />
            </button>

            {/* Edit button */}
            <button
              type="button"
              onClick={() => onEdit(prompt)}
              title="Edit template"
              className="p-2 text-[#737373] hover:text-[#F5F5F5] bg-[#171717] hover:bg-[#262626] border border-[#262626] rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Duplicate button */}
            <button
              type="button"
              onClick={() => onDuplicate(prompt.id)}
              title="Duplicate prompt"
              className="p-2 text-[#737373] hover:text-[#F5F5F5] bg-[#171717] hover:bg-[#262626] border border-[#262626] rounded-lg transition-colors cursor-pointer"
            >
              <CopyPlus className="w-4 h-4" />
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => onDeleteRequest(prompt)}
              title="Delete prompt"
              className="p-2 text-[#737373] hover:text-[#F5F5F5] bg-[#171717] hover:bg-[#262626] border border-[#262626] rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="h-5 w-px bg-[#262626] mx-1 hidden sm:block" />

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#737373] hover:text-[#F5F5F5] hover:bg-[#191919] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Builder Content Area (Two Columns) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-[#262626]">
          {/* Left Column: Dynamic Variable Form */}
          <div className="lg:col-span-5 p-5 md:p-6 flex flex-col justify-between bg-[#0F0F0F] overflow-y-auto">
            <div>
              {/* Form Title & Controls */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#262626]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#171717] border border-[#262626] text-[#A1A1AA]">
                    <Braces className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#F5F5F5]">
                      Variables
                    </h3>
                    <p className="text-[11px] text-[#737373]">
                      {variables.length > 0
                        ? `${substitution.filledVariables} of ${substitution.totalVariables} filled`
                        : 'No dynamic variables required'}
                    </p>
                  </div>
                </div>

                {variables.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleQuickDemoFill}
                      title="Fill with sample values"
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#A1A1AA] hover:text-[#F5F5F5] bg-[#171717] hover:bg-[#262626] border border-[#262626] rounded-md transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Sample</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetValues}
                      title="Clear all inputs"
                      className="flex items-center gap-1 px-2 py-1 text-xs text-[#737373] hover:text-[#F5F5F5] hover:bg-[#191919] rounded-md transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Variable Input Fields */}
              {variables.length > 0 ? (
                <div className="space-y-4">
                  {variables.map((variable) => {
                    const isMissing =
                      copyAttemptedWithErrors &&
                      (!variableValues[variable.name] ||
                        variableValues[variable.name].trim() === '');
                    const isFilled =
                      variableValues[variable.name] &&
                      variableValues[variable.name].trim() !== '';

                    return (
                      <div key={variable.name} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-[#A1A1AA] flex items-center gap-1">
                            <span>{variable.label}</span>
                            <span className="text-[#737373]">*</span>
                          </label>
                          <span className="text-[10px] font-mono text-[#737373] bg-[#171717] px-1.5 py-0.5 rounded border border-[#262626]">
                            {`{{${variable.name}}}`}
                            {variable.occurrences > 1 && (
                              <span className="text-[#737373] ml-1">
                                (x{variable.occurrences})
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Textarea for multiline variable values */}
                        <textarea
                          rows={2}
                          value={variableValues[variable.name] || ''}
                          onChange={(e) => handleInputChange(variable.name, e.target.value)}
                          placeholder={`Enter ${variable.label.toLowerCase()}...`}
                          className={cn(
                            'w-full px-3 py-2 bg-[#111111] text-[#F5F5F5] text-sm rounded-lg border focus:outline-hidden transition-colors resize-y min-h-[42px]',
                            isMissing
                              ? 'border-neutral-500'
                              : isFilled
                              ? 'border-[#383838] focus:border-[#525252]'
                              : 'border-[#262626] focus:border-[#404040]'
                          )}
                        />

                        {isMissing && (
                          <p className="flex items-center gap-1 text-[11px] text-neutral-400">
                            <AlertCircle className="w-3 h-3" />
                            <span>This variable is required to generate the prompt.</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-[#141414] border border-[#262626] text-center my-6">
                  <CheckCircle2 className="w-6 h-6 text-[#A1A1AA] mx-auto mb-2" />
                  <p className="text-sm font-medium text-[#F5F5F5]">
                    Static Template
                  </p>
                  <p className="text-xs text-[#737373] mt-1">
                    No variables in this template. Ready to copy immediately.
                  </p>
                </div>
              )}
            </div>

            {/* Validation Banner if missing values */}
            {copyAttemptedWithErrors && substitution.missingVariables.length > 0 && (
              <div className="mt-5 p-3 rounded-lg bg-[#171717] border border-[#262626] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#A1A1AA] shrink-0 mt-0.5" />
                <div className="text-xs text-[#A1A1AA]">
                  <p className="font-medium text-[#F5F5F5]">Missing Required Variables</p>
                  <p className="mt-0.5">
                    Please provide values for: {substitution.missingVariables.map((v) => `{{${v}}}`).join(', ')}.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Generated Prompt Preview */}
          <div className="lg:col-span-7 p-5 md:p-6 flex flex-col justify-between bg-[#090909] overflow-y-auto">
            <div className="space-y-3">
              {/* Preview Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#141414] border border-[#262626] text-[#A1A1AA]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#F5F5F5]">
                      Generated Prompt Preview
                    </h3>
                    <p className="text-[11px] text-[#737373]">
                      Deterministic substitution
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#737373] font-mono">
                  <span>{wordCount} words</span>
                  <span>•</span>
                  <span>{charCount} chars</span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#111111] border border-[#262626] text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      substitution.isComplete ? 'bg-[#F5F5F5]' : 'bg-[#737373]'
                    )}
                  />
                  <span className="text-[#A1A1AA]">
                    {substitution.isComplete
                      ? 'Ready to Copy & Use'
                      : `${substitution.missingVariables.length} variable(s) remaining`}
                  </span>
                </div>

                {variables.length > 0 && (
                  <div className="w-20 bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F5F5F5] transition-all duration-300"
                      style={{
                        width: `${(substitution.filledVariables / substitution.totalVariables) * 100}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Preview Content Box */}
              <div>
                <div className="w-full p-4 bg-[#111111] rounded-xl border border-[#262626] text-[#F5F5F5] font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap min-h-[320px] max-h-[460px] overflow-y-auto selection:bg-[#262626]">
                  {substitution.renderedText}
                </div>
              </div>
            </div>

            {/* Action Footer with White Primary Copy Button */}
            <div className="pt-5 mt-4 border-t border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-[#737373] text-center sm:text-left">
                Deterministic output. Zero external AI API calls or keys required.
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={async () => {
                    const success = await copyToClipboard(prompt.content);
                    if (success) {
                      onNotify?.('Template copied', 'info');
                    }
                  }}
                  title="Copy raw template with {{variables}}"
                  className="px-3.5 py-2 text-xs font-medium text-[#A1A1AA] hover:text-[#F5F5F5] bg-[#171717] hover:bg-[#262626] border border-[#262626] rounded-lg transition-colors cursor-pointer"
                >
                  Copy Template
                </button>

                <button
                  type="button"
                  onClick={handleCopyGenerated}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-medium bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#090909] transition-all duration-150 active:scale-[0.98] cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#090909]" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Generated Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
