import type { RequestHandler } from "express";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { HTTP_STATUS } from "@/constants/http";
import { NOTIFICATION_PRIORITIES, NOTIFICATION_TYPES } from "@/constants/notifications";
import { ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import type { Role } from "@/constants/roles";
import { ProjectModel } from "../models/project.model";
import { UserModel } from "@/modules/users/models/user.model";
import { writeAuditLog } from "@/modules/audit/services/audit.service";
import { createNotifications } from "@/modules/notifications/services/notification.service";
import {
  addConnectedUsersToProject,
  emitToProject,
} from "@/realtime/socket.delivery";
import { SOCKET_EVENTS } from "@/constants/socket";
import { AppError } from "@/utils/AppError";
import { sendSuccess } from "@/utils/response";
import { mapCreateProjectRequest } from "../services/project.mapper";
import { createProjectRequestSchema } from "../validators/project.validators";

type ProjectRecipientField = "projectManager" | "devops" | "representative";

const recipientRules: Record<
  ProjectRecipientField,
  { label: string; roles?: readonly Role[] }
> = {
  projectManager: {
    label: "project manager",
    // Project manager is a project-level responsibility, not a global RBAC role.
  },
  devops: { label: "DevOps", roles: [ROLES.DEVOPS] },
  representative: { label: "representative", roles: [ROLES.REPRESENTATIVE] },
};

async function validateProjectRecipients(
  recipients: Partial<Record<ProjectRecipientField, string>>
): Promise<void> {
  const entries = Object.entries(recipients).filter(
    (entry): entry is [ProjectRecipientField, string] => Boolean(entry[1])
  );
  const userIds = Array.from(new Set(entries.map(([, userId]) => userId)));
  if (!userIds.length) return;

  const users = await UserModel.find({ _id: { $in: userIds }, isActive: true })
    .select("_id roles devOps security qualityAssurance")
    .lean();
  const usersById = new Map(users.map((user) => [String(user._id), user]));

  for (const [field, userId] of entries) {
    const user = usersById.get(userId);
    if (!user) {
      throw new AppError(
        `Assigned ${recipientRules[field].label} was not found`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const effectiveRoles = new Set<Role>(user.roles);
    if (user.devOps) effectiveRoles.add(ROLES.DEVOPS);
    if (user.security) effectiveRoles.add(ROLES.PENTESTER);
    if (user.qualityAssurance) effectiveRoles.add(ROLES.QA);

    const requiredRoles = recipientRules[field].roles;
    const hasRequiredRole = !requiredRoles || requiredRoles.some((role) =>
      effectiveRoles.has(role)
    );
    if (!hasRequiredRole) {
      throw new AppError(
        `Assigned ${recipientRules[field].label} does not have the required role`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }
}

function buildProjectRecipientNotifications(
  recipients: Partial<Record<ProjectRecipientField, string>>,
  projectId: string,
  projectName: string
) {
  const rolesByUserId = new Map<string, string[]>();

  for (const [field, userId] of Object.entries(recipients)) {
    if (!userId) continue;

    const roles = rolesByUserId.get(userId) || [];
    roles.push(recipientRules[field as ProjectRecipientField].label);
    rolesByUserId.set(userId, roles);
  }

  return Array.from(rolesByUserId, ([userId, roles]) => ({
    userId,
    projectId,
    type: NOTIFICATION_TYPES.PROJECT_ASSIGNED,
    title: "New project assignment",
    message: `You were assigned to ${projectName} as ${roles.join(" and ")}.`,
    priority: NOTIFICATION_PRIORITIES.HIGH,
    actionUrl: ROUTES.FRONTEND.PROJECT_DETAILS(projectId),
    entityId: projectId,
  }));
}

function toProjectEvent(project: {
  _id: { toString(): string };
  projectName: string;
  type?: "security" | "quality" | "devops" | null;
  createdAt: Date;
}) {
  return {
    id: project._id.toString(),
    projectName: project.projectName,
    type: project.type || undefined,
    createdAt: project.createdAt,
  };
}

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
    const request = createProjectRequestSchema.parse(req.body);
    const projectData = mapCreateProjectRequest(request);
    const recipients = {
      projectManager: projectData.projectManager,
      devops: projectData.devops,
    };
    await validateProjectRecipients(recipients);
    const projectMemberIds = Array.from(
      new Set([req.user!.id, projectData.projectManager, projectData.devops])
    );

    const project = await ProjectModel.create({
      ...projectData,
      ownerId: req.user!.id,
    });
    const projectId = project._id.toString();

    await UserModel.updateMany(
      { _id: { $in: projectMemberIds } },
      { $addToSet: { projectIds: projectId } }
    );

    await createNotifications(
      buildProjectRecipientNotifications(recipients, projectId, project.projectName)
    );

    await addConnectedUsersToProject(projectMemberIds, projectId);
    emitToProject(projectId, SOCKET_EVENTS.PROJECT_CREATED, toProjectEvent(project));

    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.PROJECT_CREATE,
      entityType: AUDIT_ENTITY_TYPES.PROJECT,
      entityId: projectId,
      metadata: {
        projectName: project.projectName,
        type: project.type,
        projectManagerId: projectData.projectManager,
        devopsManagerId: projectData.devops,
      },
    });

    sendSuccess(res, { ...project.toObject(), id: project._id.toString() }, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

export const assignUsersToProject: RequestHandler = async (req, res, next) => {
  try {
    const projectId = String(req.params.id);
    const requestedUserIds = Array.from(
      new Set((req.body as { userIds: string[] }).userIds)
    );
    const existingProject = await ProjectModel.findById(projectId);
    if (!existingProject) {
      throw new AppError("Project not found", HTTP_STATUS.NOT_FOUND);
    }

    const activeUsers = await UserModel.find({
      _id: { $in: requestedUserIds },
      isActive: true,
    })
      .select("_id")
      .lean();
    if (activeUsers.length !== requestedUserIds.length) {
      throw new AppError(
        "One or more assigned users were not found or are inactive",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const existingUserIds = new Set(
      existingProject.assignedUserIds.map((userId) => String(userId))
    );
    const userIds = requestedUserIds.filter((userId) => !existingUserIds.has(userId));

    if (!userIds.length) {
      return sendSuccess(res, { project: existingProject, assignedUserIds: [] });
    }

    const project = await ProjectModel.findByIdAndUpdate(
      projectId,
      { $addToSet: { assignedUserIds: { $each: userIds } } },
      { new: true }
    );

    await UserModel.updateMany({ _id: { $in: userIds } }, { $addToSet: { projectIds: projectId } });

    await createNotifications(
      userIds.map((userId) => ({
        userId,
        projectId,
        type: NOTIFICATION_TYPES.PROJECT_ASSIGNED,
        title: "You were assigned to a project",
        message: `You have been assigned to ${project?.projectName || "a project"}.`,
        priority: NOTIFICATION_PRIORITIES.HIGH,
        actionUrl: ROUTES.FRONTEND.PROJECT_DETAILS(projectId),
        entityId: projectId,
      }))
    );

    await addConnectedUsersToProject(userIds, projectId);
    emitToProject(projectId, SOCKET_EVENTS.PROJECT_ASSIGNED, toProjectEvent(existingProject));

    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.PROJECT_ASSIGN_USERS,
      entityType: AUDIT_ENTITY_TYPES.PROJECT,
      entityId: projectId,
      metadata: { userIds },
    });

    sendSuccess(res, { project, assignedUserIds: userIds });
  } catch (error) {
    next(error);
  }
};
