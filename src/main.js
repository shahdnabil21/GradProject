import '../config/config.service.js';


import  bootstrap  from './app.bootstrap.js';
import {connectDB} from './DB/connection.db.js';

// 🛡️ Catch synchronous crashes (from your colleague's server.js)
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// 🔌 Connect to MongoDB then start the Express server
await connectDB();
const server = bootstrap();

// 🛡️ Catch async crashes (from your colleague's server.js)
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});