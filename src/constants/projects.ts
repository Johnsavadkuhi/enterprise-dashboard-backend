export const PROJECT_TYPES = {
  SECURITY: "security",
  QUALITY: "quality",
  DEVOPS: "devops",
} as const;

export const PROJECT_TYPE_VALUES = [
  PROJECT_TYPES.SECURITY,
  PROJECT_TYPES.QUALITY,
  PROJECT_TYPES.DEVOPS,
] as const;

export const PROJECT_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
} as const;

export const PROJECT_STATUS_VALUES = [
  PROJECT_STATUS.DRAFT,
  PROJECT_STATUS.ACTIVE,
  PROJECT_STATUS.PAUSED,
  PROJECT_STATUS.COMPLETED,
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[keyof typeof PROJECT_TYPES];
export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];
