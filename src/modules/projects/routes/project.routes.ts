import { Router } from "express";
import { ROUTES } from "@/constants/routes";
import { requireAuth } from "@/middlewares/auth.middleware";
import { requirePermission } from "@/middlewares/permission.middleware";
import { requireProjectAccess } from "@/middlewares/projectAccess.middleware";
import { PERMISSIONS } from "@/constants/permissions";
import { validate } from "@/middlewares/validate.middleware";
import { assignUsersSchema, createProjectSchema } from "../validators/project.validators";
import { assignUsersToProject, createProject, getProjects } from "../controllers/project.controller";

const router = Router();

router.use(requireAuth);
router.get(ROUTES.ROOT, requirePermission(PERMISSIONS.PROJECTS_READ), getProjects);
router.post(ROUTES.ROOT, requirePermission(PERMISSIONS.PROJECTS_CREATE), validate(createProjectSchema), createProject);
router.post(
  ROUTES.PROJECTS.ASSIGN_USERS,
  requireProjectAccess("params.id"),
  requirePermission(PERMISSIONS.PROJECTS_ASSIGN_USERS),
  validate(assignUsersSchema),
  assignUsersToProject
);

export default router;
