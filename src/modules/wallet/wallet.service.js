import { Wallet } from "../../DB/model/index.js";
import AppError   from "../../utils/appError.js";
import { MESSAGES } from "../../constant/message.constant.js";

// ── Get Started — create wallet for user ─────────────────────────────────────

export const createWalletService = async (userId) => {
    // Check if user already has a wallet
    const existingWallet = await Wallet.findOne({ userId });
    if (existingWallet) {
        throw new AppError("You already have a wallet.", 400);
    }
    const wallet = await Wallet.create({ userId });

    if (!wallet) {
        throw new AppError(MESSAGES.wallet.failToCreate, 500);
    }
    return wallet;
};

// ── Get wallet info ───────────────────────────────────────────────────────────

export const getWalletService = async (userId) => {
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
        throw new AppError(MESSAGES.wallet.notFound, 404);
    }
    return wallet;
};

// ── Charge wallet ─────────────────────────────────────────────────────────────
export const chargeWalletService = async (userId, amount) => {

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
        throw new AppError(MESSAGES.wallet.notFound, 404);
    }
    // Block charge if wallet is frozen
    if (!wallet.isActive) {
        throw new AppError(
            "Your wallet has been deactivated. Please contact support.",
            403
        );
    }
    const paymentgatewayFee = 2; 
    const netAmount = amount - paymentgatewayFee;
    // Add amount to existing balance
    wallet.balance   += amount;
    wallet.chargedAt  = new Date();
    await wallet.save();
    return wallet;
};

// ── Deduct from wallet (used when buying a ticket) ───────────────────────────
export const deductFromWalletService = async (userId, amount) => {

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
        // Automatically create a wallet with a default balance of 100 EGP for easier testing and development
        wallet = await Wallet.create({ userId, balance: 100 });
    }
    if (!wallet.isActive) {
        throw new AppError(
            "Your wallet has been deactivated. Please contact support.",
            403
        );
    }
    if (wallet.balance < amount) {
        throw new AppError(
            `Insufficient wallet balance. Your balance is ${wallet.balance} EGP.`,
            400
        );
    }
    wallet.balance -= amount;
    await wallet.save();
    return wallet;
};

// ── Admin: toggle wallet active/inactive ─────────────────────────────────────
export const toggleWalletStatusService = async (walletId) => {

    const wallet = await Wallet.findById(walletId);

    if (!wallet) {
        throw new AppError(MESSAGES.wallet.notFound, 404);
    }

    wallet.isActive = !wallet.isActive;
    await wallet.save();

    return wallet;
};

// ── Admin: get all wallets ────────────────────────────────────────────────────
export const getAllWalletsService = async () => {
    return await Wallet.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 });
};