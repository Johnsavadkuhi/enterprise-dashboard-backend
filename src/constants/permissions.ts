export const PERMISSIONS = {
  ADMIN_DASHBOARD_READ: "admin.dashboard.read",
  PENTEST_DASHBOARD_READ: "pentest.dashboard.read",
  DEVOPS_DASHBOARD_READ: "devops.dashboard.read",
  REPRESENTATIVE_DASHBOARD_READ: "representative.dashboard.read",
  QA_DASHBOARD_READ: "qa.dashboard.read",

  PROJECTS_READ: "projects.read",
  PROJECTS_CREATE: "projects.create",
  PROJECTS_UPDATE: "projects.update",
  PROJECTS_DELETE: "projects.delete",
  PROJECTS_ASSIGN_USERS: "projects.assign_users",
  PROJECTS_MANAGE_SECURITY: "projects.manage.security",
  PROJECTS_MANAGE_QA: "projects.manage.qa",

  USERS_READ: "users.read",
  USERS_CREATE: "users.create",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",
  AUDIT_LOGS_READ: "audit_logs.read",

  VULNERABILITIES_READ: "vulnerabilities.read",
  VULNERABILITIES_CREATE: "vulnerabilities.create",
  VULNERABILITIES_UPDATE: "vulnerabilities.update",
  VULNERABILITIES_DELETE: "vulnerabilities.delete",
  REPORTS_EXPORT: "reports.export",

  DEPLOYMENTS_READ: "deployments.read",
  DEPLOYMENTS_CREATE: "deployments.create",
  SERVERS_READ: "servers.read",

  TICKETS_READ: "tickets.read",
  TICKETS_CREATE: "tickets.create",
  TICKETS_UPDATE: "tickets.update",

  QA_TEST_CASES_READ: "qa.testcases.read",
  QA_TEST_CASES_CREATE: "qa.testcases.create",
  QA_TEST_CASES_UPDATE: "qa.testcases.update",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
