import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import cookie from "cookie";
import { env } from "@/config/env";
import { COOKIE_NAMES } from "@/constants/security";
import { SOCKET_EVENTS, SOCKET_ROOMS } from "@/constants/socket";
import { getAuthUserFromAccessToken } from "@/modules/auth/services/session.service";

let ioInstance: Server | null = null;

export function setupSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: env.clientUrls,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return next(new Error("Unauthorized"));

      const parsed = cookie.parse(rawCookie);
      const accessToken = parsed[COOKIE_NAMES.ACCESS_TOKEN];
      if (!accessToken) return next(new Error("Unauthorized"));

      const user = await getAuthUserFromAccessToken(accessToken);
      socket.data.user = user;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as Express.UserContext;

    socket.join(SOCKET_ROOMS.USER(user.id));
    user.roles.forEach((role) => socket.join(SOCKET_ROOMS.ROLE(role)));
    user.projectIds?.forEach((projectId) => socket.join(SOCKET_ROOMS.PROJECT(projectId)));

    socket.emit(SOCKET_EVENTS.CONNECTED, { ok: true });
  });

  ioInstance = io;
  return io;
}

export function getIO() {
  if (!ioInstance) throw new Error("Socket.IO is not initialized");
  return ioInstance;
}
