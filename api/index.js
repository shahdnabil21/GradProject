import mongoose from 'mongoose';
import bootstrap from '../src/app.bootstrap.js';
import { connectDB } from '../src/DB/connection.db.js';

let app;

export default async (req, res) => {
  // Ensure MongoDB is connected before processing request
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  if (!app) {
    app = bootstrap();
  }

  // Handle routing via Express
  return app(req, res);
};
