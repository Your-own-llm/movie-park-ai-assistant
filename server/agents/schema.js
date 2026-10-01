// Phase 3 agent contracts.
// Provider-neutral: no API keys and no external network calls.

export const AGENT_NAMES = Object.freeze([
  'intake',
  'briefAnalyst',
  'qualification',
  'portfolioMatcher',
  'handoff'
]);

export const EMPTY_BRIEF = Object.freeze({
  client: '',
  project: '',
  location: '',
  deliverables: '',
  deadline: '',
  budget: '',
  references: '',
  requirements: ''
});

export function normalizeBrief(input = {}) {
  return {
    client: String(input.client || '').trim(),
    project: String(input.project || input.projectType || '').trim(),
    location: String(input.location || '').trim(),
    deliverables: String(input.deliverables || '').trim(),
    deadline: String(input.deadline || '').trim(),
    budget: String(input.budget || '').trim(),
    references: String(input.references || '').trim(),
    requirements: String(input.requirements || '').trim()
  };
}

export function qualification(brief) {
  const b = normalizeBrief(brief);
  const fields = Object.keys(EMPTY_BRIEF);
  const complete = fields.filter(key => b[key]);
  const score = Math.round((complete.length / fields.length) * 100);
  const missing = fields.filter(key => !b[key]);
  return {
    score,
    status: score >= 75 ? 'QUALIFIED' : score >= 55 ? 'REVIEW REQUIRED' : 'NEEDS DETAILS',
    completeFields: complete,
    missingFields: missing
  };
}

export function buildHandoff(brief, qualificationResult) {
  const b = normalizeBrief(brief);
  return {
    type: 'production_inquiry',
    source: 'movie-park-ai-assistant-demo',
    brief: b,
    qualification: qualificationResult,
    nextStep: qualificationResult.status === 'QUALIFIED'
      ? 'account_manager_review'
      : 'collect_missing_information'
  };
}
