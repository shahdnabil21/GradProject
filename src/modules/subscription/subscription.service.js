import { Subscription } from "../../DB/model/index.js";
import User from "../../DB/model/user.model.js";
import AppError from "../../utils/appError.js";
import { MESSAGES } from "../../constant/message.constant.js";
import sendEmail from "../../utils/sendEmail.js";

export const createSubscriptionService = async (userId, files, duration) => {
  
  // 1. Check all 3 documents are uploaded
  const missingDocs = [];
  if (!files.nationalId?.[0]) missingDocs.push("National ID image");
  if (!files.university?.[0]) missingDocs.push("University paper");
  if (!files.address?.[0]) missingDocs.push("Address document");

  if (missingDocs.length > 0) {
    throw new AppError(
      `Submission incomplete. Missing: ${missingDocs.join(", ")}`,
      400,
    );
  }

  // 2. Check user has no pending subscription already
  const existingPending = await Subscription.findOne({
    userId,
    status: "pending",
  });

  if (existingPending) {
    throw new AppError(
      "You already have a pending subscription. Please wait for it to be reviewed.",
      400,
    );
  }

  // 3. Create the subscription in DB
  const subscription = await Subscription.create({
    userId,
    duration,
    nationalIdImage: files.nationalId[0].path,
    universityPaper: files.university[0].path,
    addressImage: files.address[0].path,
  });

  if (!subscription) {
    throw new AppError(MESSAGES.subscription.failToCreate, 500);
  }

  // 4. Get user data to send email
  const user = await User.findById(userId);

  await sendEmail({
    email: user.email,
    subject: "EasyMetro — Subscription Request Received",
    message: `Your subscription request for ${duration} months has been received. Please visit any Cairo Metro station have Subscription option within 2 days to pay the fees and collect your card. Bring your original National ID.`,
    html: `
            <h2>Cairo Metro Subscription Request</h2>
            <p>Dear ${user.name},</p>
            <p>Your subscription request has been received successfully.</p>
            <p><strong>Duration:</strong> ${duration} months</p>
            <p><strong>Status:</strong> Pending Review</p>
            <hr/>
            <p><strong>Next Steps:</strong></p>
            <p>Please visit any Cairo Metro station within <strong>2 days</strong> to pay the subscription fees and collect your metro card.</p>
            <p>Make sure to bring your <strong>original National ID</strong> when you visit.</p>
            <hr/>
            <p>Cairo Metro Team</p>
        `,
  });

  // 5. Mark email sent
  subscription.confirmationEmailSent = true;
  await subscription.save();
  return subscription;
};


export const reviewSubscriptionService = async (id, status, adminId, note) => {
  if (!["approved", "rejected"].includes(status)) {
    throw new AppError("Status must be approved or rejected", 400);
  }

  const subscription = await Subscription.findById(id);

  if (!subscription) {
    throw new AppError(MESSAGES.subscription.notFound, 404);
  }

  if (subscription.status !== "pending") {
    throw new AppError(
      `This subscription has already been ${subscription.status}`,
      400,
    );
  }

  subscription.status = status;
  subscription.reviewedBy = adminId;
  subscription.reviewNote = note || null;
  await subscription.save();

  return subscription;
};
