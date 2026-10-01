export { firecrawlResearch, isResearchSourceAllowed } from './firecrawl.js';

export async function researchPublicSource(url, options = {}) {
  return firecrawlResearch(url, options);
}
