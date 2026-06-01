import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { ROLES, type Role } from "@/constants/roles";
import { getPermissionsFromRoles } from "@/constants/rolePermissions";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    avatarUrl: { type: String },
    roles: {
      type: [String],
      enum: Object.values(ROLES),
      default: [ROLES.PENTESTER],
    },
    customPermissions: { type: [String], default: [] },
    projectIds: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    sessionVersion: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.toAuthJSON = function () {
  const roles = this.roles as Role[];
  const rolePermissions = getPermissionsFromRoles(roles);
  const permissions = Array.from(new Set([...rolePermissions, ...(this.customPermissions || [])]));

  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    avatarUrl: this.avatarUrl,
    roles,
    permissions,
    sessionVersion: this.sessionVersion || 0,
    projectIds: (this.projectIds || []).map(String),
  };
};

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
  toAuthJSON: () => Express.UserContext & { name: string; avatarUrl?: string };
};

export const UserModel = mongoose.model<UserDocument>("User", userSchema);
