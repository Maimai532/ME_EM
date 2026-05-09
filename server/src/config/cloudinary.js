import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Kết nối với Cloudinary bằng thông tin trong .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Dùng 1 middleware duy nhất cho multipart/form-data để tránh đọc stream 2 lần.
const songMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    if (file.fieldname === "audio") {
      return {
        folder: "me_em/audio",
        resource_type: "video", // audio trên Cloudinary phải dùng resource_type=video
      };
    }

    return {
      folder: "me_em/images",
      resource_type: "image",
    };
  },
});

export const uploadSongMedia = multer({ storage: songMediaStorage });

export default cloudinary;