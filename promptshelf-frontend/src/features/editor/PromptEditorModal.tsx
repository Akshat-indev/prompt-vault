import { useState, useEffect, type FC } from 'react';
import {
  X,
  Braces,
  Save,
  Tag as TagIcon,
  Sparkles,
  AlertCircle,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import type { Prompt, CreatePromptInput } from '../../types/prompt';
import { detectVariables } from '../../utils/template';
import { cn } from '../../utils/cn';

interface PromptEditorModalProps {
  isOpen: boolean;
  editingPrompt: Prompt | null;
  onClose: () => void;
  onSave: (data: CreatePromptInput) => void;
}

const CATEGORIES = [
  'Coding',
  'Debugging',
  'Writing',
  'Research',
  'Productivity',
  'Other',
];

export const PromptEditorModal: FC<PromptEditorModalProps> = ({
  isOpen,
  editingPrompt,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Coding');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Errors
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  useEffect(() => {
    if (editingPrompt) {
      setTitle(editingPrompt.title);
      setDescription(editingPrompt.description);
      setCategory(editingPrompt.category);
      setTags([...editingPrompt.tags]);
      setContent(editingPrompt.content);
      setIsFavorite(editingPrompt.isFavorite);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Coding');
      setTags([]);
      setContent('');
      setIsFavorite(false);
    }
    setErrors({});
    setTagInput('');
  }, [editingPrompt, isOpen]);

  if (!isOpen || !editingPrompt) return null;

  const detectedVars = detectVariables(content);

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

  const validate = (): boolean => {
    const newErrors: { title?: string; content?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (!content.trim()) {
      newErrors.content = 'Prompt content template is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      tags,
      content: content.trim(),
      original_prompt: editingPrompt.original_prompt,
      isFavorite,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-[#0D0D0D] border border-[#262626] rounded-xl shadow-2xl overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#111111]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#171717] border border-[#262626] text-[#F5F5F5]">
              <Braces className="w-4 h-4" />
            </div>
            <div>
              <h2 id="editor-title" className="text-base font-medium text-[#F5F5F5]">
                Edit Prompt Template
              </h2>
              <p className="text-xs text-[#737373]">
                Update metadata, template structure, and dynamic placeholders like <code className="text-[#A1A1AA] font-mono">{'{{role}}'}</code>.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-[#737373] hover:text-[#F5F5F5] p-1.5 rounded-lg hover:bg-[#171717] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 max-h-[75vh] overflow-y-auto">
          {/* Title & Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                Title <span className="text-neutral-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                placeholder="e.g. Senior Code Reviewer"
                className={cn(
                  'w-full px-3.5 py-2.5 bg-[#111111] text-[#F5F5F5] text-sm rounded-lg border focus:outline-hidden transition-colors',
                  errors.title
                    ? 'border-neutral-500'
                    : 'border-[#262626] focus:border-[#404040]'
                )}
              />
              {errors.title && (
                <p className="flex items-center gap-1 text-xs text-neutral-400 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                Category <span className="text-neutral-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#111111] text-[#F5F5F5] text-sm rounded-lg border border-[#262626] focus:outline-hidden focus:border-[#404040] cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
              Description <span className="text-[#737373] font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of when to use this prompt..."
              className="w-full px-3.5 py-2.5 bg-[#111111] text-[#F5F5F5] text-sm rounded-lg border border-[#262626] focus:outline-hidden focus:border-[#404040] transition-colors"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
              Tags <span className="text-[#737373] font-normal lowercase">(press Enter or comma to add)</span>
            </label>
            <div className="flex flex-wrap items-center gap-2 p-2 bg-[#111111] border border-[#262626] rounded-lg min-h-[42px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-[#171717] text-[#A1A1AA] border border-[#262626] rounded"
                >
                  <TagIcon className="w-3 h-3 text-[#737373]" />
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-[#737373] hover:text-[#F5F5F5] ml-0.5"
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
                placeholder={tags.length === 0 ? "Type tag name and hit Enter..." : "Add another tag..."}
                className="flex-1 min-w-[140px] bg-transparent text-sm text-[#F5F5F5] placeholder:text-[#737373] focus:outline-hidden px-1 py-0.5"
              />
            </div>
          </div>

          {/* Content (Template with variables) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                Prompt Template <span className="text-neutral-400">*</span>
              </label>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[11px] text-[#737373] font-mono bg-[#171717] px-2 py-0.5 rounded border border-[#262626]">
                  <HelpCircle className="w-3 h-3" />
                  <span>{'{{variable_name}}'}</span>
                </div>
              </div>
            </div>

            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
              }}
              rows={8}
              placeholder={`e.g.\nYou are a {{role}}. Help me write a {{task}} in {{language}}.\nEnsure that {{specific_requirement}} is satisfied.`}
              className={cn(
                'w-full px-3.5 py-2.5 bg-[#111111] text-[#F5F5F5] text-sm font-mono rounded-lg border focus:outline-hidden transition-colors resize-y leading-relaxed',
                errors.content
                  ? 'border-neutral-500'
                  : 'border-[#262626] focus:border-[#404040]'
              )}
            />
            {errors.content && (
              <p className="flex items-center gap-1 text-xs text-neutral-400 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.content}</span>
              </p>
            )}

            {/* Live Detected Variables Preview */}
            <div className="p-3 rounded-lg bg-[#111111] border border-[#262626]">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#737373]" />
                <span className="text-xs font-medium text-[#A1A1AA]">
                  Detected Variables ({detectedVars.length}):
                </span>
              </div>
              {detectedVars.length > 0 ? (
                <div className="flex items-center gap-2 flex-wrap">
                  {detectedVars.map((v) => (
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
                  No variables detected yet. Wrap placeholders in double curly braces (e.g. <code className="text-[#A1A1AA]">{'{{task}}'}</code>).
                </p>
              )}
            </div>

            {/* Original Prompt (if present) */}
            {editingPrompt.original_prompt && (
              <div className="p-3.5 rounded-lg bg-[#111111] border border-[#262626] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-[#737373] font-semibold uppercase tracking-wider">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Original Prompt (Preserved)</span>
                </div>
                <div className="text-xs font-mono text-[#A1A1AA] bg-[#141414] p-3 rounded border border-[#262626] whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed">
                  {editingPrompt.original_prompt}
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#262626]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#A1A1AA] hover:text-[#F5F5F5] bg-[#171717] hover:bg-[#262626] rounded-lg border border-[#262626] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-[#090909] bg-[#F5F5F5] hover:bg-[#E5E5E5] rounded-lg transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
