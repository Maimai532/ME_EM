import cloudinary from "../../shared/services/cloudinary.service.js";
import { getPresignedUploadUrl } from "../../shared/services/b2.service.js";

// Ký request để client upload ảnh thẳng lên Cloudinary (signed upload)
export const signCloudinaryUpload = (folder = "songs") => {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET,
  );
  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
  };
};

// Tạo presigned URL để client PUT audio thẳng lên B2
export const createB2UploadUrl = async (fileName, mimeType, folder = "audio") => {
  if (!fileName || !mimeType) {
    const err = new Error("Thiếu fileName hoặc mimeType");
    err.statusCode = 400;
    throw err;
  }
  return getPresignedUploadUrl(fileName, mimeType, folder);
};