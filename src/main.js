import '../config/config.service.js';
import bootstrap from './app.bootstrap.js';
import { connectDB } from './DB/connection.db.js';

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// 🚀 Boot the Express server immediately so Railway proxy connects successfully!
const server = bootstrap();

// 🔌 Connect to MongoDB in the background without blocking the port bind
connectDB().then(() => {
  console.log('📬 Background DB Routing Verified.');
}).catch(err => {
  console.error('💥 Background DB Connection Failed:', err.message);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});