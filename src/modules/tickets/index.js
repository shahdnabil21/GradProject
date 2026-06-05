import { Router } from 'express';
// import { isAuthenticated } from '../../middleware/authentication.middleware.js';
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
  getCategories,
} from './ticketsController.js';

const router = Router();

// ── 1. STATIC/EXACT PATHS FIRST ───────────────────────────────────
router.get('/categories', getCategories);
router.get('/my-tickets', getMyTickets);
router.post('/buy',  buyTicket);
router.post('/buy-smart', buySmartTicket);
router.post('/checkin', checkIn);
router.post('/checkout', checkOut);

// ── 2. DYNAMIC PARAMETER PATHS LAST ────────────────────────────────
router.get('/:id/qr', getTicketQr);
router.post('/:id/checkin', checkInById);   // Matches frontend scanner POST
router.post('/:id/checkout', checkOutById); // Matches frontend scanner POST
router.get('/:id', getTicketById);

export default router;