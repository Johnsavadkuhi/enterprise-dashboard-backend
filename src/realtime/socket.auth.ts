// src/realtime/socket.auth.ts

import cookie from "cookie";
import type { RealtimeSocket } from "./socket.types";
import { COOKIE_NAMES } from "@/constants/security";
import { getAuthUserFromAccessToken } from "@/modules/auth/services/session.service";

export async function authenticateSocket(socket: RealtimeSocket): Promise<void> {
  const rawCookie = socket.handshake.headers.cookie;

  if (!rawCookie) {
    throw new Error("Missing authentication cookie");
  }

  const parsedCookies = cookie.parse(rawCookie);
  const accessToken = parsedCookies[COOKIE_NAMES.ACCESS_TOKEN];

  if (!accessToken) {
    throw new Error("Missing access token");
  }

  const user = await getAuthUserFromAccessToken(accessToken);

  if (!user) {
    throw new Error("Invalid or expired token");
  }

  socket.data.user = {
    id: user.id,
    username: user.username,
    roles: user.roles,
    sessionVersion: user.sessionVersion,
  };
}