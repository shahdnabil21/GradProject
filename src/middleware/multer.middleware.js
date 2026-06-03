import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AppError from "../utils/appError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");
const uploadPath = path.join(projectRoot, "uploads/subscriptions");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Dynamically create folder if it doesn't exist to prevent ENOENT crashes
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
       // cb(new AppError("Only images are allowed",400), false);
       cb(null, false)
    }
};

export const uploadSubscriptionDocs = multer({
    storage,
    fileFilter,
     limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 3,
    }, 
}); 

