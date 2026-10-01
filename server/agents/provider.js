import { runProductionPipeline } from './index.js';
import { runCrewPipeline } from './crewai-adapter.js';
import { normalizeBrief, qualification, buildHandoff } from './schema.js';

function validateCrewResult(result) {
  const handoff = result?.handoff;
  if (!handoff?.brief) return null;
  const brief = normalizeBrief(handoff.brief);
  const q = qualification(brief);
  return {
    ...buildHandoff(brief, q),
    portfolio: result.portfolio || { provider: 'local', results: [] },
    assistantMessage: result.assistantMessage || null,
    llmProvider: 'crewai'
  };
}

export async function runWithProvider(input, options = {}) {
  const mode = options.mode || process.env.AGENT_PROVIDER || 'local';
  if (mode === 'crewai') {
    try {
      const result = await runCrewPipeline(input, options);
      if (result.connected) {
        const validated = validateCrewResult(result.result);
        if (validated) return validated;
      }
    } catch (error) {
      console.warn('CrewAI unavailable; using local pipeline:', error.message);
    }
  }
  return runProductionPipeline(input);
}
