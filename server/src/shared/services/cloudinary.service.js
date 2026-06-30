import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const isCloudinaryUrl = (url = "") =>
  url.includes("res.cloudinary.com") &&
  url.includes(process.env.CLOUDINARY_CLOUD_NAME);

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    console.warn("Không xoá được ảnh Cloudinary:", e.message);
  }
};

export const ensureCloudinaryUrl = async (url, folder) => {
  if (!url) return null;
  if (isCloudinaryUrl(url)) return null;

  try {
    const result = await cloudinary.uploader.upload(url, {
      folder,
      resource_type: "image",
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (err) {
    console.warn("Upload Cloudinary thất bại, giữ link gốc:", err.message);
    return { url, publicId: null };
  }
};

// ─── Multer middleware upload avatar user thẳng lên Cloudinary ───
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "users",
    resource_type: "image",
  },
});

export const uploadAvatar = multer({ storage: avatarStorage });

export default cloudinary;