import { Schema , model } from "mongoose";
//import { isEmail } from "validator";
import validator from "validator";
import { hash,compare } from "bcrypt";
import crypto from 'crypto';
import { time } from "console";

const userSchema = new Schema({
  name:{
    type: String,
    required: [true, 'Please provide your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']  ///// isEmail
  },
   role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
    gender:{
    type: String,
    enum: ['male', 'female' ],
    required: true
  },
 dateOfBirth: {
  type: Date,
  validate: {
    validator: function(val) {
      return val < Date.now(); 
    },
    message: 'Date of birth must be in the past'
  }
},
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
     validate: {
    validator: function(val) {
      return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(val);
    },
    message: 'Password must have at least 1 uppercase letter, 1 number, and 1 special character'
  }
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date,
 
   active: {
    type: Boolean,
    default: true,
    select: false 
  }, 
  otpCode: String,
  otpExpires: Date,
  isVerified: {
    type:Boolean ,
    default:false
  }
},{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
},{timestamps: true});

// user age 
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
});

// password encryption
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;

  this.password = await hash(this.password, 12);
  this.confirmPassword = undefined;
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await compare(candidatePassword, userPassword);
};

//=========CREATING PASSWORD RESET/ CREATE OTP==========
userSchema.methods.createOTP = function() {
  // 1) Generate random 6-digit code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // 2) Save encrypted version in DB
  this.otpCode = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  // 3) Expires in 2 minutes
  this.otpExpires = Date.now() + 2 * 60 * 1000;

  // 4) Return plain OTP for the email
  return otp;
};

const User = model('User', userSchema);
export default User;