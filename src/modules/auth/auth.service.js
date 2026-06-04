import { User } from '../../DB/model/index.js';
//import { sign } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'
import AppError from '../../utils/appError.js';
import sendEmail from '../../utils/sendEmail.js';

// TOKEN
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
//=======signUp==============
/* export const signUpService = async (email, password, confirmPassword, gender, dateOfBirth, name) => {
  if (password !== confirmPassword)
  throw new AppError('Passwords do not match!', 400);

  const newUser = await User.create({
    email,
    password,
    confirmPassword,
    gender,
    dateOfBirth,
    name
  });

  //2)====Generate OTP and save to DB
  const otp = newUser.createOTP();
  await newUser.save({ validateBeforeSave: false });

// 3) Send OTP email
  try {
    await sendEmail({
      email: newUser.email,
      subject: 'Metro App — Verify Your Account',
      message:
        `Welcome to Metro App! 🎉\n\n` +
        `Your verification code is:\n\n` +
        `   ${otp}\n\n` +
        `This code expires in 2 minutes.\n` +
        `Please verify your account to continue.`
    });
  } catch (err) {
    // if email fails → delete user so they can signup again
    await User.findByIdAndDelete(newUser._id);
    throw new AppError('Error sending verification email. Please try again.', 500);
  }


  newUser.password = undefined;
  return {
    user: newUser,
    message: 'Account created! Please check your email for the verification code.'
  };
}; */

//sign up 2=============================
const ADMIN_EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@admin\.eg\.com$/;
export const signUpService = async ( {email,
  password,
  confirmPassword,
  gender,
  dateOfBirth,
  name}) => {
    let role = "user";

   if (ADMIN_EMAIL_PATTERN.test(email)) {
    role = "admin";
    }

  const newUser = await User.create({
   name,
  email,
  password,
  confirmPassword,
  gender,
  dateOfBirth,
  role
  });

  //2)====Generate OTP and save to DB
  const otp = newUser.createOTP();
  await newUser.save({ validateBeforeSave: false });

// 3) Send OTP email
  try {
    await sendEmail({
      email: newUser.email,
      subject: 'Metro App — Verify Your Account',
      message:
      `  Welcome to Metro App! 🎉\n\n +
        Your verification code is:\n\n +
           ${otp}\n\n +
        This code expires in 2 minutes.\n +
        Please verify your account to continue.`
    });
  } catch (err) {
    // if email fails → delete user so they can signup again
    await User.findByIdAndDelete(newUser._id);
    throw new AppError('Error sending verification email. Please try again.', 500);
  }

  newUser.password = undefined;
  return {
    user: newUser,
    message: 'Account created! Please check your email for the verification code.',
    ...(process.env.NODE_ENV === "development" && { otp }),
  };
};

// ── VERIFY OTP — verifies account after signup ────────
export const verifyOtpService = async (email, otp) => {
  // 1) Hash the entered OTP to compare with DB
  const hashedOtp = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  // 2) Find user — OTP must match AND not be expired
  const user = await User.findOne({
    email,
    otpCode: hashedOtp,
    otpExpires: { $gt: Date.now() }
  });

  if (!user)
    throw new AppError('OTP is invalid or has expired.', 400);

  // 3) Mark user as verified and clear OTP
  user.isVerified = true;
  user.otpCode = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // 4) No token here — just confirm verification ✅
  return { message: 'Account verified successfully! You can now login.' };
};



//resend OTP

export const resendOtpService = async (email) => {
  const user = await User.findOne({ email });

  // console.log('User found:', user); // ← add this

  if (!user)
    throw new AppError('No user found with that email.', 404);

  if (user.isVerified)
    throw new AppError('This account is already verified.', 400);

  const otp = user.createOTP();
  await user.save({ validateBeforeSave: false });

  console.log('OTP generated:', otp); // ← add this

  try {
    await sendEmail({
      email: user.email,
      subject: 'Metro App — New Verification Code',
      message:
        `Here is your new verification code:\n\n` +
        `   ${otp}\n\n` +
        `This code expires in 2 minutes.`
    });
    console.log('Email sent successfully'); // ← add this
    return { message: 'A new OTP has been sent to your email.' };
  } catch (err) {
    console.log('Email error:', err); // ← add this
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('Error sending email. Try again later.', 500);
  }


};

//==========Login============
export const logInService = async (email, password) => {
   // 1) Check if email and password exist
  if (!email || !password)
    throw new AppError('Please provide email and password!', 400);

  // 2) Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password +active +email');
  if (!user || !(await user.correctPassword(password, user.password)))
    throw new AppError('Incorrect email or password', 401);

    // ✅ Block deactivated users 
  if (user.active === false)
    throw new AppError('This account has been deactivated.', 401);

    // 4) Check if account is verified
  if (!user.isVerified)
    throw new AppError('Please verify your account first! Check your email for the OTP.', 401);

  // 5) All good — return token directly ✅
  const token = signToken(user._id);
  return { token, message: 'Logged in successfully!' };
};



// ── FORGOT PASSWORD ⭐ ────────────────────────────────
export const forgotPasswordService = async (email, protocol, host) => {
  // 1) Find user by email
  const user = await User.findOne({ email });
  // if (!user)
  //   return next(new AppError('No user found with that email address.', 404));
  if (!user)
  throw new AppError('No user found with that email address.', 404);

  // 2) Generate OTP for password reset
  const otp = user.createOTP();
  await user.save({ validateBeforeSave: false });

 // 3) Send OTP email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Metro App — Password Reset Code',
      message:
        `You requested a password reset. 🔐\n\n` +
        `Your reset code is:\n\n` +
        `   ${otp}\n\n` +
        `This code expires in 10 minutes.\n` +
        `If you didn't request this, please ignore this email.`
    });
    return { message: 'Password reset OTP sent to your email!' };

  } catch (err) {
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('Error sending email. Try again later.', 500);
  } 

};


// ── RESET PASSWORD ⭐ ─────────────────────────────────
export const resetPasswordService = async (email,otp, password, confirmPassword) => {
  // 1) Hash the entered OTP
  const hashedotp = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  // 2) Find user — OTP must match AND not be expired
  const user = await User.findOne({
    email,
    otpCode: hashedotp,
    otpExpires: { $gt: Date.now() }
  });

  if (!user)
      throw new AppError('OTP is invalid or has expired.', 400);

  // 3) Check passwords match
  if (password !== confirmPassword)
      throw new AppError('Passwords do not match!', 400);
  // 4) Set new password  ✅
  user.password = password;
  user.confirmPassword = confirmPassword;
  user.otpCode = undefined;
  user.otpExpires = undefined;
  await user.save();

  // 5) Log user in with a fresh JWT
  const newToken = signToken(user._id);
  return { token: newToken };
};

//////======Service for deactivate the account(delete)==============
export const protectService = async (token)=>{

    ///check the token existence
    if(!token)
        throw new AppError("you're not logged in to have access", 401);

    ///get the user
    const decoded = jwt.verify(token , process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if(!user)
        throw new AppError("This user is no longer exists",401);
    return user;
};
