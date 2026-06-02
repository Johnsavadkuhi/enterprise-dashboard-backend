import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(6),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(6),
    avatarUrl: z.url().optional().or(z.literal("")),
  }),
});
