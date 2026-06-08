import { Router } from "express";
import { ROUTES } from "@/constants/routes";
import { requireAuth } from "@/middlewares/auth.middleware";
import { requirePermission } from "@/middlewares/permission.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { PERMISSIONS } from "@/constants/permissions";
import {
  createUser,
  getRolesPermissions,
  getUsers,
  updateRolePermissionsForDashboard,
  updateUserRolesPermissions,
} from "../controllers/user.controller";
import { updateRolePermissionsSchema, updateUserRolesPermissionsSchema } from "../validators/user.validators";

const router = Router();

router.use(requireAuth);
router.get(ROUTES.ROOT, requirePermission(PERMISSIONS.USERS_READ), getUsers);
router.post(ROUTES.ROOT, requirePermission(PERMISSIONS.USERS_CREATE), createUser);
router.get(ROUTES.USERS.ROLES, requirePermission(PERMISSIONS.USERS_READ), getRolesPermissions);
router.patch(
  ROUTES.USERS.ROLE_PERMISSIONS,
  requirePermission(PERMISSIONS.USERS_UPDATE),
  validate(updateRolePermissionsSchema),
  updateRolePermissionsForDashboard
);
router.patch(
  ROUTES.USERS.ROLES_PERMISSIONS,
  requirePermission(PERMISSIONS.USERS_UPDATE),
  validate(updateUserRolesPermissionsSchema),
  updateUserRolesPermissions
);

export default router;
