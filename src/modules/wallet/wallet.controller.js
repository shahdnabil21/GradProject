import { MESSAGES } from "../../constant/message.constant.js";
import {
    createWalletService,
    getWalletService,
    chargeWalletService,
    deductFromWalletService,
    toggleWalletStatusService,
    getAllWalletsService,
} from "./wallet.service.js";

// POST /wallet/start — user creates their wallet
export const createWallet = async (req, res, next) => {
    try {
        const data = await createWalletService(req.user._id);
        return res.status(201).json({
            success: true,
            message: MESSAGES.wallet.created,
            data,
        });
    } catch (error) {
        next(error);
    }
};

// GET /wallet — user views their wallet balance
export const getWallet = async (req, res, next) => {
    try {
        const data = await getWalletService(req.user._id);
        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

// PATCH /wallet/charge — user charges their wallet
// export const chargeWallet = async (req, res, next) => {
// try {

//         const {
//             amount,
//             cardNumber,
//             expiry,
//             cvv
//         } = req.validData;

//         // Validate amount
//         if (!amount || amount <= 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Valid amount is required"
//             });
//         }
//         // Validate card details
//         if (!cardNumber || !expiry || !cvv) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Card details are required"
//             });
//         }

//         // MOCK PAYMENT SUCCESS
//         console.log("✅ Card payment successful");

//         // Charge wallet
//         const data = await chargeWalletService(
//             req.user._id,
//             amount
//         );

//         return res.status(200).json({
//             success: true,
//             message: `${amount} EGP added to your wallet successfully.`,
//             data,
//         });

//     } catch (error) {
//         next(error);
//     }
// };
export const chargeWallet = async (req, res, next) => {
    try {

        const {
            amount,
            cardNumber,
            expiry,
            cvv
        } = req.validData;

        // MOCK PAYMENT SUCCESS
        console.log("✅ Card payment successful");


        // Charge wallet
        const data = await chargeWalletService(
            req.user._id,
            amount
        );

        return res.status(200).json({
            success: true,
            message: `${amount} EGP added to your wallet successfully.`,
            data,
        });

    } catch (error) {
        next(error);
    }
};

// PATCH /wallet/deduct — called internally when buying ticket with wallet
export const deductFromWallet = async (req, res, next) => {
    try {
        const { amount } = req.validData;
        const data = await deductFromWalletService(req.user._id, amount);
        return res.status(200).json({
            success: true,
            message: `${amount} EGP deducted from your wallet.`,
            data,
        });
    } catch (error) {
        next(error);
    }
};

// PATCH /wallet/admin/:walletId/toggle — admin freezes or unfreezes a wallet
export const toggleWalletStatus = async (req, res, next) => {
    try {
        const { walletId } = req.params;
        const data = await toggleWalletStatusService(walletId);
        return res.status(200).json({
            success: true,
            message: `Wallet has been ${data.isActive ? "activated" : "deactivated"}.`,
            data,
        });
    } catch (error) {
        next(error);
    }
};

// GET /wallet/admin/all — admin views all wallets
export const getAllWallets = async (req, res, next) => {
    try {
        const data = await getAllWalletsService();
        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};


