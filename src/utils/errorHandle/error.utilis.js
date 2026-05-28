import {NODE_ENV} from "../../../config/config.service.js";

export const globalHandlingError = (error,req,res,next) => {
    const status = error.status || 500 ;
    if(error.message == "jwt expired") 
        error.message = "Token is expired, please login Again";
     res.status(status).json({
        error,
        error_message: error.message || "something went wrong",
        stack: NODE_ENV == "development" ? error.stack : undefined
    });
    // Multer file size error
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    // File type error (from fileFilter)
    if (err.message.includes("Only JPG")) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
    });
};

export const ErrorException = async ({message = "fail"}) => {
    const error = new Error(message);
    error.status = 500;
    throw error;
};

export const BadRequestException = async ({message = "bad Request"}) => {
    const error = new Error(message);
    error.status = 400;
    throw error;
};

export const UnauthorizedException = async ({message = "Unauthorized"}) => {
    const error = new Error(message);
    error.status = 401;
    throw error;
};

export const NotFoundException = async ({message = "Not found"}) => {
    const error = new Error(message);
    error.status = 404;
    throw error;
};

export const ConflictException = async ({message = "conflict"}) => {
    const error = new Error(message);
    error.status = 409;
    throw error;
};