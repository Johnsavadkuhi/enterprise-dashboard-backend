import dotenv from "dotenv";
import { DEFAULT_CORS_ORIGINS } from "@/constants/cors";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const clientUrls = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(",").map((url) => url.trim().replace(/\/$/, "")).filter(Boolean)
  : nodeEnv === "production"
    ? [clientUrl]
    : DEFAULT_CORS_ORIGINS;

export const env = {
  nodeEnv,
  port: Number(process.env.PORT || 4000),
  clientUrl,
  clientUrls: Array.from(new Set(clientUrls)),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/enterprise_dashboard",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev_access_secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret",
  csrfSecret: process.env.CSRF_SECRET || process.env.JWT_REFRESH_SECRET || "dev_csrf_secret",
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || "7d",
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  uploadDir: process.env.UPLOAD_DIR || "uploads",
};

export const isProduction = env.nodeEnv === "production";
