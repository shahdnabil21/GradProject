import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

export const NODE_ENV = process.env.NODE_ENV || 'development';

// ONLY try to load local .env files if we are running locally in development!
if (NODE_ENV === 'development') {
  const envFile = resolve(__dirname, `.env.${NODE_ENV}`);
  dotenv.config({ path: envFile });
  console.log(`⚙️ Local Config loaded: .env.${NODE_ENV}`);
} else {
  // On Railway/Production, variables are injected automatically by the platform.
  // Running dotenv.config() without a path reads standard environment mappings.
  dotenv.config();
  console.log(`⚙️ Production Config active via platform environment variables`);
}

// Ensure it grabs the PORT Railway gives it, defaulting to 3000
export const port = process.env.PORT || 3000;