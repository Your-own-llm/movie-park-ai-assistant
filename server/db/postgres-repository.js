import crypto from 'node:crypto';

export function createPostgresRepository(connectionString = process.env.DATABASE_URL) {
  let poolPromise;

  async function pool() {
    if (!connectionString) throw new Error('DATABASE_URL is not configured');
    if (!poolPromise) {
      poolPromise = import('pg').then(({ Pool }) => new Pool({
        connectionString,
        ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
      }));
    }
    return poolPromise;
  }

  async function query(sql, values = []) {
    const p = await pool();
    return p.query(sql, values);
  }

  return {
    available: Boolean(connectionString),

    async init() {
      await query(`
        CREATE TABLE IF NOT EXISTS inquiries (
          id TEXT PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL,
          status TEXT NOT NULL,
          score INTEGER,
          assigned_to TEXT,
          contacted_at TIMESTAMPTZ,
          payload_json JSONB NOT NULL
        )
      `);
      await query('CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON inquiries(created_at DESC)');
      await query('CREATE INDEX IF NOT EXISTS inquiries_status_idx ON inquiries(status)');
    },

    async createInquiry(payload) {
      const id = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      const result = await query(
        `INSERT INTO inquiries
          (id, created_at, updated_at, status, score, assigned_to, contacted_at, payload_json)
         VALUES ($1,$2,$2,$3,$4,NULL,NULL,$5)
         RETURNING id, created_at AS "createdAt"`,
        [id, timestamp, payload.qualification?.status || 'REVIEW REQUIRED', payload.qualification?.score ?? null, payload]
      );
      return { persisted: true, ...result.rows[0] };
    },

    async listInquiries() {
      const result = await query('SELECT * FROM inquiries ORDER BY created_at DESC');
      return { persisted: true, inquiries: result.rows };
    },

    async getInquiry(inquiryId) {
      const result = await query('SELECT * FROM inquiries WHERE id=$1', [inquiryId]);
      return result.rows[0] || null;
    },

    async updateInquiry(inquiryId, patch = {}) {
      const result = await query(
        `UPDATE inquiries
         SET updated_at=NOW(),
             status=COALESCE($2,status),
             assigned_to=COALESCE($3,assigned_to),
             contacted_at=COALESCE($4,contacted_at)
         WHERE id=$1
         RETURNING *`,
        [inquiryId, patch.status ?? null, patch.assignedTo ?? null, patch.contactedAt ?? null]
      );
      return result.rows[0] || null;
    }
  };
}
