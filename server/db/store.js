import { createFileRepository } from './file-repository.js';
import { createPostgresRepository } from './postgres-repository.js';

const postgres = createPostgresRepository();

export const inquiryStore = postgres.available
  ? postgres
  : createFileRepository();

export async function initializeStore() {
  if (postgres.available) await postgres.init();
}
