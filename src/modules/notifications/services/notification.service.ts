import { NotificationModel } from "../models/notification.model";
import { type NotificationPriority, type NotificationType } from "@/constants/notifications";
import { SOCKET_EVENTS, SOCKET_ROOMS } from "@/constants/socket";
import { getIO } from "@/realtime/socket/server";

type CreateNotificationInput = {
  userId: string;
  projectId?: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  entityId?: string;
};

export async function createNotification(input: CreateNotificationInput) {
  const notification = await NotificationModel.create({
    ...input,
    isRead: false,
  });

  const payload = {
    id: notification._id.toString(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    priority: notification.priority,
    isRead: notification.isRead,
    userId: String(notification.userId),
    projectId: notification.projectId ? String(notification.projectId) : undefined,
    entityId: notification.entityId,
    actionUrl: notification.actionUrl,
    createdAt: notification.createdAt,
  };

  getIO().to(SOCKET_ROOMS.USER(input.userId)).emit(SOCKET_EVENTS.NOTIFICATION_NEW, payload);

  if (input.projectId) {
    getIO().to(SOCKET_ROOMS.PROJECT(input.projectId)).emit(SOCKET_EVENTS.NOTIFICATION_NEW, payload);
  }

  return payload;
}
