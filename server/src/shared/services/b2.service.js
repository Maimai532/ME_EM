// b2.service.js
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";

// Kết nối B2 qua S3-compatible API
const s3 = new S3Client({
  region: "us-east-005",
  endpoint: process.env.B2_ENDPOINT,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APP_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const BUCKET = process.env.B2_BUCKET_NAME;

export const uploadToB2 = async (fileBuffer, fileName, mimeType, folder) => {
  const key = `${folder}/${Date.now()}-${fileName}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    }),
  );
  return key;
};

export const getPresignedUrl = async (key, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn });
};

export const deleteFromB2 = async (key) => {
  if (!key) return;
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      }),
    );
  } catch (e) {
    console.warn("Không xoá được file B2:", e.message);
  }
};

export const uploadSongMedia = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "audio" && !file.mimetype.startsWith("audio/")) {
      return cb(new Error("Chỉ chấp nhận file audio"));
    }
    if (file.fieldname === "image" && !file.mimetype.startsWith("image/")) {
      return cb(new Error("Chỉ chấp nhận file ảnh"));
    }
    cb(null, true);
  },
});

export const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Chỉ chấp nhận file ảnh"));
    }
    cb(null, true);
  },
});
export const getPresignedUploadUrl = async (fileName, mimeType, folder) => {
  const key = `${folder}/${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
  });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return { uploadUrl, key };
};