import { processPaymentService } from "../payment/paymentService.js";

export const payment = async (req, res) => {
  try {
    const { ticketIds, paymentMethod, cardNumber, expiry, cvv } = req.body;

    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ticketIds must be a non-empty array",
      });
    }

    const { transaction, qrCodes } = await processPaymentService({
      userId: req.user._id,
      ticketIds,
      paymentMethod,
      cardNumber,
      expiry,
      cvv,
    });

    res.status(200).json({
      success: true,
      message: "Payment completed successfully",
      transaction,
      qrCodes,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

