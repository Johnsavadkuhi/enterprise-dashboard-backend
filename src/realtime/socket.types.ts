// src/realtime/socket.types.ts

import { SOCKET_EVENTS } from "@/constants/socket";
import type { Server, Socket } from "socket.io";

export type AuthSocketUser = {
   id: string;
   firstName: string;
   lastName: string;
   username: string;
   sessionVersion: number;
   roles:string[]; 
   projectIds?: string[];
};

export type SocketConnectedPayload = {
  ok: true;
  socketId: string;
  userId: string;
  roles: string[];
  connectedAt: string;
};

export type PingServerPayload = {
  message: string;
  sentAt?: string;
};

export type PongClientPayload = {
  ok: true;
  message: string;
  receivedAt: string;
};

export interface ServerToClientEvents {
    [SOCKET_EVENTS.CONNECTED]: (payload: SocketConnectedPayload) => void;
  [SOCKET_EVENTS.PONG_CLIENT]: (payload: PongClientPayload) => void;

}

export interface ClientToServerEvents {
  [SOCKET_EVENTS.PING_SERVER]: (payload: PingServerPayload) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  user?: AuthSocketUser;
}

export type RealtimeServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type RealtimeSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;