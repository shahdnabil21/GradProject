import express from "express";
import Joi from "joi";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAdmin } from "../../middleware/admin.middleware.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { uploadSubscriptionDocs } from "../../middleware/multer.middleware.js";
//import { fileValidation, upload } from "../../middleware/multer.middleware.js";

import {
  createSubscription,
  //getAllSubscriptions,
  reviewSubscription,
} from "./subscription.controller.js";
import { createSubscriptionService } from "./subscription.service.js";

const router = express.Router();

///=====Subscription Schemaa VALIDATION BY joi for USER=========
const subscriptionSchema = Joi.object({
  duration: Joi.number().valid(3, 5).required().messages({
    "any.only": "Duration must be 3 or 5 months",
    "any.required": "Duration is required",
  }),
}).options({ convert: true });

///=====Subscription Schemaa VALIDATION BY joi for ADMIN REVIEW=========
const reviewSchema = Joi.object({
  status: Joi.string().valid("approved", "rejected").required().messages({
    "any.only": "Status must be approved or rejected",
    "any.required": "Status is required",
  }),
  note: Joi.string().optional().allow(""),
   id: Joi.string().optional(),
});

// User submits subscription with documents====ACTUAL END POINT==============================
  router.post(
    "/",
    isAuthenticated,
     uploadSubscriptionDocs.fields([
        { name: "nationalId", maxCount: 1 },
        { name: "university", maxCount: 1 },
        { name: "address",    maxCount: 1 },
    ]), 
     isValid(subscriptionSchema),
     createSubscription,
);  

/* router.post(
  "/",
  isAuthenticated,
  upload("user/subscription", [...fileValidation.image], 10).fields([
    { name: "nationalId", maxCount: 1 },
    { name: "university", maxCount: 1 },
    { name: "address", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const result = await createSubscriptionService(
        req.user._id,
        req.files,
        3,
      );
      return res.status(201).json({
        success: true,
        message: "Subscription submitted successfully.",
        data: {
          subscriptionId: result._id,
          duration: result.duration,
          status: result.status,
          submittedAt: result.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },
); */
// Admin views all subscriptions
/* router.get(
    "/",
    isAuthenticated,
    isAdmin,
    getAllSubscriptions
); */

// Admin approves or rejects
router.patch(
  "/:id",
  isAuthenticated,
  isAdmin,
  isValid(reviewSchema),
  reviewSubscription,
);


export default router;
