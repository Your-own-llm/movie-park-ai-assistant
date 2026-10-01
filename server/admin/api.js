import { inquiryStore } from '../db/store.js';

export async function listInquiries() {
  return inquiryStore.listInquiries();
}

export async function getInquiry(id) {
  return inquiryStore.getInquiry(id);
}

export async function assignInquiry(id, assignedTo) {
  return inquiryStore.updateInquiry(id, { assignedTo });
}

export async function markInquiryContacted(id) {
  return inquiryStore.updateInquiry(id, {
    status: 'CONTACTED',
    contactedAt: new Date().toISOString()
  });
}
