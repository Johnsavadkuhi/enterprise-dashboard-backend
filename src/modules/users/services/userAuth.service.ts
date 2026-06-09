import { getPermissionMapForRoles } from "./role.service";
import { normalizeRoles, resolveUserPermissions, type UserDocument } from "../models/user.model";

export async function toAuthUserContext(user: UserDocument) {
  const roles = normalizeRoles(user);
  console.log(" roles from normalize Role  : " ,  roles )
  const rolePermissions = await getPermissionMapForRoles(roles);
  console.log("rolePermissions : "  , rolePermissions)
  const permissions = resolveUserPermissions(user, Object.values(rolePermissions).flat());
  const projectIds = user.projectIds?.length ? user.projectIds : user.userProject || [];

  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    avatarUrl: user.avatarUrl,
    roles,
    permissions,
    permissionOverrides: user.permissionOverrides || { allow: [], deny: [] },
    sessionVersion: user.sessionVersion || 0,
    projectIds: projectIds.map(String),
  };
}
