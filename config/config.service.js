 import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

export const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = resolve(__dirname, `.env.${NODE_ENV}`);

dotenv.config({ path: envFile });
export const port = process.env.PORT || 3000;
console.log(`⚙️  Config loaded: .env.${NODE_ENV}`);

