import { detectVariables, substituteTemplate, formatVariableLabel } from './src/utils/template';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`✅ Passed: ${message}`);
}

console.log('--- Testing Template Utilities ---');

// 1. Variable Detection
const testTemplate = 'You are a {{role}}. Help me with {{task}} using {{language}}. Ensure {{language}} is idiomatic and {{detail_level}} is respected.';
const detected = detectVariables(testTemplate);

assert(detected.length === 4, `Detected 4 unique variables (got ${detected.length})`);
assert(detected[0].name === 'role', 'First variable is role');
assert(detected[0].label === 'Role', 'Label for role is Role');
assert(detected[2].name === 'language', 'Third variable is language');
assert(detected[2].occurrences === 2, `Language variable occurs 2 times (got ${detected[2].occurrences})`);
assert(detected[3].name === 'detail_level', 'Fourth variable is detail_level');
assert(detected[3].label === 'Detail Level', `Label for detail_level is "Detail Level" (got "${detected[3].label}")`);

// 2. Formatting Variable Labels
assert(formatVariableLabel('snake_case_var') === 'Snake Case Var', 'Formats snake_case correctly');
assert(formatVariableLabel('camelCaseVar') === 'Camel Case Var', 'Formats camelCase correctly');
assert(formatVariableLabel('kebab-case-var') === 'Kebab Case Var', 'Formats kebab-case correctly');

// 3. Substitution with Missing Variables
const incomplete = substituteTemplate(testTemplate, {
  role: 'Software Architect',
  task: 'designing a rate limiter',
});

assert(!incomplete.isComplete, 'Template is not marked complete when variables are missing');
assert(incomplete.missingVariables.includes('language'), 'Missing variables includes language');
assert(incomplete.missingVariables.includes('detail_level'), 'Missing variables includes detail_level');
assert(incomplete.renderedText.includes('Software Architect'), 'Substituted role in output');
assert(incomplete.renderedText.includes('{{language}}'), 'Preserves missing placeholders');

// 4. Substitution with Complete Variables
const complete = substituteTemplate(testTemplate, {
  role: 'Software Architect',
  task: 'designing a rate limiter',
  language: 'Go',
  detail_level: 'high',
});

assert(complete.isComplete, 'Template is marked complete when all variables filled');
assert(complete.missingVariables.length === 0, 'No missing variables');
assert(complete.renderedText.includes('using Go'), 'First occurrence of language replaced with Go');
assert(complete.renderedText.includes('Ensure Go is idiomatic'), 'Second occurrence of language also replaced with Go consistently');
assert(!complete.renderedText.includes('{{'), 'No unreplaced placeholders remain');

// 5. Multiline Value Support
const multiline = substituteTemplate('Code snippet:\n{{code}}', {
  code: 'function hello() {\n  return "world";\n}',
});
assert(multiline.renderedText.includes('return "world";'), 'Multiline values substituted properly');

console.log('🎉 All template unit assertions passed successfully!');
