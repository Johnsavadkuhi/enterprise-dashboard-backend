export const SOCKET_EVENTS = {
  CONNECTED: "socket:connected",
  PING_SERVER: "ping:server",
  PONG_CLIENT: "pong:client",
  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_READ: "notification:read",
  NOTIFICATIONS_READ_ALL: "notification:read-all",
  PROJECT_CREATED: "project:created",
  PROJECT_ASSIGNED: "project:assigned",

} as const;

export const SOCKET_ROOMS = {
  USER: (userId: string) => `user:${userId}`,
  ROLE: (role: string) => `role:${role}`,
  PROJECT: (projectId: string) => `project:${projectId}`,
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
