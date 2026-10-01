export async function searchAnythingLLM(query, options = {}) {
  const baseUrl = options.baseUrl || process.env.ANYTHINGLLM_URL;
  const workspaceSlug = options.workspaceSlug || process.env.ANYTHINGLLM_WORKSPACE;

  if (!baseUrl || !workspaceSlug) {
    return {
      provider: 'anythingllm',
      connected: false,
      results: [],
      reason: 'ANYTHINGLLM_URL or ANYTHINGLLM_WORKSPACE is not configured'
    };
  }

  const apiKey = options.apiKey || process.env.ANYTHINGLLM_API_KEY;
  const response = await fetch(
    baseUrl.replace(/\/$/, '') + '/api/v1/workspace/' + encodeURIComponent(workspaceSlug) + '/chat',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(apiKey ? { Authorization: 'Bearer ' + apiKey } : {})
      },
      body: JSON.stringify({
        message: query,
        mode: 'query'
      })
    }
  );

  if (!response.ok) {
    throw new Error('AnythingLLM returned HTTP ' + response.status);
  }

  const data = await response.json();
  return {
    provider: 'anythingllm',
    connected: true,
    results: data
  };
}
