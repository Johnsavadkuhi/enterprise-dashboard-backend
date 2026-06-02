import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { ROLES, type Role } from "@/constants/roles";
import { getPermissionsFromRoles } from "@/constants/rolePermissions";

type LegacyRoles = {
  User?: number;
  Admin?: number;
};

type UserLike = {
  roles?: Role[] | LegacyRoles;
  devOps?: boolean;
  security?: boolean;
  qualityAssurance?: boolean;
};

function nameParts(name?: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "User",
    lastName: parts.slice(1).join(" ") || parts[0] || "User",
  };
}

function normalizeRoles(user: UserLike): Role[] {
  const legacyRoles = user.roles;
  const roles = new Set<Role>();

  if (Array.isArray(legacyRoles)) {
    legacyRoles.forEach((role) => roles.add(role));
  } else {
    if (legacyRoles?.Admin) roles.add(ROLES.ADMIN);
    if (legacyRoles?.User) roles.add(ROLES.REPRESENTATIVE);
  }

  if (user.devOps) roles.add(ROLES.DEVOPS);
  if (user.security) roles.add(ROLES.PENTESTER);
  if (user.qualityAssurance) roles.add(ROLES.QA);

  if (!roles.size) roles.add(ROLES.PENTESTER);

  return Array.from(roles);
}

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    refreshToken: { type: [String], default: [] },
    profileImageUrl: { type: String },
    avatarUrl: { type: String },
    roles: { type: Schema.Types.Mixed, default: [ROLES.PENTESTER] },
    customPermissions: { type: [String], default: [] },
    status: { type: String, default: "Active" },
    score: { type: Number, default: 0 },
    devOps: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
    qualityAssurance: { type: Boolean, default: false },
    userProject: [{ type: Schema.Types.ObjectId, ref: "ProjectUser" }],
    projectIds: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    sessionVersion: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("validate", function () {
  if (!this.name) this.name = [this.firstName, this.lastName].filter(Boolean).join(" ");

  if (!this.firstName || !this.lastName) {
    const fallbackName = this.name || this.username || undefined;
    const { firstName, lastName } = nameParts(fallbackName);
    this.firstName ||= firstName;
    this.lastName ||= lastName;
  }

  if (!this.username) this.username = `${this.firstName}.${this.lastName}`.toLowerCase();
  if (!this.avatarUrl && this.profileImageUrl) this.avatarUrl = this.profileImageUrl;
  if (!this.profileImageUrl && this.avatarUrl) this.profileImageUrl = this.avatarUrl;
  if (this.isActive === undefined) this.isActive = this.status !== "Inactive";
});

userSchema.methods.toAuthJSON = function () {
  const roles = normalizeRoles(this);
  const rolePermissions = getPermissionsFromRoles(roles);
  const permissions = Array.from(new Set([...rolePermissions, ...(this.customPermissions || [])]));
  const projectIds = this.projectIds?.length ? this.projectIds : this.userProject || [];

  return {
    id: this._id.toString(),
    name: this.name || [this.firstName, this.lastName].filter(Boolean).join(" "),
    username: this.username,
    avatarUrl: this.avatarUrl || this.profileImageUrl,
    roles,
    permissions,
    sessionVersion: this.sessionVersion || 0,
    projectIds: projectIds.map(String),
  };
};

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
  toAuthJSON: () => Express.UserContext & { name: string; avatarUrl?: string };
};

export const UserModel = mongoose.model<UserDocument>("User", userSchema);
