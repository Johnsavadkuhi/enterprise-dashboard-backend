import type { ErrorRequestHandler } from "express";
import { HTTP_STATUS } from "@/constants/http";
import { AppError } from "@/utils/AppError";

export const notFoundHandler = () => {
  throw new AppError("Route not found", HTTP_STATUS.NOT_FOUND);
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err instanceof AppError ? err.statusCode : err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err instanceof AppError || err.isOperational ? err.message : "Internal server error";

  if (process.env.NODE_ENV !== "test") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
    },
  });
};
