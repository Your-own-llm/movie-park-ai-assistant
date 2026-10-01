import { runProductionPipeline } from './index.js';
import { runCrewPipeline } from './crewai-adapter.js';

export async function runWithProvider(input, options = {}) {
  const mode = options.mode || process.env.AGENT_PROVIDER || 'local';
  if (mode === 'crewai') {
    const result = await runCrewPipeline(input, options);
    if (result.connected) return result.result;
  }
  return runProductionPipeline(input);
}
