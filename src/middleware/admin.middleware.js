import AppError from "../utils/appError.js";
import { MESSAGES } from "../constant/message.constant.js";

const ADMIN_EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@admin\.eg\.com$/;

export const isAdmin = (req, res, next) => {
    try {
        const { user } = req;

        if (!["admin", "superAdmin"].includes(user.role)) {
            return next(new AppError(MESSAGES.dashboard.accessDenied, 403));
        }

        if (!ADMIN_EMAIL_PATTERN.test(user.email)) {
            return next(new AppError(MESSAGES.dashboard.invalidAdminEmail, 403));
        }

        next();
    } catch (error) {
        next(error);
    }
};