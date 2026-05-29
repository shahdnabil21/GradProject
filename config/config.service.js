import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

export const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV === 'development') {
  const envFile = resolve(__dirname, `.env.${NODE_ENV}`);
  dotenv.config({ path: envFile });
  console.log(`⚙️ Local Config loaded: .env.${NODE_ENV}`);
} else {
  // On Railway production, read directly from platform variables
  dotenv.config();
  console.log(`⚙️ Production Config active`);
}

// CRUCIAL: Force Railway's dynamic process port, or default to 8080
export const port = process.env.PORT || 8080;