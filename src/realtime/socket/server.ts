import cookie from "cookie";
import { createAdapter } from "@socket.io/redis-adapter";
import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "http";
import { COOKIE_NAMES } from "@/constants/security";
import { SOCKET_EVENTS } from "@/constants/socket";
import { getAuthUserFromAccessToken } from "@/modules/auth/services/session.service";
import { socketConfig, isAllowedSocketOrigin } from "../socket.config";
import { createSocketRedisClients, type SocketRedisClients } from "../socket.redis";
import { getInitialRooms } from "../socket.rooms";
import type { RealtimeServer } from "../socket.types";

let ioInstance: RealtimeServer | null = null;
let redisClients: SocketRedisClients | null = null;

export async function setupSocket(server: HttpServer): Promise<RealtimeServer> {
  const io: RealtimeServer = new SocketIOServer(server, {
    cors: {
      origin: socketConfig.allowedOrigins,
      credentials: true,
    },
    allowRequest: (request, callback) => {
      callback(null, isAllowedSocketOrigin(request.headers.origin));
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60_000,
      skipMiddlewares: false,
    },
    pingInterval: socketConfig.pingInterval,
    pingTimeout: socketConfig.pingTimeout,
    maxHttpBufferSize: socketConfig.maxHttpBufferSize,
    transports: ["websocket", "polling"],
  });

  if (socketConfig.redisUrl) {
    redisClients = await createSocketRedisClients(socketConfig.redisUrl);
    io.adapter(createAdapter(redisClients.pubClient, redisClients.subClient));
  }

  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      const accessToken = rawCookie
        ? cookie.parse(rawCookie)[COOKIE_NAMES.ACCESS_TOKEN]
        : undefined;

      if (!accessToken) {
        return next(new Error("Unauthorized"));
      }

      socket.data.user = await getAuthUserFromAccessToken(accessToken);
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const user = socket.data.user;
    await socket.join(getInitialRooms(user));

    socket.emit(SOCKET_EVENTS.CONNECTED, {
      ok: true,
      socketId: socket.id,
      userId: user.id,
      connectedAt: new Date().toISOString(),
    });
  });

  io.engine.on("connection_error", (error) => {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Socket.IO connection error]", error.code, error.message);
    }
  });

  ioInstance = io;
  return io;
}

export function getIO(): RealtimeServer {
  if (!ioInstance) throw new Error("Socket.IO is not initialized");
  return ioInstance;
}

export function getIOIfInitialized(): RealtimeServer | null {
  return ioInstance;
}

export async function closeSocket(): Promise<void> {
  const io = ioInstance;
  ioInstance = null;

  if (io) {
    await new Promise<void>((resolve) => io.close(() => resolve()));
  }

  if (redisClients) {
    await redisClients.close();
    redisClients = null;
  }
}
