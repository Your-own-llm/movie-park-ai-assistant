import { runWithProvider } from './agents/provider.js';
import { handoffInquiry } from './handoff/index.js';

export async function handleProductionInquiry(request) {
  if (!request || request.method !== 'POST') {
    return { status: 405, body: { error: 'POST required' } };
  }
  try {
    const result = await runWithProvider(request.body || {}, {
      mode: process.env.AGENT_PROVIDER || 'local'
    });

    const handoff = await handoffInquiry(result, {
      webhook: Boolean(process.env.HANDOFF_WEBHOOK_URL),
      slack: Boolean(process.env.SLACK_WEBHOOK_URL)
    });

    return {
      status: 200,
      body: { ok: true, ...result, handoff }
    };
  } catch (error) {
    return {
      status: 502,
      body: { ok: false, error: 'Production inquiry processing failed', detail: error.message }
    };
  }
}
