import type { RequestHandler } from "express";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { HTTP_STATUS } from "@/constants/http";
import { NOTIFICATION_PRIORITIES, NOTIFICATION_TYPES } from "@/constants/notifications";
import { ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { ProjectModel } from "../models/project.model";
import { UserModel } from "@/modules/users/models/user.model";
import { writeAuditLog } from "@/modules/audit/services/audit.service";
import { createNotification } from "@/modules/notifications/services/notification.service";
import { sendSuccess } from "@/utils/response";

export const getProjects: RequestHandler = async (req, res, next) => {
  try {
    const isAdmin = req.user!.roles.includes(ROLES.ADMIN);
    const filter = isAdmin ? {} : { $or: [{ ownerId: req.user!.id }, { assignedUserIds: req.user!.id }] };
    const projects = await ProjectModel.find(filter).sort({ createdAt: -1 });
    sendSuccess(res, projects.map((p) => ({ ...p.toObject(), id: p._id.toString() })));
  } catch (error) {
    next(error);
  }
};

export const createProject: RequestHandler = async (req, res, next) => {
  try {
    const project = await ProjectModel.create({
      ...req.body,
      ownerId: req.user!.id,
      assignedUserIds: [],
    });

    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.PROJECT_CREATE,
      entityType: AUDIT_ENTITY_TYPES.PROJECT,
      entityId: project._id.toString(),
      metadata: { name: project.name, type: project.type },
    });

    sendSuccess(res, { ...project.toObject(), id: project._id.toString() }, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

export const assignUsersToProject: RequestHandler = async (req, res, next) => {
  try {
    const projectId = String(req.params.id);
    const { userIds } = req.body as { userIds: string[] };
    const project = await ProjectModel.findByIdAndUpdate(
      projectId,
      { $addToSet: { assignedUserIds: { $each: userIds } } },
      { new: true }
    );

    await UserModel.updateMany({ _id: { $in: userIds } }, { $addToSet: { projectIds: projectId } });

    await Promise.all(
      userIds.map((userId) =>
        createNotification({
          userId,
          projectId,
          type: NOTIFICATION_TYPES.PROJECT_ASSIGNED,
          title: "You were assigned to a project",
          message: `You have been assigned to ${project?.name || "a project"}.`,
          priority: NOTIFICATION_PRIORITIES.HIGH,
          actionUrl: ROUTES.FRONTEND.PROJECT_DETAILS(projectId),
        })
      )
    );

    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.PROJECT_ASSIGN_USERS,
      entityType: AUDIT_ENTITY_TYPES.PROJECT,
      entityId: projectId,
      metadata: { userIds },
    });

    sendSuccess(res, { project });
  } catch (error) {
    next(error);
  }
};
