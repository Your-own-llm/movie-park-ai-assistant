export { matchPortfolio } from './matcher.js';

export async function searchPortfolio(query, options = {}) {
  const mode = options.mode || process.env.PORTFOLIO_PROVIDER || 'local';

  if (mode === 'anythingllm') {
    // The HTTP adapter is intentionally isolated so the local matcher remains
    // available when AnythingLLM is not configured.
    const { searchAnythingLLM } = await import('./anythingllm.js');
    return searchAnythingLLM(query, options);
  }

  return {
    provider: 'local',
    results: (await import('./matcher.js')).matchPortfolio(query, options.limit || 3)
  };
}
