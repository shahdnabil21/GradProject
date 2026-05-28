import { Router } from "express";
import Joi from "joi";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAdmin }          from "../../middleware/admin.middleware.js";
import { isValid }          from "../../middleware/validation.middleware.js";
import { MESSAGES }         from "../../constant/message.constant.js";
import {
    getOverview,
    getTopStations,
    getUserDemographics,
    getPeakHours,
    getRevenue,
    getLineUsage,
} from "./dashboard.controller.js";

const router = Router();



const periodSchema = Joi.object({
    period: Joi.string()
        .valid("today", "week", "month", "year")
        .default("month")
        .messages({ "any.only": MESSAGES.dashboard.invalidPeriod }),
});

const periodWithLimitSchema = Joi.object({
    period: Joi.string()
        .valid("today", "week", "month", "year")
        .default("month")
        .messages({ "any.only": MESSAGES.dashboard.invalidPeriod }),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .default(10)
        .messages({ "number.base": MESSAGES.dashboard.invalidLimit }),
});

// ── Routes ───────────────────────────────────────────────────────────────────

router.get("/overview",
    isAuthenticated, isAdmin, isValid(periodSchema),
    getOverview
);
router.get("/stations",
    isAuthenticated, isAdmin, isValid(periodWithLimitSchema),
    getTopStations
);
router.get("/demographics",
    isAuthenticated, isAdmin,
    getUserDemographics
);
router.get("/peak-hours",
    isAuthenticated, isAdmin, isValid(periodSchema),
    getPeakHours
);
router.get("/revenue",
    isAuthenticated, isAdmin, isValid(periodSchema),
    getRevenue
);
router.get("/lines",
    isAuthenticated, isAdmin, isValid(periodSchema),
    getLineUsage
);
export default router;