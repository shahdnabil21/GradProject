import AppError from "../utils/appError.js";

export const isValid = (schema) => {
    return (req, res, next) => {
        try {
            const dataToValidate = {
                ...req.body,
                ...req.query,
                ...req.params,
            };
            
            const { error, value } = schema.validate(dataToValidate, {
                abortEarly: false,
                convert:true,
            });

            if (error) {
                const messages = error.details.map((err) => err.message).join(", ");
                return next(new AppError(messages, 400));
            }

            req.validData = value;
            next();
        } catch (error) {
            next(error);
        }
    };
};