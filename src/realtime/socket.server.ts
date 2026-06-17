// src/realtime/socket.server.ts

import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "http";

import { socketAuthMiddleware } from "./socket.auth";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  RealtimeServer,
} from "./socket.types";

import { SOCKET_EVENTS } from "@/constants/socket";


let ioInstance: RealtimeServer | null = null;

export function setupSocket(server: HttpServer): RealtimeServer {
  if (ioInstance) return ioInstance;

  const io: RealtimeServer = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    path: "/socket.io",
    cors: {
      origin: ["http://localhost:5173"],
      credentials: true,
    },
  });

  io.engine.on("connection_error", (error) => {
    console.log("[socket:connection_error]", {
      code: error.code,
      message: error.message,
      context: error.context,
      origin: error.req?.headers?.origin,
      url: error.req?.url,
    });
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    const user = socket.data.user;

    if (!user) {
      console.log("[socket] connected without user, disconnecting", {
        socketId: socket.id,
      });

      socket.disconnect(true);
      return;
    }

    console.log("[socket] connected", {
      socketId: socket.id,
      userId: user.id,
      roles: user.roles,
    });

    socket.emit(SOCKET_EVENTS.CONNECTED, {
      ok: true,
      socketId: socket.id,
      userId: user.id,
      roles: user.roles,
      connectedAt: new Date().toISOString(),
    });

    socket.on(SOCKET_EVENTS.PING_SERVER, (payload) => {
      console.log("[socket] ping from client", {
        socketId: socket.id,
        userId: user.id,
        payload,
      });

      socket.emit(SOCKET_EVENTS.PONG_CLIENT, {
        ok: true,
        message: "pong from authenticated socket",
        receivedAt: new Date().toISOString(),
      });
    });

    socket.on("disconnect", (reason) => {
      console.log("[socket] disconnected", {
        socketId: socket.id,
        userId: user.id,
        reason,
      });
    });
  });

  ioInstance = io;

  console.log("[socket] initialized with typed auth");

  return io;
}

export function getIO(): RealtimeServer {
  if (!ioInstance) {
    throw new Error("Socket.IO is not initialized");
  }

  return ioInstance;
}