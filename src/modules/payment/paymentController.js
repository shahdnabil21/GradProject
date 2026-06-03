import { processPaymentService } from "../payment/paymentService.js";

export const payment = async (req, res) => {
  try {
    const { ticketIds, paymentMethod, cardNumber, expiry, cvv } = req.body;

    // VALIDATION: Check ticketIds
    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ticketIds must be a non-empty array",
      });
    }

    // VALIDATION: Check paymentMethod
    if (!paymentMethod || !["wallet", "card"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "paymentMethod must be either 'wallet' or 'card'",
      });
    }

    // VALIDATION: If card payment, validate card details
    if (paymentMethod === "card") {
      if (!cardNumber || !expiry || !cvv) {
        return res.status(400).json({
          success: false,
          message: "Card number, expiry, and CVV are required for card payments",
        });
      }
    }

    // Process the payment
    const { transaction, qrCodes, feeBreakdown, categories } = await processPaymentService({
      userId: req.user._id,
      ticketIds,
      paymentMethod,
      cardNumber,
      expiry,
      cvv,
    });

// Return success response with all details
    return res.status(200).json({
      success: true,
      message: "Payment completed successfully",
      data: {
        transaction: {
          id: transaction.id,
          walletId: transaction.walletId || null, // <-- Added this line to include walletId in response
          transactionId: transaction.transactionId,
          amount: transaction.amount,
          status: transaction.status,
          paidAt: transaction.paidAt,
        },
        qrCodes,
        feeBreakdown,
        ticketCategories: categories,
      },
    });
  } catch (err) {
    // Determine the appropriate status code based on error type
    let statusCode = 400;

    if (err.message.includes("not found")) {
      statusCode = 404;
    } else if (err.message.includes("Insufficient") || err.message.includes("already")) {
      statusCode = 400;
    } else if (err.message.includes("Invalid")) {
      statusCode = 422;
    }

    return res.status(statusCode).json({
      success: false,
      message: err.message,
    });
  }
};