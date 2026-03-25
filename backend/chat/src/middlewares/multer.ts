import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import {CloudinaryStorage} from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "chat-images",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
        transformation: [{ width: 800, height: 600, crop: "limit" },{quality: "auto"}],
        

        },as any as MulterOptions,
    },
});
export const upload = multer({ storage
    ,limits:{
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only images are allowed"), false);
        }
    },
 });
