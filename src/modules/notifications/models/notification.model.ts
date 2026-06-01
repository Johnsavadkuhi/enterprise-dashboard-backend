import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { NOTIFICATION_PRIORITIES, NOTIFICATION_PRIORITY_VALUES } from "@/constants/notifications";

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: NOTIFICATION_PRIORITY_VALUES, default: NOTIFICATION_PRIORITIES.MEDIUM },
    isRead: { type: Boolean, default: false },
    actionUrl: { type: String },
    entityId: { type: String },
  },
  { timestamps: true }
);

export type NotificationDocument = InferSchemaType<typeof notificationSchema> & { _id: mongoose.Types.ObjectId };
export const NotificationModel = mongoose.model<NotificationDocument>("Notification", notificationSchema);
