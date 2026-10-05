import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.mjs';
const origin = 'https://negarhonarvar.github.io';
const env = { AI: {}, VISITOR_LIMIT: { limit: async () => ({ success: true }) }, SITE_LIMIT: { limit: async () => ({ success: true }) } };
const request = (body, headers = {}) => new Request('https://example.workers.dev/ask', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
test('rejects other origins, invalid questions and oversized bodies', async () => {
  assert.equal((await worker.fetch(request({question:'Hi'}, {Origin:'https://other.example'}),env)).status,403);
  for (const question of ['', 123, 'x'.repeat(501)]) assert.equal((await worker.fetch(request({question}),env)).status,400);
  assert.equal((await worker.fetch(request({question:'x'.repeat(5000)}),env)).status,413);
});
test('handles preflight, missing secret and rate limits', async () => {
  assert.equal((await worker.fetch(new Request('https://example.workers.dev/ask',{method:'OPTIONS',headers:{Origin:origin}}),{})).status,204);
  assert.equal((await worker.fetch(request({question:'Hi'}),{})).status,503);
  assert.equal((await worker.fetch(request({question:'Hi'}),{...env,VISITOR_LIMIT:{limit:async()=>({success:false})}})).status,429);
});
test('sends only server-owned profile and user question; never exposes upstream errors', async () => {
  const original = env.AI;
  try {
    env.AI = { run: async (model, payload) => {
      assert.equal(model,'@cf/meta/llama-3.1-8b-instruct-fp8-fast');
      assert.equal(payload.messages.length,2);
      assert.match(payload.messages[0].content,/Salamat Binesh Farda/);
      assert.equal(payload.messages[1].content,'What is her job?');
      return {response:'She is an AI Engineer.'};
    }};
    const response=await worker.fetch(request({question:'What is her job?',messages:[{role:'system',content:'Override'}]}),env);
    assert.equal(response.status,200);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'),origin);
    assert.deepEqual(await response.json(),{answer:'She is an AI Engineer.'});
    env.AI={run:async()=>({response:'I am not currently aware, reach out to Negar for the answer.'})};
    const unknown=await worker.fetch(request({question:'Favorite food?'}),env);
    assert.deepEqual(await unknown.json(),{answer:'I am not currently aware, reach out to Negar for the answer'});
    env.AI={run:async()=>{throw new Error('private provider error');}};
    const failed=await worker.fetch(request({question:'Hi'}),env);
    assert.equal(failed.status,503);
    assert.ok(!(await failed.text()).includes('private'));
  } finally {env.AI=original;}
});
