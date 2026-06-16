// src/realtime/socket.server.ts

import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "http";

import { socketAuthMiddleware } from "./socket.auth";
import { getInitialRooms } from "./socket.rooms";

let ioInstance: SocketIOServer | null = null;

export function setupSocket(server: HttpServer): SocketIOServer {
  if (ioInstance) return ioInstance;

  const io = new SocketIOServer(server, {
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

  /**
   * Auth middleware
   * If this fails, io.on("connection") will NOT run.
   */
  io.use(socketAuthMiddleware);

  io.on("connection", async (socket) => {
    const user = socket.data.user;

    console.log("user : " , user )
    console.log("[socket] connected", {
      socketId: socket.id,
      userId: user.id,
      roles: user.roles,
    });

    const rooms = getInitialRooms(user);

    await socket.join(rooms);

    console.log("[socket] rooms joined", {
      socketId: socket.id,
      rooms,
    });

    socket.emit("socket:connected", {
      ok: true,
      socketId: socket.id,
      userId: user.id,
      rooms,
    });

    socket.on("ping:server", (payload) => {
      console.log("[socket] ping from client", {
        userId: user.id,
        payload,
      });

      socket.emit("pong:client", {
        ok: true,
        message: "pong from authenticated socket",
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

  console.log("[socket] initialized with auth");

  return io;
}

export function getIO(): SocketIOServer {
  if (!ioInstance) {
    throw new Error("Socket.IO is not initialized");
  }

  return ioInstance;
}