import multer from "multer";
import fs from "node:fs";
import AppError from "../utils/appError.js";

const uploadPath = "uploads/subscriptions";

// Create folder if it doesn't exist(to Avoid any crash)
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
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

/* import multer from "multer"
import { randomUUID } from "node:crypto"
import { existsSync, mkdirSync } from "node:fs"
import {resolve} from"node:path"

export const fileValidation = {
    image:["image/jpeg", "image/png", "image/jpg"]
}
export const upload = (customPath = "general", validation= [],size=5)=>{
    const storage = multer.diskStorage({
        destination:function (req, file, cb){
            
            let filePath= resolve(`upload/${customPath}`)
            if(!existsSync(filePath)){
                mkdirSync(filePath,{recursive:true})
            }
            cb(null,filePath)
        },
        filename: function(req, file, cb){
            const uniqueFileName = randomUUID() + '_' + file.originalname
            file.finalPath = `upload/${customPath}/${uniqueFileName}`
            cb(null, uniqueFileName)
        },

    })

    const fileFilter = function (req, file, cb){
        if(!validation.includes(file.mimetype)){
            const err = new Error(`Invalid File Format this only accept${validation}`);
            err.status = 400;
            return cb(err,false)
        }
        cb(null,true)
    }
    
    return multer({fileFilter,storage, limits:{fileSize: size * 1024* 1024}})
} */