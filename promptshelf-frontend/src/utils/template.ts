import type { DetectedVariable } from '../types/prompt';

/**
 * Converts a snake_case, camelCase, kebab-case, or lower variable name into Title Case
 * e.g., "detail_level" -> "Detail Level"
 * "frontend_stack" -> "Frontend Stack"
 * "testFramework" -> "Test Framework"
 */
export function formatVariableLabel(name: string): string {
  // Split on underscores, hyphens, and camelCase transitions
  const words = name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/);

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Extracts all unique variables from a template string enclosed in {{variable_name}}
 */
export function detectVariables(template: string): DetectedVariable[] {
  if (!template) return [];

  // Match {{ variable_name }} allowing spaces inside the braces
  const regex = /\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g;
  const variableMap = new Map<string, number>();

  let match: RegExpExecArray | null;
  while ((match = regex.exec(template)) !== null) {
    const varName = match[1];
    variableMap.set(varName, (variableMap.get(varName) || 0) + 1);
  }

  const result: DetectedVariable[] = [];
  variableMap.forEach((occurrences, name) => {
    result.push({
      name,
      label: formatVariableLabel(name),
      occurrences,
    });
  });

  return result;
}

export interface SubstitutionResult {
  renderedText: string;
  missingVariables: string[];
  totalVariables: number;
  filledVariables: number;
  isComplete: boolean;
}

/**
 * Replaces every occurrence of {{var}} with the user-provided value.
 * Tracks missing required values (unfilled or whitespace-only).
 */
export function substituteTemplate(
  template: string,
  values: Record<string, string>
): SubstitutionResult {
  if (!template) {
    return {
      renderedText: '',
      missingVariables: [],
      totalVariables: 0,
      filledVariables: 0,
      isComplete: true,
    };
  }

  const variables = detectVariables(template);
  const missingVariables: string[] = [];
  let filledCount = 0;

  for (const v of variables) {
    const val = values[v.name];
    if (val !== undefined && val.trim() !== '') {
      filledCount++;
    } else {
      missingVariables.push(v.name);
    }
  }

  // Replace occurrences in template
  const regex = /\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g;
  const renderedText = template.replace(regex, (fullMatch, varName) => {
    const val = values[varName];
    if (val !== undefined && val.trim() !== '') {
      return val;
    }
    // Return original placeholder if not filled
    return fullMatch;
  });

  return {
    renderedText,
    missingVariables,
    totalVariables: variables.length,
    filledVariables: filledCount,
    isComplete: missingVariables.length === 0,
  };
}
