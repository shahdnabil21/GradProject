import express from "express";
// import { isAuthenticated } from "../../middleware/authentication.middleware.js";

// import { protect } from '../auth/auth.controller.js';
import { payment } from "../../modules/payment/paymentController.js";

const router = express.Router();

// router.use(isAuthenticated);


router.post("/", payment);

export default router;
