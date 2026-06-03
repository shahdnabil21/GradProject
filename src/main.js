import '../config/config.service.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setIO } from './utils/socket.js';
import { port } from '../config/config.service.js';
import bootstrap from './app.bootstrap.js';
import { connectDB } from './DB/connection.db.js';

// 🛡️ Catch synchronous crashes (from your colleague's server.js)
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// 🔌 Connect to MongoDB then start the Express server
await connectDB();
const app = bootstrap();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});
setIO(io);

io.on('connection', (socket) => {
  socket.on('join:ticket', (ticketId) => {
    socket.join(ticketId);
    console.log(`Client joined ticket room: ${ticketId}`);
  });
});

const server = httpServer.listen(port, () => console.log(`🚀 App running on port ${port}...`));

// 🛡️ Catch async crashes (from your colleague's server.js)
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});




