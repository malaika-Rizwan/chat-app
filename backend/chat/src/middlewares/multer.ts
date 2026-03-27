import multer from "multer";

// Simple in-memory upload middleware.
// You can swap this later to Cloudinary/MulterStorage when you add those deps.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});
