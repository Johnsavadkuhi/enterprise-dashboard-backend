import { Router } from "express";
import { ROUTES } from "@/constants/routes";
import { requireAuth } from "@/middlewares/auth.middleware";
import { requirePermission } from "@/middlewares/permission.middleware";
import { PERMISSIONS } from "@/constants/permissions";
import { createUser, getUsers, updateUserRolesPermissions } from "../controllers/user.controller";

const router = Router();

router.use(requireAuth);
router.get(ROUTES.ROOT, requirePermission(PERMISSIONS.USERS_READ), getUsers);
router.post(ROUTES.ROOT, requirePermission(PERMISSIONS.USERS_CREATE), createUser);
router.patch(ROUTES.USERS.ROLES_PERMISSIONS, requirePermission(PERMISSIONS.USERS_UPDATE), updateUserRolesPermissions);

export default router;
