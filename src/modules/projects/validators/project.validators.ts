import { z } from "zod";
import { PROJECT_TYPE_VALUES } from "@/constants/projects";

export const createProjectSchema = z.object({
  body: z.object({
    projectName: z.string().min(2),
    type: z.enum(PROJECT_TYPE_VALUES),
    description: z.string().optional(),
  }),
});

export const assignUsersSchema = z.object({
  body: z.object({
    userIds: z.array(z.string()).min(1),
  }),
});
