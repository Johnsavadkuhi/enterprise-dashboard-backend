export const PERMISSIONS = {
  ADMIN_ALL: "admin.all",
  PENTEST_DASHBOARD_READ: "pentest.dashboard.read",
  DEVOPS_DASHBOARD_READ: "devops.dashboard.read",
  REPRESENTATIVE_DASHBOARD_READ: "representative.dashboard.read",
  QA_DASHBOARD_READ: "qa.dashboard.read",
  SPM_DASHBOARD_READ: "spm.dashboard.read",
  QPM_DASHBOARD_READ: "qpm.dashboard.read",

  ADMIN_USERS_READ: "admin.users.read",
  ADMIN_USERS_CREATE: "admin.users.create",
  ADMIN_USERS_UPDATE: "admin.users.update",
  ADMIN_USERS_DELETE: "admin.users.delete",
  ADMIN_ROLES_READ: "admin.roles.read",
  ADMIN_ROLES_UPDATE: "admin.roles.update",
  ADMIN_AUDIT_READ: "admin.audit.read",
  ADMIN_PROJECT_CREATE: "admin.project.create",

  PENTEST_PROJECT_READ: "pentest.project.read",
  PENTEST_VULNERABILITY_READ: "pentest.vulnerability.read",
  PENTEST_VULNERABILITY_CREATE: "pentest.vulnerability.create",
  PENTEST_VULNERABILITY_UPDATE: "pentest.vulnerability.update",
  PENTEST_VULNERABILITY_DELETE: "pentest.vulnerability.delete",
  PENTEST_REPORT_EXPORT: "pentest.report.export",

  QA_PROJECT_READ: "qa.project.read",
  QA_TEST_CASE_READ: "qa.testcase.read",
  QA_TEST_CASE_CREATE: "qa.testcase.create",
  QA_TEST_CASE_UPDATE: "qa.testcase.update",
  QA_VULNERABILITY_READ: "qa.vulnerability.read",

  DEVOPS_PROJECT_READ: "devops.project.read",
  DEVOPS_DEPLOYMENT_READ: "devops.deployment.read",
  DEVOPS_DEPLOYMENT_CREATE: "devops.deployment.create",
  DEVOPS_SERVER_READ: "devops.server.read",

  REPRESENTATIVE_PROJECT_READ: "representative.project.read",
  REPRESENTATIVE_TICKET_READ: "representative.ticket.read",
  REPRESENTATIVE_TICKET_CREATE: "representative.ticket.create",
  REPRESENTATIVE_TICKET_UPDATE: "representative.ticket.update",

  SPM_PROJECT_READ: "spm.project.read",
  SPM_PROJECT_UPDATE: "spm.project.update",
  SPM_PROJECT_ASSIGN_USERS: "spm.project.assign_users",
  SPM_PROJECT_MANAGE_SECURITY: "spm.project.manage_security",
  SPM_PENTEST_READ: "spm.pentest.read",
  SPM_VULNERABILITY_READ: "spm.vulnerability.read",
  SPM_REPORT_EXPORT: "spm.report.export",

  QPM_PROJECT_READ: "qpm.project.read",
  QPM_PROJECT_UPDATE: "qpm.project.update",
  QPM_PROJECT_ASSIGN_USERS: "qpm.project.assign_users",
  QPM_PROJECT_MANAGE_QA: "qpm.project.manage_qa",
  QPM_QA_READ: "qpm.qa.read",
  QPM_TEST_CASE_READ: "qpm.testcase.read",
  QPM_TEST_CASE_UPDATE: "qpm.testcase.update",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
