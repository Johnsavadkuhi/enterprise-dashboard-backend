import { env, isProduction } from "@/config/env";
import path from "path";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://your-frontend-domain.com",
];
export const socketConfig = {
  isProduction,
  path:"/socket.io" , 
  redisUrl: process.env.SOCKET_REDIS_URL || process.env.REDIS_URL,
  allowedOrigins: allowedOrigins,
  pingInterval: 25_000,
  pingTimeout: 20_000,
  maxHttpBufferSize: 1e6,
  cors:{
    origin:allowedOrigins , 
    credentials: true,
    methods: ["GET", "POST"],
  }, 
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: false,
  },
} as const;

export function isAllowedSocketOrigin(origin?: string): boolean {
  if (!origin) return !socketConfig.isProduction;

  try {
    const incomingUrl = new URL(origin);

    return socketConfig.allowedOrigins.some((allowedOrigin) => {
      const allowedUrl = new URL(allowedOrigin);
      return incomingUrl.origin === allowedUrl.origin;
    });
  } catch {
    return false;
  }
}
