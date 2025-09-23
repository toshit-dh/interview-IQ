import multer from "multer";
import streamifier from "streamifier";
import { v2 as cloudinary} from 'cloudinary'

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToCloudinary = async (req, res, next) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
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
