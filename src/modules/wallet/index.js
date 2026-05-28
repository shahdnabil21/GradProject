import { Router } from "express";
import Joi from "joi";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAdmin }   from "../../middleware/admin.middleware.js";
import { isValid }   from "../../middleware/validation.middleware.js";
import {
    createWallet,
    getWallet,
    chargeWallet,
    deductFromWallet,
    toggleWalletStatus,
    getAllWallets,
    
} from "./wallet.controller.js";
const router = Router();

// ── Joi schemas ───────────────────────────────────────────────────────────────

const chargeSchema = Joi.object({
    amount: Joi.number()
        .min(50)
        .max(5000)
        .required()
        .messages({
            "number.min":   "Minimum charge amount is 50 EGP",
            "number.max":   "Maximum charge amount is 5000 EGP",
            "any.required": "Amount is required",
            "number.base":  "Amount must be a number",
        }),

    cardNumber: Joi.string()
        .pattern(/^\d{16}$/)
        .required()
        .messages({
            "string.empty": "Card number is required",
            "any.required": "Card number is required",
            "string.pattern.base": "Invalid card number",
        }),

    expiry: Joi.string()
        .pattern(/^\d{2}\/\d{2}$/)
        .required()
        .messages({
            "string.empty": "Expiry date is required",
            "any.required": "Expiry date is required",
            "string.pattern.base": "Expiry must be MM/YY",
        }),

    cvv: Joi.string()
        .pattern(/^\d{3,4}$/)
        .required()
        .messages({
            "string.empty": "CVV is required",
            "any.required": "CVV is required",
            "string.pattern.base": "Invalid CVV",
        }),
});
const deductSchema = Joi.object({
    amount: Joi.number()
        .min(1)
        .required()
        .messages({
            "number.min":   "Amount must be at least 1 EGP",
            "any.required": "Amount is required",
            "number.base":  "Amount must be a number",
        }),
});

// ── User routes ───────────────────────────────────────────────────────────────

// Get started — create wallet
router.post("/start",
    isAuthenticated,
    createWallet
);

// View wallet balance
router.get("/",
    isAuthenticated,
    getWallet
);

// Charge wallet
router.patch("/charge",
    isAuthenticated,
    isValid(chargeSchema),
    chargeWallet
);

// Deduct from wallet (when paying for a ticket)
router.patch("/deduct",
    isAuthenticated,
    isValid(deductSchema),
    deductFromWallet
);

// ── Admin routes ──────────────────────────────────────────────────────────────

// View all users wallets
router.get("/admin/all",
    isAuthenticated,
    isAdmin,
    getAllWallets
);
// Freeze or unfreeze a specific wallet
router.patch("/admin/:walletId/toggle",
    isAuthenticated,
    isAdmin,
    toggleWalletStatus
);


export default router;