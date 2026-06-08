import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { PERMISSIONS, type Permission } from "@/constants/permissions";
import { ROLES, type Role } from "@/constants/roles";

const roleSchema = new Schema(
  {
    key: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      unique: true,
      immutable: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    permissions: {
      type: [String],
      enum: Object.values(PERMISSIONS),
      default: [],
    },
    isSystem: { type: Boolean, default: true },
  },
  { timestamps: true }
);

roleSchema.pre("validate", function () {
  this.permissions = Array.from(new Set(this.permissions as Permission[]));
});

export type RoleDocument = InferSchemaType<typeof roleSchema> & {
  _id: mongoose.Types.ObjectId;
  key: Role;
  permissions: Permission[];
};

export const RoleModel = mongoose.model<RoleDocument>("Role", roleSchema);
