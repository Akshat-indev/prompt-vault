import { createApp } from './src/app';
import { aiAnalyzeResultSchema } from './src/schemas/promptSchema';
import type { Server } from 'http';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`✅ Passed: ${message}`);
}

async function runCreationFlowTests() {
  const TEST_PORT = 3101;
  process.env.PORT = String(TEST_PORT);
  const app = createApp();

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(TEST_PORT, () => resolve(s));
  });

  const BASE_URL = `http://localhost:${TEST_PORT}/api`;

  try {
    console.log(`--- Testing AI Prompt Creation & Storage Flow at ${BASE_URL} ---`);

    // 1. Zod Schema Verification for AI Structured Output
    console.log('\n[1] Verifying Zod schema for AI response...');
    const mockAiResponse = {
      title: 'Python Memory Leak Diagnoser',
      description: 'Analyze Python memory consumption and identify uncollected references.',
      category: 'Debugging',
      tags: ['python', 'memory-leak', 'debugging', 'gc'],
      original_prompt: 'Please check this Python code to see why memory usage grows over 10GB during data processing.',
      generalized_prompt: 'Analyze the following {{language}} routine for memory leaks and resource retention: {{code_snippet}}',
      variables: [
        {
          name: 'language',
          description: 'Programming language runtime',
          example: 'Python 3.12',
        },
        {
          name: 'code_snippet',
          description: 'Source code under investigation',
          example: 'def process_stream(data): pass',
        },
      ],
    };

    const validatedAiResult = aiAnalyzeResultSchema.parse(mockAiResponse);
    assert(validatedAiResult.title === mockAiResponse.title, 'AI schema validates title');
    assert(validatedAiResult.description === mockAiResponse.description, 'AI schema validates description');
    assert(validatedAiResult.category === 'Debugging', 'AI schema validates category');
    assert(validatedAiResult.tags.length === 4, 'AI schema validates tags array');
    assert(validatedAiResult.original_prompt === mockAiResponse.original_prompt, 'AI schema validates original_prompt');
    assert(validatedAiResult.generalized_prompt === mockAiResponse.generalized_prompt, 'AI schema validates generalized_prompt');
    assert(validatedAiResult.variables.length === 2, 'AI schema validates variables array');

    // 2. Test Input Validation for /api/prompts/analyze
    console.log('\n[2] Testing POST /api/prompts/analyze validation...');
    const emptyAnalyzeRes = await fetch(`${BASE_URL}/prompts/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '   ' }),
    });
    assert(emptyAnalyzeRes.status === 400, 'Rejects empty prompt with 400 Bad Request');

    const tooShortRes = await fetch(`${BASE_URL}/prompts/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'hi' }),
    });
    assert(tooShortRes.status === 400, 'Rejects too short prompt (< 5 chars) with 400 Bad Request');

    // 3. Test Provider failure behavior (No fake output returned)
    console.log('\n[3] Testing provider error handling (no fake output)...');
    const analyzeCall = await fetch(`${BASE_URL}/prompts/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Please write a script to scrape data from websites.' }),
    });
    const analyzeData = await analyzeCall.json();
    assert(analyzeData.success === false, 'Fails safely when AI provider is unconfigured');
    assert(typeof analyzeData.error === 'string', 'Returns descriptive error');
    assert(!analyzeData.data, 'Never displays fake AI output when provider fails');

    // 4. Test User Save to PromptShelf (Step 8 & 9 of flow)
    console.log('\n[4] Testing Save to PromptShelf endpoint...');
    const savePayload = {
      title: validatedAiResult.title,
      description: validatedAiResult.description,
      category: validatedAiResult.category,
      tags: validatedAiResult.tags,
      content: validatedAiResult.generalized_prompt,
      original_prompt: validatedAiResult.original_prompt,
      isFavorite: false,
    };

    const createRes = await fetch(`${BASE_URL}/prompts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savePayload),
    });
    assert(createRes.status === 201, 'POST /api/prompts returns 201 Created');
    const createdData = await createRes.json();
    const createdId = createdData.data.id;
    assert(createdData.data.title === savePayload.title, 'Created prompt has user-confirmed title');
    assert(createdData.data.content === savePayload.content, 'Created prompt has generalized template as content');
    assert(createdData.data.original_prompt === savePayload.original_prompt, 'Original prompt is preserved in storage');

    // 5. Test Retrieval of Stored Prompt with Original & Generalized Template
    console.log('\n[5] Testing retrieval of stored prompt...');
    const getRes = await fetch(`${BASE_URL}/prompts/${createdId}`);
    assert(getRes.status === 200, 'GET /api/prompts/:id returns 200');
    const retrieved = (await getRes.json()).data;
    assert(retrieved.id === createdId, 'Retrieved prompt has correct ID');
    assert(retrieved.original_prompt === savePayload.original_prompt, 'Preserves original_prompt on GET');
    assert(retrieved.content === savePayload.content, 'Preserves generalized content on GET');

    // 6. Test Search Across Original Prompt
    console.log('\n[6] Testing search across original prompt...');
    const searchRes = await fetch(`${BASE_URL}/prompts?search=10GB`);
    assert(searchRes.status === 200, 'GET /api/prompts?search=10GB returns 200');
    const searchData = await searchRes.json();
    const found = searchData.data.some((p: any) => p.id === createdId);
    assert(found === true, 'Successfully finds prompt by query in original_prompt');

    // 7. Cleanup created prompt
    await fetch(`${BASE_URL}/prompts/${createdId}`, { method: 'DELETE' });

    console.log('\n🎉 All AI creation & storage flow assertions passed successfully!');
  } finally {
    server.close();
  }
}

runCreationFlowTests().catch((err) => {
  console.error('Creation flow test suite failed:', err);
  process.exit(1);
});
