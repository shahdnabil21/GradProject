import jwt from "jsonwebtoken";
import  User  from "../DB/model/user.model.js";
import AppError from "../utils/appError.js";
import { MESSAGES } from "../constant/message.constant.js";

export const isAuthenticated = async (req, res, next) => {
    try {
        let token = req.headers.authorization || req.headers.token;

        if (!token) {
            return next(new AppError("You are not logged in. Please log in first.", 401));
        }

        // Handle both "Bearer <token>" format and raw token formats
        if (token.startsWith("Bearer ")) {
            token = token.split(" ")[1];
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);

        //Find User
        const user = await User.findById(payload.id);

        if (!user) {
            return next(new AppError(MESSAGES.user.notFound, 404));
        }
         //Check account is active
        if (user.active === false) {
            return next(new AppError("This account has been deactivated.", 401));
        }

        //Check account is verified
        if (!user.isVerified) {
            return next(new AppError("Please verify your account first.", 401));
        }

        req.user = user
        next();
    } catch (error) {
        // console.log("❌ isAuthenticated threw:", error.message);
        next(error);
    }
};