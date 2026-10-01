export { AGENT_NAMES, EMPTY_BRIEF, normalizeBrief, qualification, buildHandoff } from './schema.js';
import { searchPortfolio } from '../portfolio/index.js';

export async function runProductionPipeline(input) {
  const brief = normalizeBrief(input);
  const result = qualification(brief);
  const query = [brief.project, brief.deliverables, brief.requirements, brief.location]
    .filter(Boolean).join(' ');

  const portfolio = query
    ? await searchPortfolio(query, { limit: 3 })
    : { provider: 'local', results: [] };

  return { ...buildHandoff(brief, result), portfolio };
}
