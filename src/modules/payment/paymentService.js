import { Transaction, Ticket, Category, Wallet, Station } from "../../DB/model/index.js";
import { findShortestPath } from "../../utils/shortTestPath.js";
import QRCode from "qrcode";

// mock payment engine
const processMockCard = (cardNumber) => {
  if (
    [
      "4242424242424242",
      "4000056655665556",
      "5555555555554444",
      "5200828282828210",
    ].includes(cardNumber)
  ) {
    return { success: true };
  }

  if (cardNumber === "4000000000000002") {
    return { success: false, reason: "Card declined" };
  }

  return Math.random() > 0.3
    ? { success: true }
    : { success: false, reason: "Insufficient funds" };
};

export const processPaymentService = async ({
  userId,
  ticketIds,
  paymentMethod,
  cardNumber,
  expiry,
  cvv,
}) => {
  // 1. GET TICKETS
  const tickets = await Ticket.find({ _id: { $in: ticketIds } });

  if (tickets.length !== ticketIds.length) {
    throw new Error("Some tickets not found");
  }

  // 2. CHECK IF ALREADY PAID
  const alreadyPaid = tickets.some((t) => t.transaction);
  if (alreadyPaid) {
    throw new Error("One or more tickets already paid");
  }

  // 3. CALCULATE TOTAL PRICE
  let totalAmount = 0;

  for (const ticket of tickets) {
    const category = await Category.findById(ticket.category);
    if (!category) throw new Error("Category not found");

    totalAmount += category.price;
  }

  let serviceFee = tickets.length * 0.5;
  totalAmount += serviceFee;

  // 4. CREATE TRANSACTION (PENDING)
  const transaction = await Transaction.create({
    user: userId,
    amount: totalAmount,
    serviceFee,
    paymentMethod,
    status: "pending",
    transactionId: "TXN-" + Date.now(),
  });

  // 5. PAYMENT PROCESSING
 // 5. PAYMENT PROCESSING

if (paymentMethod === "wallet") {

  const wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    transaction.status = "failed";
    await transaction.save();
    throw new Error("Wallet not found");
  }

  if (wallet.balance < totalAmount) {
    transaction.status = "failed";
    transaction.failureReason = "Insufficient balance";
    await transaction.save();

    throw new Error("Insufficient wallet balance");
  }

  // deduct money
  wallet.balance -= totalAmount;

  await wallet.save();
}

else if (paymentMethod === "card") {

  // 1. Calculate Fawry fees separately
  const fawryPercentRate = 0.025; 
  const fawryFixedFee = 2.00;
  const fawryGatewayFee = Number(((totalAmount * fawryPercentRate) + fawryFixedFee).toFixed(2));

  // 2. Track old baseline app fee before adding Fawry fee
  const appServiceFee = serviceFee; 

  // 3. Update global tallies for the database record
  totalAmount += fawryGatewayFee;
  serviceFee += fawryGatewayFee;

  // 4. Update and save the transaction document
  transaction.amount = Number(totalAmount.toFixed(2));
  transaction.serviceFee = Number(serviceFee.toFixed(2));
  await transaction.save();

  // validate card format
  validateCard({ cardNumber, expiry, cvv });

  // mock payment gateway
  const result = processMockCard(cardNumber);

  if (!result.success) {
    transaction.status = "failed";
    transaction.failureReason = result.reason;
    await transaction.save();
    throw new Error(result.reason);
  }

  // 5. Attach temporary properties to the transaction object so we can use them in the final return
  transaction._fawryFee = fawryGatewayFee;
  transaction._appFee = appServiceFee;
}

else {
  throw new Error("Invalid payment method");
}

  // 6. MARK SUCCESS
  transaction.status = "completed";
  transaction.paidAt = new Date();
  await transaction.save();

  // 7. LINK TICKETS AND ACTIVATE
  await Ticket.updateMany(
    { _id: { $in: ticketIds } },
    { transaction: transaction._id, status: "active" }
  );

  // 8. GENERATE QR CODES FOR EACH TICKET
  // const updatedTickets = await Ticket.find({ _id: { $in: ticketIds } }).populate("category");
  // const qrCodes = await Promise.all(
  //   updatedTickets.map(async (t) => ({
  //     ticketId: t._id,
  //     qrCode: await QRCode.toDataURL(t._id.toString()),
  //   }))
  // );

  // return { transaction, qrCodes };
const updatedTickets = await Ticket.find({ _id: { $in: ticketIds } }).populate("category");
  const qrCodes = await Promise.all(
    updatedTickets.map(async (t) => ({
      ticketId: t._id,
      qrCode: await QRCode.toDataURL(t._id.toString()),
    }))
  );

  // ── RETURN THE EXPLICIT BREAKDOWN TO THE CONTROLLER/FRONTEND ──────────────
  return { 
    transaction, 
    qrCodes,
    feeBreakdown: {
      ticketBasePrice: updatedTickets.reduce((acc, t) => acc + (t.category?.price || 0), 0),
      appServiceFee: transaction._appFee || serviceFee, // baseline ticket fees (0.5 EGP per ticket)
      fawryGatewayFee: transaction._fawryFee || 0,       // 0 if paid by wallet, calculated amount if card
      finalTotalPayed: transaction.amount
    },
    categories: updatedTickets.map(t => t.category) // Array of metro ticket categories purchased (e.g. 9 stations, 16 stations)
  };
};


