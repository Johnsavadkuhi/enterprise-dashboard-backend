import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { PROJECT_STATUS, PROJECT_STATUS_VALUES, PROJECT_TYPE_VALUES } from "@/constants/projects";

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: PROJECT_TYPE_VALUES, required: true },
    description: { type: String },
    status: { type: String, enum: PROJECT_STATUS_VALUES, default: PROJECT_STATUS.DRAFT },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedUserIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export type ProjectDocument = InferSchemaType<typeof projectSchema> & { _id: mongoose.Types.ObjectId };
export const ProjectModel = mongoose.model<ProjectDocument>("Project", projectSchema);
