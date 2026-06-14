import { z } from "zod";
import { PROJECT_TYPE_VALUES } from "@/constants/projects";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid user id");
const nonEmptyString = z.string().trim().min(1);
const dateString = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  "Invalid test end date"
);

export const createProjectRequestSchema = z
  .object({
    projectName: z.string().trim().min(2),
    version: nonEmptyString,
    letterNumber: nonEmptyString,
    type: z.enum(PROJECT_TYPE_VALUES),
    platform: nonEmptyString,
    certificateRequired: z.boolean(),
    certificateAuthorities: z.array(nonEmptyString),
    projectManagerId: objectId,
    devopsManagerId: objectId,
    testEndDate: dateString,
  })
  .superRefine((input, context) => {
    if (input.certificateRequired && input.certificateAuthorities.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["certificateAuthorities"],
        message: "At least one certificate authority is required",
      });
    }
  });

export type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>;

export const createProjectSchema = z.object({
  body: createProjectRequestSchema,
});

export const assignUsersSchema = z.object({
  body: z.object({
    userIds: z.array(objectId).min(1),
  }),
});
