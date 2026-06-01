import type { RequestHandler } from "express";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { writeAuditLog } from "@/modules/audit/services/audit.service";
import { sendSuccess } from "@/utils/response";
import { NotificationModel } from "../models/notification.model";

export const getNotifications: RequestHandler = async (req, res, next) => {
  try {
    const notifications = await NotificationModel.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(50);

    sendSuccess(
      res,
      notifications.map((item) => ({
        id: item._id.toString(),
        type: item.type,
        title: item.title,
        message: item.message,
        priority: item.priority,
        isRead: item.isRead,
        userId: String(item.userId),
        projectId: item.projectId ? String(item.projectId) : undefined,
        entityId: item.entityId,
        actionUrl: item.actionUrl,
        createdAt: item.createdAt,
      }))
    );
  } catch (error) {
    next(error);
  }
};

export const markAsRead: RequestHandler = async (req, res, next) => {
  try {
    const notificationId = String(req.params.id);
    await NotificationModel.updateOne({ _id: notificationId, userId: req.user!.id }, { isRead: true });
    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.NOTIFICATION_MARK_READ,
      entityType: AUDIT_ENTITY_TYPES.NOTIFICATION,
      entityId: notificationId,
    });
    sendSuccess(res, { id: notificationId, isRead: true });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead: RequestHandler = async (req, res, next) => {
  try {
    await NotificationModel.updateMany({ userId: req.user!.id, isRead: false }, { isRead: true });
    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.NOTIFICATION_MARK_ALL_READ,
      entityType: AUDIT_ENTITY_TYPES.NOTIFICATION,
      metadata: { userId: req.user!.id },
    });
    sendSuccess(res, { isRead: true });
  } catch (error) {
    next(error);
  }
};
