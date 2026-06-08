import type { RequestHandler } from "express";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { HTTP_STATUS } from "@/constants/http";
import { UPLOADS } from "@/constants/uploads";
import { writeAuditLog } from "@/modules/audit/services/audit.service";
import { UserModel } from "@/modules/users/models/user.model";
import { toAuthUserContext } from "@/modules/users/services/userAuth.service";
import { AppError } from "@/utils/AppError";
import { sendSuccess } from "@/utils/response";

export const uploadAvatar: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("Avatar file is required", HTTP_STATUS.BAD_REQUEST);
    }

    const avatarUrl = UPLOADS.PUBLIC_PATH(req.file.filename);
    const user = req.user
      ? await UserModel.findByIdAndUpdate(
          req.user.id,
          { $set: { avatarUrl } },
          { new: true }
        )
      : null;

    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.UPLOAD_AVATAR,
      entityType: AUDIT_ENTITY_TYPES.UPLOAD,
      entityId: req.file.filename,
      metadata: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        userId: req.user?.id,
      },
    });

    sendSuccess(res, {
      avatarUrl,
      user: user ? await toAuthUserContext(user) : null,
    });
  } catch (error) {
    next(error);
  }
};
