import mongoose, { Schema, model } from "mongoose";

const walletSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // one wallet per user
        },

        balance: {
            type: Number,
            default: 0,
            min: 0,
        },

        isActive: {
            type: Boolean,
            default: true, // false = wallet is frozen/blocked by admin
        },

        chargedAt: {
            type: Date,
            default: null, // updated every time user charges
        },
        
    },
    { timestamps: true }
);

export default model('Wallet', walletSchema);