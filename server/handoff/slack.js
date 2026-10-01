export async function sendSlack(payload, options = {}) {
  const webhookUrl = options.webhookUrl || process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return { sent: false, provider: 'slack', reason: 'SLACK_WEBHOOK_URL is not configured' };
  }

  const text = [
    '*New Movie Park production inquiry*',
    '',
    'Client: ' + payload.client,
    'Project: ' + payload.project,
    'Location: ' + payload.location,
    'Deliverables: ' + payload.deliverables,
    'Deadline: ' + payload.deadline,
    'Budget: ' + payload.budget,
    'Qualification: ' + payload.status + ' (' + payload.score + '/100)',
    'Next step: ' + payload.nextStep
  ].join('\n');

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    throw new Error('Slack webhook returned HTTP ' + response.status);
  }

  return { sent: true, provider: 'slack' };
}
