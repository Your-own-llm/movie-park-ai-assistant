export async function sendWebhook(payload, options = {}) {
  const webhookUrl = options.webhookUrl || process.env.HANDOFF_WEBHOOK_URL;

  if (!webhookUrl) {
    return { sent: false, provider: 'webhook', reason: 'HANDOFF_WEBHOOK_URL is not configured' };
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Handoff webhook returned HTTP ' + response.status);
  }

  return { sent: true, provider: 'webhook' };
}
