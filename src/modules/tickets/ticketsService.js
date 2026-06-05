
import { Category, Ticket, Station } from '../../DB/model/index.js';
import { deductFromWalletService } from "../wallet/wallet.service.js";
import { getGraph } from '../../utils/graphCashe.js';
import { findShortestPath } from '../../utils/shortTestPath.js';
import QRCode from 'qrcode';
import { getIO } from '../../utils/socket.js';

// ─────────────────────────────────────────────────────────────────────────────
//  BUY TICKET (manual — user picks category)
// ─────────────────────────────────────────────────────────────────────────────
export const buyTicketService = async (userId, categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }
// Deduct ticket price from wallet
await deductFromWalletService(
  userId,
  category.price
);

// Create paid ticket
const ticket = await Ticket.create({
  user: userId,
  category: categoryId,
  status: 'active',
});
  await ticket.populate('category');
  return { ticket };
};

// ─────────────────────────────────────────────────────────────────────────────
//  BUY SMART TICKET (system picks cheapest category based on route)
// ─────────────────────────────────────────────────────────────────────────────
export const buySmartTicketService = async (userId, fromStationId, toStationId) => {
  const [fromStation, toStation] = await Promise.all([
    Station.findById(fromStationId),
    Station.findById(toStationId),
  ]);

  if (!fromStation) {
    const error = new Error('Origin station not found');
    error.statusCode = 404;
    throw error;
  }

  if (!toStation) {
    const error = new Error('Destination station not found');
    error.statusCode = 404;
    throw error;
  }

  // Run shortest path to count stops
  const graph = await getGraph();
  const result = findShortestPath(graph, fromStationId.toString(), toStationId.toString());

  if (!result.found) {
    const error = new Error('No route found between these stations');
    error.statusCode = 400;
    throw error;
  }

  const { stops, path, transfers } = result;

  // Find cheapest category that covers the stops
  const category = await Category.findOne({ numberOfStations: { $gte: stops } })
    .sort({ numberOfStations: 1 });

  if (!category) {
    const error = new Error('No ticket category available for this journey');
    error.statusCode = 400;
    throw error;
  }

// Create pending ticket — payment endpoint handles wallet/card deduction
const ticket = await Ticket.create({
  user: userId,
  category: category._id,
  status: 'pending_payment',
});

  await ticket.populate('category');

  // Hydrate station names for the path
  const stationDocs = await Station.find({ _id: { $in: path } });
  const stationMap = Object.fromEntries(stationDocs.map(s => [s._id.toString(), s]));

  const pathDetails = path.map(id => ({
    id,
    name: stationMap[id]?.name || id,
    nameAr: stationMap[id]?.nameAr || id,
    isTransfer: transfers.includes(id),
  }));

  return {
    ticket,
    journey: {
      stops,
      path: pathDetails,
      transfers: transfers.map(id => ({
        id,
        name: stationMap[id]?.name || id,
        nameAr: stationMap[id]?.nameAr || id,
      })),
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET MY TICKETS
// ─────────────────────────────────────────────────────────────────────────────
export const getMyTicketsService = async (userId) => {
  const tickets = await Ticket.find({ user: userId })
    .populate('category')
    .populate('checkInStation')
    .populate('checkOutStation')
    .sort({ _id: -1 });

  return tickets;
};

// ─────────────────────────────────────────────────────────────────────────────
//  CHECK IN
// ─────────────────────────────────────────────────────────────────────────────
export const checkInService = async (ticketId, stationId) => {
  const ticket = await Ticket.findById(ticketId).populate('category');
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }
  if (!ticket.transaction) {
  const error = new Error("Ticket not paid");
  error.statusCode = 403;
  throw error;
}

  if (ticket.status !== 'active') {
    const error = new Error(`Cannot check in. Ticket is "${ticket.status}"`);
    error.statusCode = 400;
    throw error;
  }

  const station = await Station.findById(stationId);
  if (!station) {
    const error = new Error('Station not found');
    error.statusCode = 404;
    throw error;
  }

  ticket.checkInStation = stationId;
  ticket.status = 'checked-in';
  await ticket.save();
  await ticket.populate('checkInStation');

  const io = getIO();
  if (io) {
    io.to(ticket._id.toString()).emit('ticket:checkin', {
      ticketId: ticket._id,
      status: ticket.status,
      checkInStation: { _id: ticket.checkInStation._id, name: ticket.checkInStation.name },
    });
  }

  return ticket;
};

// ─────────────────────────────────────────────────────────────────────────────
//  CHECK OUT
// ─────────────────────────────────────────────────────────────────────────────
export const checkOutService = async (ticketId, stationId) => {
  const ticket = await Ticket.findById(ticketId).populate('category');
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  if (ticket.status !== 'checked-in') {
    const error = new Error(`Cannot check out. Ticket is "${ticket.status}"`);
    error.statusCode = 400;
    throw error;
  }

  if (!ticket.checkInStation) {
    const error = new Error('No check-in station found on this ticket');
    error.statusCode = 400;
    throw error;
  }

  const checkOutStation = await Station.findById(stationId);
  if (!checkOutStation) {
    const error = new Error('Station not found');
    error.statusCode = 404;
    throw error;
  }

  // ── Shortest path ──────────────────────────────────────────────────────────
  const graph = await getGraph();
  const result = findShortestPath(
    graph,
    ticket.checkInStation.toString(),
    stationId.toString()
  );

  if (!result.found) {
    const error = new Error('No route found between your check-in and check-out stations');
    error.statusCode = 400;
    throw error;
  }

  const { stops, path, transfers } = result;
  const maxAllowed = ticket.category.numberOfStations;

  // ── Block if exceeded ──────────────────────────────────────────────────────
  if (stops > maxAllowed) {
    const suggestedCategory = await Category.findOne({ numberOfStations: { $gte: stops } })
      .sort({ numberOfStations: 1 });

    const error = new Error(
      `Check-out blocked. Your ticket allows ${maxAllowed} station(s) but you traveled ${stops}.`
    );
    error.statusCode = 403;
    error.stopsRequired = stops;
    error.maxAllowed = maxAllowed;
    error.suggestedCategory = suggestedCategory;
    throw error;
  }

  // ── Complete checkout ──────────────────────────────────────────────────────
  ticket.checkOutStation = stationId;
  ticket.status = 'checked-out';
  await ticket.save();

  const io = getIO();
  if (io) {
    io.to(ticket._id.toString()).emit('ticket:checkout', {
      ticketId: ticket._id,
      status: ticket.status,
      checkOutStation: { _id: checkOutStation._id, name: checkOutStation.name },
    });
  }

  const stationDocs = await Station.find({ _id: { $in: path } });
  const stationMap = Object.fromEntries(stationDocs.map(s => [s._id.toString(), s]));

  const pathDetails = path.map(id => ({
    id,
    name: stationMap[id]?.name || id,
    nameAr: stationMap[id]?.nameAr || id,
    isTransfer: transfers.includes(id),
  }));

  return {
    ticket,
    journey: {
      stops,
      maxAllowed,
      path: pathDetails,
      transfers: transfers.map(id => ({
        id,
        name: stationMap[id]?.name || id,
        nameAr: stationMap[id]?.nameAr || id,
      })),
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  CHECK IN BY URL PARAM  (POST /ticket/:id/checkin)
// ─────────────────────────────────────────────────────────────────────────────
export const checkInByIdService = async (ticketId, stationId) =>
  checkInService(ticketId, stationId);

// ─────────────────────────────────────────────────────────────────────────────
//  CHECK OUT BY URL PARAM  (POST /ticket/:id/checkout)
// ─────────────────────────────────────────────────────────────────────────────
export const checkOutByIdService = async (ticketId, stationId) =>
  checkOutService(ticketId, stationId);

// ─────────────────────────────────────────────────────────────────────────────
//  GET TICKET QR CODE
// ─────────────────────────────────────────────────────────────────────────────
export const getTicketQrService = async (ticketId) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }
  const qrCode = await QRCode.toDataURL(ticketId.toString());
  return { ticketId: ticket._id, status: ticket.status, qrCode };
};