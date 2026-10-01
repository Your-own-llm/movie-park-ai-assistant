import crypto from 'node:crypto';

export function createRepository(store = new Map()) {
  return {
    available: true,

    createInquiry(payload) {
      const inquiryId = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      const qualification = payload.qualification || {};

      const record = {
        id: inquiryId,
        created_at: timestamp,
        updated_at: timestamp,
        status: qualification.status || 'REVIEW REQUIRED',
        score: qualification.score ?? null,
        assigned_to: null,
        contacted_at: null,
        payload
      };

      store.set(inquiryId, record);
      return { persisted: true, id: inquiryId, createdAt: timestamp };
    },

    listInquiries() {
      return {
        persisted: true,
        inquiries: [...store.values()].sort((a, b) =>
          b.created_at.localeCompare(a.created_at)
        )
      };
    },

    getInquiry(inquiryId) {
      return store.get(inquiryId) || null;
    },

    updateInquiry(inquiryId, patch = {}) {
      const record = store.get(inquiryId);
      if (!record) return null;

      record.updated_at = new Date().toISOString();
      if (patch.status !== undefined) record.status = patch.status;
      if (patch.assignedTo !== undefined) record.assigned_to = patch.assignedTo;
      if (patch.contactedAt !== undefined) record.contacted_at = patch.contactedAt;

      store.set(inquiryId, record);
      return record;
    }
  };
}
