import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { ROLES, type Role } from "@/constants/roles";
import { PERMISSIONS, type Permission } from "@/constants/permissions";
import { getPermissionsFromRoles } from "@/constants/rolePermissions";

type LegacyRoles = {
  User?: number;
  Admin?: number;
};

export type UserLike = {
  roles?: Role[] | LegacyRoles;
  customPermissions?: Permission[];
  permissionOverrides?: {
    allow?: Permission[];
    deny?: Permission[];
  } | null;
  devOps?: boolean;
  security?: boolean;
  qualityAssurance?: boolean;
};

function identityParts(value?: string) {
  const parts = (value || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "User",
    lastName: parts.slice(1).join(" ") || parts[0] || "User",
  };
}

export function normalizeRoles(user: UserLike): Role[] {
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

function uniquePermissions(permissions: Permission[] = []) {
  return Array.from(new Set(permissions));
}

export function resolveUserPermissions(user: UserLike, basePermissions = getPermissionsFromRoles(normalizeRoles(user))): Permission[] {
  const permissions = new Set<Permission>([
    ...basePermissions,
    ...(user.customPermissions || []),
    ...(user.permissionOverrides?.allow || []),
  ]);

  for (const permission of user.permissionOverrides?.deny || []) {
    permissions.delete(permission);
  }

  return Array.from(permissions);
}

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    avatarUrl: { type: String },
    roles: {
      type: [String],
      enum: Object.values(ROLES),
      default: [ROLES.PENTESTER],
      validate: {
        validator: (roles: string[]) => roles.length > 0,
        message: "A user must have at least one role",
      },
    },
    permissionOverrides: {
      allow: {
        type: [String],
        enum: Object.values(PERMISSIONS),
        default: [],
      },

      deny: {
        type: [String],
        enum: Object.values(PERMISSIONS),
        default: [],
      },
    },
    customPermissions: {
      type: [String],
      enum: Object.values(PERMISSIONS),
      default: [],
    },
    status: { type: String, default: "Active" },
    score: { type: Number, default: 0 },
    devOps: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
    qualityAssurance: { type: Boolean, default: false },
    userProject: [{ type: Schema.Types.ObjectId, ref: "ProjectAssignment" }],
    projectIds: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    sessionVersion: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("validate", function () {
  if (!this.firstName || !this.lastName) {
    const fallbackName = this.username || undefined;
    const { firstName, lastName } = identityParts(fallbackName);
    this.firstName ||= firstName;
    this.lastName ||= lastName;
  }

  if (!this.username) this.username = `${this.firstName}.${this.lastName}`.toLowerCase();
  if (this.isActive === undefined) this.isActive = this.status !== "Inactive";
  this.roles = Array.from(new Set(normalizeRoles(this as UserLike)));
  this.customPermissions = uniquePermissions(this.customPermissions as Permission[]);
  this.permissionOverrides = {
    allow: uniquePermissions(this.permissionOverrides?.allow as Permission[]),
    deny: uniquePermissions(this.permissionOverrides?.deny as Permission[]),
  };
});

userSchema.methods.toAuthJSON = function () {
  const roles = normalizeRoles(this);
  const permissions = resolveUserPermissions(this as UserLike);
  const projectIds = this.projectIds?.length ? this.projectIds : this.userProject || [];

  return {
    id: this._id.toString(),
    firstName: this.firstName,
    lastName: this.lastName,
    username: this.username,
    avatarUrl: this.avatarUrl,
    roles,
    permissions,
    permissionOverrides: this.permissionOverrides || { allow: [], deny: [] },
    sessionVersion: this.sessionVersion || 0,
    projectIds: projectIds.map(String),
  };
};

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
  toAuthJSON: () => Express.UserContext & { firstName: string; lastName: string; avatarUrl?: string };
};

export const UserModel = mongoose.model<UserDocument>("User", userSchema);
