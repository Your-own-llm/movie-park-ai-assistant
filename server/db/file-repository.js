import fs from 'node:fs/promises';
import crypto from 'node:crypto';

export function createFileRepository(filename = process.env.DATABASE_PATH || './movie-park-inquiries.json') {
  async function readAll() {
    try {
      return JSON.parse(await fs.readFile(filename, 'utf8'));
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  async function writeAll(records) {
    await fs.writeFile(filename, JSON.stringify(records, null, 2), 'utf8');
  }

  return {
    available: true,

    async createInquiry(payload) {
      const records = await readAll();
      const timestamp = new Date().toISOString();
      const record = {
        id: crypto.randomUUID(),
        created_at: timestamp,
        updated_at: timestamp,
        status: payload.qualification?.status || 'REVIEW REQUIRED',
        score: payload.qualification?.score ?? null,
        assigned_to: null,
        contacted_at: null,
        payload
      };
      records.unshift(record);
      await writeAll(records);
      return { persisted: true, id: record.id, createdAt: timestamp };
    },

    async listInquiries() {
      return { persisted: true, inquiries: await readAll() };
    },

    async getInquiry(inquiryId) {
      const records = await readAll();
      return records.find(record => record.id === inquiryId) || null;
    },

    async updateInquiry(inquiryId, patch = {}) {
      const records = await readAll();
      const record = records.find(item => item.id === inquiryId);
      if (!record) return null;

      record.updated_at = new Date().toISOString();
      if (patch.status !== undefined) record.status = patch.status;
      if (patch.assignedTo !== undefined) record.assigned_to = patch.assignedTo;
      if (patch.contactedAt !== undefined) record.contacted_at = patch.contactedAt;

      await writeAll(records);
      return record;
    }
  };
}
