export async function runCrewPipeline(input, options = {}) {
  const baseUrl = options.baseUrl || process.env.CREWAI_SERVICE_URL;
  if (!baseUrl) return { connected: false, reason: 'CREWAI_SERVICE_URL is not configured' };

  const response = await fetch(baseUrl.replace(/\/$/, '') + '/run-production-pipeline', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ input })
  });

  if (!response.ok) throw new Error('CrewAI service returned HTTP ' + response.status);

  return { connected: true, result: await response.json() };
}
