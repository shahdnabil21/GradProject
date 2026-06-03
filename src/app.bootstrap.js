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

    app.use(helmet({
      contentSecurityPolicy: false
    }));
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

// ——————— Global Error Handling Middleware ————————
app.use((error, req, res, next) => {
  let statusCode = error.statusCode ?? 500;
  let status = error.status ?? 'error';
  let message = error.message;

  // Gracefully handle MongoDB duplicate key errors (e.g., duplicate email)
  if (error.code === 11000) {
    statusCode = 409;
    status = 'fail';
    const field = error.keyValue ? Object.keys(error.keyValue)[0] : 'field';
    message = `An account with this ${field} already exists.`;
  }

  // Gracefully handle JWT verification errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    status = 'fail';
    message = 'Invalid authentication token. Please log in again.';
  }
  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    status = 'fail';
    message = 'Your session has expired. Please log in again.';
  }
  
  return res.status(statusCode).json({
    status,
    message,
    stack: NODE_ENV === "development" ? error.stack : undefined
  });
});


    return app;
};
export default bootstrap