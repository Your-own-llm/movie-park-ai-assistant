# Account Manager Handoff

This module turns a qualified production inquiry into a structured handoff and optionally sends notifications.

Providers are opt-in:
- local: returns the payload only
- webhook: generic HTTP webhook
- slack: Slack incoming webhook
- email: SMTP adapter can be added later without changing the handoff contract

No credentials are stored in the repository.

The handoff payload is deliberately limited to inquiry information. It does not claim to create a real CRM record unless a real CRM adapter is connected.
