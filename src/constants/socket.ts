export const SOCKET_EVENTS = {
  CONNECTED: "socket:connected",
  NOTIFICATION_NEW: "notification:new",
} as const;

export const SOCKET_ROOMS = {
  USER: (userId: string) => `user:${userId}`,
  ROLE: (role: string) => `role:${role}`,
  PROJECT: (projectId: string) => `project:${projectId}`,
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
