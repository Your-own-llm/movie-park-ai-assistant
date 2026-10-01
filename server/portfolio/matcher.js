import sampleProjects from '../../knowledge/portfolio/sample-projects.json' with { type: 'json' };

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'show', 'me', 'some', 'have', 'you',
  'any', 'your', 'work', 'projects', 'project', 'can', 'do'
]);

function terms(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

function scoreProject(project, queryTerms) {
  const searchable = [
    project.title,
    project.category,
    project.location,
    project.description,
    ...(project.services || []),
    ...(project.keywords || [])
  ].join(' ').toLowerCase();

  const matches = queryTerms.filter(term => searchable.includes(term));
  return {
    project,
    score: matches.length,
    matchedTerms: [...new Set(matches)]
  };
}

export function matchPortfolio(query, limit = 3) {
  const queryTerms = terms(query);
  return sampleProjects
    .map(project => scoreProject(project, queryTerms))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
