import { PERMISSIONS, type Permission } from "@/constants/permissions";
import { ROLE_PERMISSIONS } from "@/constants/rolePermissions";
import { ROLES, type Role } from "@/constants/roles";
import { RoleModel, type RoleDocument } from "../models/role.model";

const ROLE_NAMES: Record<Role, string> = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.PENTESTER]: "Pentester",
  [ROLES.DEVOPS]: "DevOps",
  [ROLES.REPRESENTATIVE]: "Representative",
  [ROLES.QA]: "QA",
  [ROLES.PROJECT_MANAGER_SECURITY]: "Project Manager Security",
  [ROLES.PROJECT_MANAGER_QA]: "Project Manager QA",
};

function toRoleResponse(role: RoleDocument) {
  return {
    id: role._id.toString(),
    key: role.key,
    name: role.name,
    description: role.description,
    permissions: role.permissions,
    isSystem: role.isSystem,
  };
}

export async function ensureDefaultRoles() {
  await Promise.all(
    Object.values(ROLES).map((role) =>
      RoleModel.updateOne(
        { key: role },
        {
          $setOnInsert: {
            key: role,
            name: ROLE_NAMES[role],
            permissions: ROLE_PERMISSIONS[role] || [],
            isSystem: true,
          },
        },
        { upsert: true, runValidators: true }
      )
    )
  );
}

export async function getRolesForDashboard() {
  await ensureDefaultRoles();
  const roles = await RoleModel.find().sort({ name: 1 });
  return roles.map(toRoleResponse);
}

export async function updateRolePermissions(role: Role, permissions: Permission[]) {
  const updated = await RoleModel.findOneAndUpdate(
    { key: role },
    {
      $set: {
        name: ROLE_NAMES[role],
        permissions: Array.from(new Set(permissions)),
        isSystem: true,
      },
      $setOnInsert: { key: role },
    },
    { new: true, upsert: true, runValidators: true }
  );

  return toRoleResponse(updated);
}

export async function getPermissionsForRoles(roles: Role[] = []) {
  const uniqueRoles = Array.from(new Set(roles));
  const roleDocs = await RoleModel.find({ key: { $in: uniqueRoles } });
  const permissionsByRole = new Map<Role, Permission[]>(roleDocs.map((role) => [role.key, role.permissions]));

  return Array.from(
    new Set(
      uniqueRoles.flatMap((role) => {
        const savedPermissions = permissionsByRole.get(role);
        return savedPermissions || ROLE_PERMISSIONS[role] || [];
      })
    )
  );
}

export function getAllPermissionOptions() {
  return Object.values(PERMISSIONS);
}
