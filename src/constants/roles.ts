export const ROLES = {
  ADMIN: "admin",
  PENTESTER: "pentester",
  DEVOPS: "devops",
  REPRESENTATIVE: "representative",
  QA: "qa",
  PROJECT_MANAGER_SECURITY: "project_manager_security",
  PROJECT_MANAGER_QA: "project_manager_qa",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
