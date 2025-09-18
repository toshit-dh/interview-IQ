import multer from "multer";
import cloudinary from "../utils/configCloudinary.js";
import streamifier from "streamifier";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToCloudinary = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "avatar" },
      (error, result) => {
        if (error) return next(error);
        req.file.public_id = result.public_id;
        req.file.cloudinaryUrl = result.secure_url;
        next();
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (error) {
    next(error);
  }
};

export { upload, uploadToCloudinary };
