import helmet from 'helmet'
import  {NODE_ENV, port}  from '../config/config.service.js'
import { authRouter, userRouter, stationRouter, lineRouter, lineStationRouter, ticketRouter, paymentRouter, mapRouter, dashboardRouter, subscriptionRouter, walletRouter} from './modules/index.js';
// import errorHandler from './utils/errorHandeler.js';
import express from 'express'

import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { setIO } from './utils/socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




function bootstrap() {

    const app = express()

    app.use(helmet());
    //convert buffer data
    app.use(express.json())
      app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(cors({
  origin: '*'
}));

  // ── Serve uploaded files as static ───────────────────────────────────────
    app.use("/uploads", express.static("uploads"))
    //application routing
    app.use('/metro-tickets/auth', authRouter)   // ← signup, login, forgotPassword, resetPassword
    app.use('/metro-tickets/user', userRouter)   // ← getMe, updateMe, 
    app.use('/metro-tickets/dashboard', dashboardRouter)
    app.use('/metro-tickets/subscription', subscriptionRouter)
    app.use('/metro-tickets/wallet',   walletRouter)
    app.use('/metro-tickets/station', stationRouter)   
    app.use('/metro-tickets/line', lineRouter)   
    app.use('/metro-tickets/line-station', lineStationRouter)
    app.use('/metro-tickets/line/:lineId/stations', lineStationRouter) 
    app.use('/metro-tickets/ticket', ticketRouter) 
    app.use('/metro-tickets/payment', paymentRouter)
    app.use('/metro-tickets/map', mapRouter)
    
    // Staff QR scanner page
    app.get('/metro-tickets/scanner', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'scanner.html'));
    });

    //invalid routing
    app.use('{/*dummy}', (req, res) => {
        return res.status(404).json({ message: "Invalid application routing" })
    })

    //===============ERROR-HANDLING==================

// ——————— use statusCode from AppError  ————————
app.use((error, req, res, next) => {
  const statusCode = error.statusCode ?? 500;
  const status = error.status ?? 'error';
  
  return res.status(statusCode).json({
    status,
    message: error.message,
    stack: NODE_ENV == "development" ? error.stack : undefined
  });
});


   const httpServer = createServer(app);

   const io = new Server(httpServer, {
     cors: { origin: 'http://localhost:5173' },
   });

   setIO(io);

   io.on('connection', (socket) => {
     socket.on('join:ticket', (ticketId) => {
       socket.join(ticketId);
       console.log(`Client joined ticket room: ${ticketId}`);
     });
   });

   httpServer.listen(port, () => console.log(`🚀 App running on port ${port}...`));
   return httpServer;
}
export default bootstrap