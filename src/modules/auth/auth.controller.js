import { Router } from 'express'
import {  signUpService , logInService , forgotPasswordService ,
   resetPasswordService , verifyOtpService,
   protectService} from './auth.service.js';
const router = Router(); 
import catchAsync from '../../utils/catchAsync.js';

// ── SIGN UP ────────────────────────────────────────
export const signUp = catchAsync(async (req, res, next) => {
  const result = await signUpService(
    req.body.name,
    req.body.email,
    req.body.password,
    req.body.confirmPassword,
    req.body.gender
);
  res.status(201).json({
    status: 'success',
    message: result.message,
    data: result,
    //data: { user: result.user },
  });
});

// ── VERIFY OTP — cverifies account after signup ──────────────────────
export const verifyOtp = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  const result = await verifyOtpService(email, otp);
  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

// ── LOG IN ─────────────────────────────────────────
export const login = catchAsync(async (req, res, next) => { 
  const result = await logInService(
    req.body.email,
    req.body.password, 
    );
   if (!result) return; // next(error) was already called in service
    res.status(200).json({ 
     status: 'success',
     message: result.message,
     token: result.token       // JWT token returned ✅
   });
});

// ── FORGOT PASSWORD ⭐ ──────────────────────────────
export const forgotPassword = catchAsync(async (req, res, next) => {
  const result = await forgotPasswordService(
    req.body.email,
    req.protocol,
    req.get('host'),
    next
  );
  if (!result) return;
  res.status(200).json({ status: 'success', message: result.message });
});

// ── RESET PASSWORD ⭐ ───────────────────────────────
export const resetPassword = catchAsync(async (req, res, next) => {
  const result = await resetPasswordService(
    req.body.email,
    req.body.otp,
    req.body.password,
    req.body.confirmPassword,
    
  );
  if (!result) return;
  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully!',
    token: result.token
  });
});

export const protect = catchAsync(async (req, res , next)=>{
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1];
  };

  const user = await protectService(token);

  req.user = user;
  next();
});


export default router