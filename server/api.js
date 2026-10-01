import { runWithProvider } from './agents/provider.js';

export async function handleProductionInquiry(request) {
  if (!request || request.method !== 'POST') {
    return { status: 405, body: { error: 'POST required' } };
  }
  try {
    const result = await runWithProvider(request.body || {}, {
      mode: process.env.AGENT_PROVIDER || 'local'
    });
    return { status: 200, body: { ok: true, ...result } };
  } catch (error) {
    return { status: 502, body: { ok: false, error: 'AI orchestration service unavailable', detail: error.message } };
  }
}
