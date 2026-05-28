import { Schema, model } from 'mongoose';


const ticketSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
   category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  checkInStation: {
    type: Schema.Types.ObjectId,
    ref: 'Station'
  },
  checkOutStation: {
    type: Schema.Types.ObjectId,
    ref: 'Station'
  },
  status: {
    type: String,
    enum: ['pending_payment', 'active', 'checked-in', 'checked-out', 'expired'],
    default: 'pending_payment',
  },
  transaction:{
  type: Schema.Types.ObjectId,
  ref: 'Transaction'
}
}
, { timestamps: true });

export default model('Ticket', ticketSchema);