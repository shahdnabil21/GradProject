import jwt from "jsonwebtoken";
import  User  from "../DB/model/user.model.js";
import AppError from "../utils/appError.js";
import { MESSAGES } from "../constant/message.constant.js";

export const isAuthenticated = async (req, res, next) => {
    try {
        const { authorization } = req.headers;

        if (!authorization) {
            return next(new AppError("You are not logged in. Please log in first.", 401));
        }
        //Verify token
        // const payload = jwt.verify(authorization, process.env.JWT_SECRET);
        const token = authorization.split(" ")[1];

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
        console.log("❌ isAuthenticated threw:", error.message);
        next(error);
    }
};