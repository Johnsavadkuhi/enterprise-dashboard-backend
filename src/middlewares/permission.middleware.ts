import type { RequestHandler } from "express";
import { HTTP_STATUS } from "@/constants/http";
import type { Permission } from "@/constants/permissions";
import { AppError } from "@/utils/AppError";

export function requirePermission(...permissions: Permission[]): RequestHandler {
  return (req, _res, next) => {
    const userPermissions = req.user?.permissions || [];
    const allowed = permissions.every((permission) => userPermissions.includes(permission));

    if (!allowed) {
      return next(new AppError("Forbidden: missing permission", HTTP_STATUS.FORBIDDEN));
    }

    next();
  };
}
