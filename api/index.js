import bootstrap from '../src/app.bootstrap.js';
import { connectDB } from '../src/DB/connection.db.js';

// Pre-connect database globally for the Vercel function lifecycle
await connectDB();

const app = bootstrap();

export default app;
