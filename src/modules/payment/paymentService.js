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

const validateCard = ({ cardNumber, expiry, cvv }) => {
  // Add your card validation logic here
  if (!cardNumber || cardNumber.length < 13) {
    throw new Error("Invalid card number");
  }
  if (!expiry || !expiry.match(/^\d{2}\/\d{2}$/)) {
    throw new Error("Invalid expiry format (MM/YY)");
  }
  if (!cvv || cvv.length < 3) {
    throw new Error("Invalid CVV");
  }
};


// PROCESS WALLET PAYMENT
const processWalletPayment = async (userId, totalAmount, serviceFee, transaction) => {
  const wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    transaction.status = "failed";
    transaction.failureReason = "Wallet not found";
    await transaction.save();
    throw new Error("Wallet not found");
  }

  if (wallet.balance < totalAmount) {
    transaction.status = "failed";
    transaction.failureReason = "Insufficient wallet balance";
    await transaction.save();
    throw new Error("Insufficient wallet balance");
  }

  // Deduct money from wallet
  wallet.balance -= totalAmount;
  await wallet.save();

  // Explicitly assign the wallet's ID to the transaction
  transaction.wallet = wallet._id;
  await transaction.save();

  console.log("Saved wallet ID to transaction:", transaction.wallet);

  return {
    paymentMethod: "wallet",
    gatewayFee: 0,
    appServiceFee: serviceFee,
  };
};
// PROCESS CARD PAYMENT
const processCardPayment = async (cardNumber, expiry, cvv, totalAmount, serviceFee, transaction) => {
  // Validate card format
  validateCard({ cardNumber, expiry, cvv });

  // Calculate Fawry gateway fees
  const fawryGatewayFee = 2.00;

  // Process the payment through mock gateway
  const result = processMockCard(cardNumber);

  if (!result.success) {
    transaction.status = "failed";
    transaction.failureReason = result.reason;
    await transaction.save();
    throw new Error(result.reason);
  }

  // Update transaction with gateway fees
const updatedTotalAmount = Number(
  (totalAmount + fawryGatewayFee).toFixed(2)
);

transaction.amount = updatedTotalAmount;

await transaction.save();

return {
  paymentMethod: "card",
  gatewayFee: fawryGatewayFee,
  appServiceFee: serviceFee,
  updatedAmount: updatedTotalAmount,
};
};

export const processPaymentService = async ({
  userId,
  ticketIds,
  paymentMethod,
  cardNumber,
  expiry,
  cvv,
}) => {
  // Validate payment method
  if (!["wallet", "card"].includes(paymentMethod)) {
    throw new Error("Invalid payment method. Must be 'wallet' or 'card'");
  }

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

  // Add app service fee (0.5 EGP per ticket)
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

  // 5. PROCESS PAYMENT BASED ON METHOD
  let paymentResult;

  try {
    if (paymentMethod === "wallet") {
      paymentResult = await processWalletPayment(userId, totalAmount, serviceFee, transaction);
    } else if (paymentMethod === "card") {
      paymentResult = await processCardPayment(
        cardNumber,
        expiry,
        cvv,
        totalAmount,
        serviceFee,
        transaction
      );
    }
  } catch (error) {
    throw error; // Re-throw to be caught in controller
  }

  // 6. MARK TRANSACTION AS COMPLETED
  transaction.status = "completed";
  transaction.paidAt = new Date();
  await transaction.save();

  // 7. LINK TICKETS AND ACTIVATE
  await Ticket.updateMany(
    { _id: { $in: ticketIds } },
    { transaction: transaction._id, status: "active" }
  );

  // 8. GENERATE QR CODES FOR EACH TICKET
  const updatedTickets = await Ticket.find({ _id: { $in: ticketIds } }).populate("category");
  const qrCodes = await Promise.all(
    updatedTickets.map(async (t) => ({
      ticketId: t._id,
      qrCode: await QRCode.toDataURL(t._id.toString()),
    }))
  );

  // Calculate total ticket base price
  const ticketBasePrice = updatedTickets.reduce(
    (acc, t) => acc + (t.category?.price || 0),
    0
  );
// 9. RETURN COMPLETE BREAKDOWN
  // Populate the wallet relation if it exists
  if (transaction.wallet) {
    await transaction.populate("wallet");
  }

  return {
    transaction: {
      id: transaction._id,
      // Safely extract the ID whether it is populated as an object or left as an ObjectId
      walletId: transaction.wallet?._id || transaction.wallet || null, 
      amount: transaction.amount,
      status: transaction.status,
      paidAt: transaction.paidAt,
    },
    qrCodes,
    feeBreakdown: {
      ticketBasePrice,
      appServiceFee: paymentResult.appServiceFee,
      gatewayFee: paymentResult.gatewayFee,
      finalTotalPayed: transaction.amount,
      paymentMethod: paymentResult.paymentMethod,
    },
    categories: updatedTickets.map((t) => t.category),
  };
};