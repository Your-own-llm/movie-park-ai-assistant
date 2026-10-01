const ALLOWED_HOSTS = [
  'movieparkpro.com',
  'www.movieparkpro.com'
];

function isAllowedUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ALLOWED_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

export async function firecrawlResearch(url, options = {}) {
  if (!isAllowedUrl(url)) {
    return {
      provider: 'firecrawl',
      connected: false,
      accepted: false,
      reason: 'URL is outside the configured public-source allowlist'
    };
  }

  const apiKey = options.apiKey || process.env.FIRECRAWL_API_KEY;
  const baseUrl = (options.baseUrl || process.env.FIRECRAWL_URL || 'https://api.firecrawl.dev').replace(/\/$/, '');

  if (!apiKey) {
    return {
      provider: 'firecrawl',
      connected: false,
      accepted: true,
      reason: 'FIRECRAWL_API_KEY is not configured',
      source: url
    };
  }

  const response = await fetch(baseUrl + '/v1/scrape', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      onlyMainContent: true
    })
  });

  if (!response.ok) {
    throw new Error('Firecrawl returned HTTP ' + response.status);
  }

  const data = await response.json();
  return {
    provider: 'firecrawl',
    connected: true,
    accepted: true,
    source: url,
    data
  };
}

export function isResearchSourceAllowed(url) {
  return isAllowedUrl(url);
}
