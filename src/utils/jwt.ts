import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { env } from "@/config/env";
import type { Role } from "@/constants/roles";
import type { Permission } from "@/constants/permissions";

export type JwtPayload = {
  id: string;
  username: string;
  roles: Role[];
  permissions: Permission[];
  sessionVersion: number;
  projectIds?: string[];
};

export type RefreshTokenPayload = Pick<JwtPayload, "id" | "sessionVersion"> & {
  tokenId: string;
};

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.accessTokenTtl as StringValue });
}

export function signRefreshToken(payload: RefreshTokenPayload) {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.refreshTokenTtl as StringValue });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
}
