import { Router } from "express";
import { ROUTES } from "@/constants/routes";
import { requireAuth } from "@/middlewares/auth.middleware";
import { requireAnyPermission, requirePermission } from "@/middlewares/permission.middleware";
import { requireProjectAccess } from "@/middlewares/projectAccess.middleware";
import { PERMISSIONS } from "@/constants/permissions";
import { validate } from "@/middlewares/validate.middleware";
import { assignUsersSchema, createProjectSchema } from "../validators/project.validators";
import { assignUsersToProject, createProject, getProjects } from "../controllers/project.controller";

const router = Router();

router.use(requireAuth);
router.get(
  ROUTES.ROOT,
  requireAnyPermission(
    PERMISSIONS.PENTEST_PROJECT_READ,
    PERMISSIONS.QA_PROJECT_READ,
    PERMISSIONS.DEVOPS_PROJECT_READ,
    PERMISSIONS.REPRESENTATIVE_PROJECT_READ,
    PERMISSIONS.SPM_PROJECT_READ,
    PERMISSIONS.QPM_PROJECT_READ
  ),
  getProjects
);
router.post(ROUTES.ROOT, requirePermission(PERMISSIONS.ADMIN_PROJECT_CREATE), validate(createProjectSchema), createProject);
router.post(
  ROUTES.PROJECTS.ASSIGN_USERS,
  requireProjectAccess("params.id"),
  requireAnyPermission(PERMISSIONS.SPM_PROJECT_ASSIGN_USERS, PERMISSIONS.QPM_PROJECT_ASSIGN_USERS),
  validate(assignUsersSchema),
  assignUsersToProject
);

export default router;
