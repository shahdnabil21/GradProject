import mongoose, { Schema, model } from "mongoose";

const subscriptionSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        duration: {
            type: Number,
            required: true, // 3 or 5 months — 
        },

        nationalIdImage: {
            type: String,
            required: [true, "National ID image is required"],
        },
        universityPaper: {
            type: String,
            required: [true, "University paper is required"],
        },
        addressImage: {
            type: String,
            required: [true, "Address document is required"],
        },

        status: {
            type: String,
            default: "pending", // pending / approved / rejected — no enum
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        reviewNote: {
            type: String,
            default: null,
        },

        confirmationEmailSent: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default model('Subscription', subscriptionSchema);