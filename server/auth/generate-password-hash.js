import { hashPassword } from './crypto.js';

const password = process.argv[2];
if (!password) {
  console.error('Usage: node server/auth/generate-password-hash.js "your-password"');
  process.exit(1);
}
console.log(hashPassword(password));
