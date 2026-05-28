

import { Router } from 'express';
import { isAuthenticated } from "../../middleware/authentication.middleware.js";

// import { protect } from '../auth/auth.controller.js';
import {
  buyTicket,
  buySmartTicket,
  getMyTickets,
  checkIn,
  checkOut,
  checkInById,
  checkOutById,
  getTicketById,
  getTicketQr,
} from './ticketsController.js';



const router = Router();

router.use(isAuthenticated);
// Param routes — must be before /:id to avoid ambiguity
router.get('/:id/qr', getTicketQr);
router.post('/:id/checkin', checkInById);
router.post('/:id/checkout', checkOutById);

// GET /api/tickets/:id
router.get('/:id', getTicketById);

// Body: { userId, categoryId }
router.post('/buy', buyTicket);

// Body: { userId, fromStationId, toStationId }
router.post('/buy-smart', buySmartTicket);

router.get('/my-tickets', getMyTickets);

// Body: { ticketId, stationId }
router.post('/checkin', checkIn);

// Body: { ticketId, stationId }
router.post('/checkout', checkOut);

export default router;