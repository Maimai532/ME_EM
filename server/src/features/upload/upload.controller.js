import { signCloudinaryUpload, createB2UploadUrl } from "./upload.service.js";

export const getCloudinarySignature = (req, res) => {
  try {
    const folder = req.query.folder || "songs";
    const data = signCloudinaryUpload(folder);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getB2UploadUrl = async (req, res) => {
  try {
    const { fileName, mimeType, folder } = req.query;
    const data = await createB2UploadUrl(fileName, mimeType, folder || "audio");
    res.json({ success: true, data });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};