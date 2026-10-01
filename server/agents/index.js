export { AGENT_NAMES, EMPTY_BRIEF, normalizeBrief, qualification, buildHandoff } from './schema.js';

// Future provider adapter:
// import { runCrewPipeline } from './crewai-adapter.js';
//
// The UI can call a stable pipeline contract without knowing which
// orchestration provider is underneath it.
export async function runProductionPipeline(input) {
  const brief = normalizeBrief(input);
  const result = qualification(brief);
  return buildHandoff(brief, result);
}
