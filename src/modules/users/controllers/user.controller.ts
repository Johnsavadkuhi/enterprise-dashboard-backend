import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { HTTP_STATUS } from "@/constants/http";
import type { Role } from "@/constants/roles";
import type { Permission } from "@/constants/permissions";
import { writeAuditLog } from "@/modules/audit/services/audit.service";
import { AppError } from "@/utils/AppError";
import { sendSuccess } from "@/utils/response";
import { UserModel } from "../models/user.model";
import {
  getAllPermissionOptions,
  getRolesForDashboard,
  syncRolePermissionsFromConstants,
  updateRolePermissions,
} from "../services/role.service";
import { getDefaultPermissionsForRoles, toAuthUserContext, upsertUserPermissions } from "../services/userAuth.service";

async function getPermissionsForUserUpdate(roles: Role[], permissions?: Permission[]) {
  return Array.isArray(permissions) ? permissions : getDefaultPermissionsForRoles(roles);
}

export const getUsers: RequestHandler = async (_req, res, next) => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 });
    sendSuccess(
      res,
      await Promise.all(users.map((user) => toAuthUserContext(user)))
    );
  } catch (error) {
    next(error);
  }
};

export const updateUserRolesPermissions: RequestHandler = async (req, res, next) => {
  try {
    const userId = String(req.params.id || req.params.userId);
    const roles = req.body.roles as Role[];
    const permissions = await getPermissionsForUserUpdate(roles, req.body.permissions);

    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          roles,
        },
        $inc: { sessionVersion: 1 },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    await upsertUserPermissions(userId, permissions);

    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.USER_ROLES_UPDATE,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: userId,
      metadata: { roles, permissions },
    });

    sendSuccess(res, await toAuthUserContext(user));
  } catch (error) {
    next(error);
  }
};

export const createUser: RequestHandler = async (req, res, next) => {
  try {
    const password = await bcrypt.hash(req.body.password, 12);
    const { permissions: requestedPermissions, ...userInput } = req.body;
    const user = await UserModel.create({ ...userInput, password });
    const roles = user.roles as Role[];
    const permissions = await getPermissionsForUserUpdate(roles, requestedPermissions);
    await upsertUserPermissions(user._id.toString(), permissions);

    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.USER_CREATE,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: user._id.toString(),
    });
    sendSuccess(res, await toAuthUserContext(user), HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

export const getRolesPermissions: RequestHandler = async (_req, res, next) => {
  try {
    sendSuccess(res, {
      roles: await getRolesForDashboard(),
      permissions: getAllPermissionOptions(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateRolePermissionsForDashboard: RequestHandler = async (req, res, next) => {
  try {
    const roleKey = String(req.params.key) as Role;
    const permissions = Array.isArray(req.body.permissions) ? req.body.permissions : [];
    const role = await updateRolePermissions(roleKey, permissions);

    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.USER_ROLES_UPDATE,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: roleKey,
      metadata: { role: roleKey, permissions },
    });

    sendSuccess(res, role);
  } catch (error) {
    next(error);
  }
};

export const syncRolePermissionsForDashboard: RequestHandler = async (req, res, next) => {
  try {
    const roles = await syncRolePermissionsFromConstants();

    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.USER_ROLES_UPDATE,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: "role-permissions",
      metadata: { roles: roles.map((role) => role.key) },
    });

    sendSuccess(res, {
      roles,
      permissions: getAllPermissionOptions(),
    });
  } catch (error) {
    next(error);
  }
};
