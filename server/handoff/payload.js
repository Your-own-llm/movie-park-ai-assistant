export function buildAccountManagerMessage(inquiry = {}) {
  const brief = inquiry.brief || {};
  const qualification = inquiry.qualification || {};

  return {
    type: 'production_inquiry_handoff',
    source: 'movie-park-ai-assistant-demo',
    status: qualification.status || 'REVIEW REQUIRED',
    score: qualification.score ?? null,
    client: brief.client || 'Not provided',
    project: brief.project || 'Not provided',
    location: brief.location || 'Not provided',
    deliverables: brief.deliverables || 'Not provided',
    deadline: brief.deadline || 'Not provided',
    budget: brief.budget || 'Not provided',
    references: brief.references || 'Not provided',
    requirements: brief.requirements || 'Not provided',
    nextStep: inquiry.nextStep || 'account_manager_review'
  };
}
