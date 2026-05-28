import { Router } from 'express';


import { signUp, login , verifyOtp , forgotPassword, resetPassword } from './auth.controller.js';

const router = Router();

// ✅ login/signUp routes
router.post('/signup', signUp);
router.post('/login', login);
router.post('/verify', verifyOtp); 

// ⭐ ForgetPassword routes
router.post('/forget-password', forgotPassword);
router.patch('/reset-password', resetPassword);


export default router;