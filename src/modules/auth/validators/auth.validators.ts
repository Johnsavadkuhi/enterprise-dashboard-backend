import { z } from "zod";

const avatarUrlSchema = z.union([
  z.url(),
  z.string().regex(/^\/uploads\/[^/]+$/),
  z.literal(""),
]);

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(2),
    password: z.string().min(6),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    username: z.string().min(2),
    password: z.string().min(6),
    avatarUrl: avatarUrlSchema.optional(),
  }),
});
