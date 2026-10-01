export { AGENT_NAMES, EMPTY_BRIEF, normalizeBrief, qualification, buildHandoff } from './schema.js';
import { searchPortfolio } from '../portfolio/index.js';
import { runLLM } from '../llm/index.js';
import { researchPublicSource } from '../research/index.js';

export async function runProductionPipeline(input) {
  let enriched = input || {};
  let llm = null;
  let research = null;

  if (input?.sourceUrl) {
    try { research = await researchPublicSource(input.sourceUrl); }
    catch (error) { console.warn('Public research unavailable:', error.message); }
  }

  if (research?.data) enriched = { ...enriched, publicResearch: research.data };

  if (process.env.LLM_PROVIDER === 'openai') {
    try {
      llm = await runLLM({ ...enriched, publicResearch: research?.data || null });
      if (llm) enriched = { ...enriched, ...llm };
    } catch (error) {
      console.warn('LLM provider unavailable; using deterministic pipeline:', error.message);
    }
  }

  const brief = normalizeBrief(enriched);
  const result = qualification(brief);
  const query = [brief.project, brief.deliverables, brief.requirements, brief.location]
    .filter(Boolean).join(' ');

  let portfolio = { provider: 'local', results: [] };
  if (query) {
    try {
      portfolio = await searchPortfolio(query, { limit: 3 });
    } catch (error) {
      console.warn('Portfolio provider unavailable; using local matcher:', error.message);
      portfolio = await searchPortfolio(query, { limit: 3, mode: 'local' });
    }
  }

  return {
    ...buildHandoff(brief, result),
    portfolio,
    assistantMessage: llm?.assistant_message || null,
    llmProvider: llm ? process.env.LLM_PROVIDER : 'local',
    publicResearch: research ? { provider: research.provider, connected: research.connected, accepted: research.accepted, source: research.source } : null
  };
}
