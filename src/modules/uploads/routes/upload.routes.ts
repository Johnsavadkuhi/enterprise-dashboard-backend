import crypto from "crypto";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { Router } from "express";
import multer from "multer";
import { HTTP_STATUS } from "@/constants/http";
import { ROUTES } from "@/constants/routes";
import { UPLOADS } from "@/constants/uploads";
import { env } from "@/config/env";
import { AppError } from "@/utils/AppError";
import { uploadAvatar } from "../controllers/upload.controller";

const uploadDir = path.resolve(env.uploadDir);

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: UPLOADS.MAX_IMAGE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith(UPLOADS.IMAGE_MIME_PREFIX)) {
      cb(new AppError("Only image uploads are allowed", HTTP_STATUS.BAD_REQUEST));
      return;
    }

    cb(null, true);
  },
});

const router = Router();

router.post(
  ROUTES.UPLOAD.AVATAR,
  upload.fields([
    { name: UPLOADS.AVATAR_FIELD, maxCount: 1 },
    { name: UPLOADS.AVATAR_FIELD_ALIAS, maxCount: 1 },
  ]),
  (req, _res, next) => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    req.file = files?.[UPLOADS.AVATAR_FIELD]?.[0] || files?.[UPLOADS.AVATAR_FIELD_ALIAS]?.[0];
    next();
  },
  uploadAvatar
);

export default router;
