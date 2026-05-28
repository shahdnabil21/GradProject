
import {
  buyTicketService,
  buySmartTicketService,
  getMyTicketsService,
  checkInService,
  checkOutService,
  checkInByIdService,
  checkOutByIdService,
  getTicketQrService,
} from './ticketsService.js';

// ─────────────────────────────────────────────────────────────────────────────
//  BUY TICKET (manual)
// ─────────────────────────────────────────────────────────────────────────────
export const buyTicket = async (req, res) => {
  try {
    // TODO: switch to req.user._id once auth middleware is active
    const { userId, categoryId } = req.body;

    if (!userId || !categoryId) {
      return res.status(400).json({ message: 'userId and categoryId are required' });
    }

    const { ticket } = await buyTicketService(userId, categoryId);

    return res.status(201).json({
      message: 'Ticket created — awaiting payment',
      ticket,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  BUY SMART TICKET (system picks category)
// ─────────────────────────────────────────────────────────────────────────────
export const buySmartTicket = async (req, res) => {
  try {
    // TODO: switch to req.user._id once auth middleware is active
    const { userId, fromStationId, toStationId } = req.body;

    if (!userId || !fromStationId || !toStationId) {
      return res.status(400).json({ message: 'userId, fromStationId and toStationId are required' });
    }

    const result = await buySmartTicketService(userId, fromStationId, toStationId);

    return res.status(201).json({
      message: 'Smart ticket created — awaiting payment',
      ...result,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET MY TICKETS
// ─────────────────────────────────────────────────────────────────────────────
export const getMyTickets = async (req, res) => {
  try {
    // TODO: switch to req.user._id once auth middleware is active
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const tickets = await getMyTicketsService(userId);

    return res.status(200).json({ tickets });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  CHECK IN
// ─────────────────────────────────────────────────────────────────────────────
export const checkIn = async (req, res) => {
  try {
    const { ticketId, stationId } = req.body;

    if (!ticketId || !stationId) {
      return res.status(400).json({ message: 'ticketId and stationId are required' });
    }

    const ticket = await checkInService(ticketId, stationId);

    return res.status(200).json({
      message: 'Checked in successfully',
      ticket,
    });

  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  CHECK OUT
// ─────────────────────────────────────────────────────────────────────────────
export const checkOut = async (req, res) => {
  try {
    const { ticketId, stationId } = req.body;

    if (!ticketId || !stationId) {
      return res.status(400).json({ message: 'ticketId and stationId are required' });
    }

    const result = await checkOutService(ticketId, stationId);

    return res.status(200).json({
      message: 'Checked out successfully',
      ...result,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
      ...(err.stopsRequired && {
        stopsRequired: err.stopsRequired,
        maxAllowed: err.maxAllowed,
        suggestedCategory: err.suggestedCategory,
      }),
    });
  }
};


export const getTicketById = async (req, res) => {
  try {
    console.log("Searching ticket:", req.params.id);

    const ticket = await Ticket.findById(req.params.id)
      .populate('category')
      .populate('checkInStation')
      .populate('checkOutStation');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    return res.status(200).json({ ticket });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  CHECK IN BY URL PARAM  POST /ticket/:id/checkin
// ─────────────────────────────────────────────────────────────────────────────
export const checkInById = async (req, res) => {
  try {
    const { stationId } = req.body;
    if (!stationId) return res.status(400).json({ message: 'stationId is required' });
    const ticket = await checkInByIdService(req.params.id, stationId);
    return res.status(200).json({ message: 'Checked in successfully', ticket });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  CHECK OUT BY URL PARAM  POST /ticket/:id/checkout
// ─────────────────────────────────────────────────────────────────────────────
export const checkOutById = async (req, res) => {
  try {
    const { stationId } = req.body;
    if (!stationId) return res.status(400).json({ message: 'stationId is required' });
    const result = await checkOutByIdService(req.params.id, stationId);
    return res.status(200).json({ message: 'Checked out successfully', ...result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
      ...(err.stopsRequired && {
        stopsRequired: err.stopsRequired,
        maxAllowed: err.maxAllowed,
        suggestedCategory: err.suggestedCategory,
      }),
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET QR CODE FOR A TICKET
// ─────────────────────────────────────────────────────────────────────────────
export const getTicketQr = async (req, res) => {
  try {
    const result = await getTicketQrService(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};