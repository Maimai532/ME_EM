import { Router } from "express";
import { getCloudinarySignature, getB2UploadUrl } from "./upload.controller.js";
import { protect, adminOnly } from "../../shared/middleware/authMiddleware.js";

const router = Router();

router.get("/cloudinary-signature", protect, getCloudinarySignature);
router.get("/b2-upload-url", protect, getB2UploadUrl);

export default router;