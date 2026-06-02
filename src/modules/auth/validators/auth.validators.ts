import { z } from "zod";

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
    name: z.string().min(2).optional(),
    username: z.string().min(2),
    password: z.string().min(6),
    avatarUrl: z.url().optional().or(z.literal("")),
    profileImageUrl: z.url().optional().or(z.literal("")),
  }),
});
