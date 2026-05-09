import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Kết nối với Cloudinary bằng thông tin trong .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình nơi lưu file audio
const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "me_em/audio",        // tên folder trên Cloudinary
    resource_type: "video",       // audio phải dùng "video" — Cloudinary quy định vậy
    allowed_formats: ["mp3", "wav", "ogg", "m4a"],
  },
});

// Cấu hình nơi lưu ảnh bìa
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "me_em/images",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// Tạo 2 middleware upload riêng biệt
export const uploadAudio = multer({ storage: audioStorage });
export const uploadImage = multer({ storage: imageStorage });

export default cloudinary;