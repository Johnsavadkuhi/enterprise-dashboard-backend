import { env, isProduction } from "@/config/env";

export const socketConfig = {
  isProduction,
  redisUrl: process.env.SOCKET_REDIS_URL || process.env.REDIS_URL,
  allowedOrigins: env.clientUrls,
  pingInterval: 25_000,
  pingTimeout: 20_000,
  maxHttpBufferSize: 1e6,
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
