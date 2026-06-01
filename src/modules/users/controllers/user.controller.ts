import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { HTTP_STATUS } from "@/constants/http";
import { writeAuditLog } from "@/modules/audit/services/audit.service";
import { sendSuccess } from "@/utils/response";
import { UserModel } from "../models/user.model";

export const getUsers: RequestHandler = async (_req, res, next) => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 });
    sendSuccess(res, users.map((user) => user.toAuthJSON()));
  } catch (error) {
    next(error);
  }
};

export const updateUserRolesPermissions: RequestHandler = async (req, res, next) => {
  try {
    const userId = String(req.params.id);
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          roles: req.body.roles,
          customPermissions: req.body.customPermissions || [],
        },
        $inc: { sessionVersion: 1 },
      },
      { new: true }
    );

    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.USER_ROLES_UPDATE,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: userId,
      metadata: { roles: req.body.roles, customPermissions: req.body.customPermissions || [] },
    });

    sendSuccess(res, user?.toAuthJSON());
  } catch (error) {
    next(error);
  }
};

export const createUser: RequestHandler = async (req, res, next) => {
  try {
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await UserModel.create({ ...req.body, passwordHash });
    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.USER_CREATE,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: user._id.toString(),
    });
    sendSuccess(res, user.toAuthJSON(), HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};
