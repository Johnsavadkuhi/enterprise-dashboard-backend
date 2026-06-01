import type { Response } from "express";
import { HTTP_STATUS, type HttpStatus } from "@/constants/http";

export function sendSuccess<T>(res: Response, data: T, statusCode: HttpStatus = HTTP_STATUS.OK) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

export function sendMessage(res: Response, message: string, statusCode: HttpStatus = HTTP_STATUS.OK) {
  return res.status(statusCode).json({
    success: true,
    message,
  });
}
