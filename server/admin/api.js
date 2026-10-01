import { inquiryStore } from '../db/store.js';
import { hasSession } from '../auth/session.js';

function authorized(token) {
  return hasSession(token);
}

export async function listInquiries(token) {
  if (!authorized(token)) return { status: 401, error: 'Unauthorized' };
  return inquiryStore.listInquiries();
}

export async function getInquiry(id, token) {
  if (!authorized(token)) return { status: 401, error: 'Unauthorized' };
  return inquiryStore.getInquiry(id);
}

export async function assignInquiry(id, assignedTo, token) {
  if (!authorized(token)) return { status: 401, error: 'Unauthorized' };
  return inquiryStore.updateInquiry(id, { assignedTo });
}

export async function markInquiryContacted(id, token) {
  if (!authorized(token)) return { status: 401, error: 'Unauthorized' };
  return inquiryStore.updateInquiry(id, {
    status: 'CONTACTED',
    contactedAt: new Date().toISOString()
  });
}
