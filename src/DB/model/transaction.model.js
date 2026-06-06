import { Schema, model } from 'mongoose';

const transactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
   wallet:{
    type: Schema.Types.ObjectId,
    ref: 'Wallet'
  },
  amount: {
    type: Number,
    required: true,
  },
  serviceFee: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  paymentMethod: { 
    type: String,
    enum: ['wallet', 'card'], 
    required: true 
  }
}, { timestamps: true });
export default model('Transaction', transactionSchema);