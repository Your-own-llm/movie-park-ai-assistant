export async function runCrewPipeline(input, options = {}) {
  const baseUrl =
    options.baseUrl ||
    process.env.CREWAI_INTERNAL_URL ||
    process.env.CREWAI_SERVICE_URL;

  if (!baseUrl) {
    return {
      connected: false,
      reason: 'No CrewAI service URL is configured'
    };
  }

  const endpoint = new URL('/run-production-pipeline', baseUrl);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ input })
  });

  if (!response.ok) {
    throw new Error('CrewAI service returned HTTP ' + response.status);
  }

  return { connected: true, result: await response.json() };
}
