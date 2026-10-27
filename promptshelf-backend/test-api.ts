import { createApp } from './src/app';
import type { Server } from 'http';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`✅ Passed: ${message}`);
}

async function runTests() {
  const TEST_PORT = 3099;
  process.env.PORT = String(TEST_PORT);
  const app = createApp();

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(TEST_PORT, () => resolve(s));
  });

  const BASE_URL = `http://localhost:${TEST_PORT}/api`;

  try {
    console.log(`--- Testing Backend REST API at ${BASE_URL} ---`);

    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    assert(healthRes.status === 200, 'Health endpoint returns 200');
    const healthData = await healthRes.json();
    assert(healthData.status === 'ok', 'Health status is ok');

    // 2. GET all prompts
    const listRes = await fetch(`${BASE_URL}/prompts`);
    assert(listRes.status === 200, 'GET /api/prompts returns 200');
    const listData = await listRes.json();
    assert(listData.success === true, 'Response success is true');
    assert(Array.isArray(listData.data), 'Returns prompt array');
    const initialCount = listData.data.length;
    assert(initialCount >= 5, `Initial seed prompts loaded (found ${initialCount})`);

    // 3. POST new prompt (valid)
    const newPromptPayload = {
      title: 'Automated Test Prompt',
      description: 'Created during integration testing',
      category: 'Coding',
      tags: ['test', 'integration'],
      content: 'Hello {{target_name}}, welcome to {{environment}}!',
      original_prompt: 'Hello world, welcome to production!',
      isFavorite: false,
    };

    const createRes = await fetch(`${BASE_URL}/prompts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPromptPayload),
    });
    assert(createRes.status === 201, 'POST /api/prompts returns 201 Created');
    const createData = await createRes.json();
    assert(createData.data.id !== undefined, 'Created prompt has generated UUID');
    assert(createData.data.title === newPromptPayload.title, 'Created prompt title matches');
    assert(createData.data.original_prompt === newPromptPayload.original_prompt, 'Preserves original_prompt on create');
    const createdId = createData.data.id;

    // 4. POST invalid prompt (validation failure)
    const invalidRes = await fetch(`${BASE_URL}/prompts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'Missing title and content' }),
    });
    assert(invalidRes.status === 400, 'POST with invalid body returns 400 Bad Request');
    const invalidData = await invalidRes.json();
    assert(invalidData.error === 'Validation failed', 'Returns validation failed message');

    // 5. GET single prompt by ID
    const getSingleRes = await fetch(`${BASE_URL}/prompts/${createdId}`);
    assert(getSingleRes.status === 200, 'GET /api/prompts/:id returns 200');
    const singleData = await getSingleRes.json();
    assert(singleData.data.id === createdId, 'Fetched prompt has correct ID');
    assert(singleData.data.original_prompt === newPromptPayload.original_prompt, 'Returns original_prompt on GET');

    // 6. PUT update prompt
    const updateRes = await fetch(`${BASE_URL}/prompts/${createdId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated Automated Test Prompt', isFavorite: true }),
    });
    assert(updateRes.status === 200, 'PUT /api/prompts/:id returns 200');
    const updateData = await updateRes.json();
    assert(updateData.data.title === 'Updated Automated Test Prompt', 'Title updated');
    assert(updateData.data.isFavorite === true, 'Favorite state updated');

    // 7. PATCH favorite toggle
    const favRes = await fetch(`${BASE_URL}/prompts/${createdId}/favorite`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFavorite: false }),
    });
    assert(favRes.status === 200, 'PATCH /api/prompts/:id/favorite returns 200');
    const favData = await favRes.json();
    assert(favData.data.isFavorite === false, 'Favorite toggled to false');

    // 8. DELETE prompt
    const deleteRes = await fetch(`${BASE_URL}/prompts/${createdId}`, {
      method: 'DELETE',
    });
    assert(deleteRes.status === 200, 'DELETE /api/prompts/:id returns 200');

    // 9. Verify 404 after deletion
    const verifyDeleteRes = await fetch(`${BASE_URL}/prompts/${createdId}`);
    assert(verifyDeleteRes.status === 404, 'Deleted prompt returns 404');

    // 10. AI Status Check
    const aiStatusRes = await fetch(`${BASE_URL}/prompts/ai-status`);
    assert(aiStatusRes.status === 200, 'GET /api/prompts/ai-status returns 200');
    const aiStatusData = await aiStatusRes.json();
    assert(aiStatusData.success === true, 'AI status response success is true');
    assert(typeof aiStatusData.configured === 'boolean', 'aiStatus returns configured boolean');

    // 11. AI Analyze Input Validation (rejection on empty/too short prompt)
    const invalidAiRes = await fetch(`${BASE_URL}/prompts/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'hi' }),
    });
    assert(invalidAiRes.status === 400, 'POST /api/prompts/analyze with short prompt returns 400');
    const invalidAiData = await invalidAiRes.json();
    assert(invalidAiData.error === 'Validation failed', 'Returns validation error for short prompt');

    // 12. AI Analyze when API key is not configured handles gracefully
    const unconfiguredAiRes = await fetch(`${BASE_URL}/prompts/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Analyze this sample prompt for testing' }),
    });
    // When OPENAI_API_KEY is not set or empty, returns sanitized error message without leaking secrets
    const unconfiguredAiData = await unconfiguredAiRes.json();
    assert(unconfiguredAiData.success === false, 'Returns failure when AI key not configured');
    assert(typeof unconfiguredAiData.error === 'string', 'Returns clean sanitized error string');
    assert(!JSON.stringify(unconfiguredAiData).includes('sk-'), 'Does not leak API keys');

    console.log('🎉 All backend REST API & AI integration tests passed successfully!');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
