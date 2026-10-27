import type { Prompt } from '../types/prompt';

export const SEED_PROMPTS: Prompt[] = [
  {
    id: 'b819f07a-24ce-4d56-a19e-e8185d3f1101',
    title: 'Senior Code Reviewer',
    description: 'Thorough, actionable code review analyzing security, performance, readability, and edge cases.',
    category: 'Coding',
    tags: ['code-review', 'best-practices', 'clean-code', 'security'],
    isFavorite: true,
    content: `You are a Principal Software Engineer specializing in {{language}} and clean code architecture.

Review the following {{code_type}} for:
1. Potential bugs, memory leaks, and edge cases
2. Performance bottlenecks and algorithmic complexity
3. Security vulnerabilities (e.g. input sanitation, injection risks, authentication gaps)
4. Idiomatic {{language}} conventions and readability
5. Suggestions for unit test coverage

Context/Requirements:
{{context}}

Code to review:
\`\`\`{{language}}
{{code_snippet}}
\`\`\`

Provide your critique in a structured format with severity tags (CRITICAL, WARNING, SUGGESTION) and concrete refactored code examples.`,
    original_prompt: 'Please review my Python backend code for security bugs and performance bottlenecks.',
    createdAt: '2026-10-20T10:00:00.000Z',
    updatedAt: '2026-10-25T14:30:00.000Z',
  },
  {
    id: 'c92af18b-35df-4e67-b20f-f9296e4a2202',
    title: 'Bug & Stack Trace Explainer',
    description: 'Deconstruct complex runtime exceptions, root cause analysis, and step-by-step resolution.',
    category: 'Debugging',
    tags: ['debugging', 'error-handling', 'troubleshooting'],
    isFavorite: true,
    content: `You are an expert debugger in {{framework_or_runtime}}.

I encountered the following error while trying to {{attempted_action}}.

Error / Stack Trace:
\`\`\`
{{error_message}}
\`\`\`

Relevant Code / Configuration:
\`\`\`
{{relevant_code}}
\`\`\`

Environment Details:
- OS/Runtime: {{environment}}
- Dependencies/Versions: {{versions}}

Please provide:
1. Clear explanation of what this error actually means in plain terms.
2. Root cause analysis: why this occurred in this specific context.
3. Step-by-step fix with exact code diffs.
4. How to prevent this error in the future (linting rules, type-checking, or tests).`,
    createdAt: '2026-10-21T11:15:00.000Z',
    updatedAt: '2026-10-24T09:20:00.000Z',
  },
  {
    id: 'da3b029c-46ef-4f78-c310-0a3a7f5b3303',
    title: 'System Architecture & Feature Planner',
    description: 'Decompose product requirements into an engineering specification, data models, and API contracts.',
    category: 'Productivity',
    tags: ['architecture', 'planning', 'api-design', 'scaffolding'],
    isFavorite: false,
    content: `Act as a Staff Systems Architect. Design a production-grade implementation plan for the following feature:

Feature Name: {{feature_name}}
Product Goals & Target Users:
{{product_goals}}

Tech Stack Constraints:
- Frontend: {{frontend_stack}}
- Backend: {{backend_stack}}
- Database / Storage: {{database_stack}}

Expected Scale / Latency Requirements:
{{scale_requirements}}

Produce a comprehensive technical design document covering:
1. High-level architecture overview and data flow diagram (ASCII or Mermaid)
2. Database schema design (tables, columns, indexes, foreign keys)
3. REST/GraphQL API specifications with request/response payloads
4. State management and caching strategy
5. Error handling, edge cases, and failure modes
6. Phased implementation milestones (Milestone 1, 2, 3)`,
    createdAt: '2026-10-22T08:45:00.000Z',
    updatedAt: '2026-10-26T16:00:00.000Z',
  },
  {
    id: 'eb4c130d-57f0-4089-d421-1b4b806c4404',
    title: 'Technical Documentation Writer',
    description: 'Transform complex code, APIs, or internal tools into crisp developer documentation with examples.',
    category: 'Writing',
    tags: ['documentation', 'api-docs', 'markdown', 'dev-experience'],
    isFavorite: false,
    content: `You are a Lead Technical Writer at a top developer tools company.

Write clear, concise, and exhaustive documentation for {{module_name}}.

Audience: {{target_audience}} (e.g. junior developers, platform engineers, external API consumers)

Key Features / Capabilities:
{{features_summary}}

Raw Details or Source Reference:
\`\`\`
{{raw_reference_material}}
\`\`\`

Format the documentation in Markdown following this structure:
# {{module_name}}
- **Overview**: 2-sentence summary of purpose and value proposition.
- **Quickstart Guide**: Minimal reproducible example to get running in under 2 minutes.
- **API Reference**: Methods, parameters, return types, and exceptions.
- **Common Recipes & Patterns**: 2 practical real-world use cases.
- **Troubleshooting & FAQs**: Common pitfalls and solutions.`,
    createdAt: '2026-10-23T14:00:00.000Z',
    updatedAt: '2026-10-23T14:00:00.000Z',
  },
  {
    id: 'fc5d241e-6801-419a-e532-2c5c917d5505',
    title: 'Deep Research & Technology Comparison',
    description: 'Compare competing technologies, libraries, or architectural patterns with trade-offs matrix.',
    category: 'Research',
    tags: ['research', 'trade-offs', 'decision-making', 'tech-stack'],
    isFavorite: true,
    content: `You are an unbiased Technology Research Analyst.

Conduct an in-depth comparison between:
Options: {{technologies_to_compare}}
Primary Use Case: {{use_case}}
Team Skill Level & Constraints: {{team_constraints}}

Analyze each option along these dimensions:
1. Performance, Memory Footprint, and Scalability
2. Developer Experience (DX), Ecosystem Maturity, and Tooling
3. Community Health, Maintenance, and Security Track Record
4. Operational Overhead and Deployment Complexity

Synthesize your findings into:
- A Markdown Comparison Matrix (Pros, Cons, Best For)
- Concrete "When to pick X vs Y" heuristics
- Final recommendation with explicit justification based on our constraints.`,
    createdAt: '2026-10-24T18:20:00.000Z',
    updatedAt: '2026-10-25T11:10:00.000Z',
  },
  {
    id: '0d6e352f-7912-42ab-f643-3d6da28e6606',
    title: 'Unit & Integration Test Generator',
    description: 'Generate robust test suites with happy paths, boundary cases, and mocks.',
    category: 'Coding',
    tags: ['testing', 'tdd', 'jest', 'vitest', 'unit-test'],
    isFavorite: false,
    content: `You are a Test Automation Specialist proficient in {{test_framework}} (e.g., Vitest, Jest, PyTest, Go test).

Write an exhaustive suite of unit and integration tests for the following {{unit_type}}:

Source Code:
\`\`\`{{language}}
{{source_code}}
\`\`\`

Testing Requirements:
- Cover all happy paths
- Cover null, empty, boundary, and unexpected input values
- Mock external dependencies: {{external_dependencies_to_mock}}
- Include clear, descriptive test names following the "should [expected behavior] when [condition]" pattern.
- Aim for maximum branch coverage.`,
    createdAt: '2026-10-25T09:00:00.000Z',
    updatedAt: '2026-10-26T12:00:00.000Z',
  },
];
