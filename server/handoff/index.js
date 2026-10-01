import { buildAccountManagerMessage } from './payload.js';
import { sendWebhook } from './webhook.js';
import { sendSlack } from './slack.js';

export { buildAccountManagerMessage };

export async function handoffInquiry(inquiry, options = {}) {
  const payload = buildAccountManagerMessage(inquiry);
  const notifications = [];

  if (options.webhook || process.env.HANDOFF_WEBHOOK_URL) {
    notifications.push(await sendWebhook(payload, options));
  }

  if (options.slack || process.env.SLACK_WEBHOOK_URL) {
    notifications.push(await sendSlack(payload, options));
  }

  return {
    payload,
    notifications,
    delivered: notifications.some(item => item.sent)
  };
}
