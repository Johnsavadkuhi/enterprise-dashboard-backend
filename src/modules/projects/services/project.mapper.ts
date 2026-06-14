import type { CreateProjectRequest } from "../validators/project.validators";

export function mapCreateProjectRequest(input: CreateProjectRequest) {
  return {
    projectName: input.projectName,
    version: input.version,
    letterNumber: input.letterNumber,
    type: input.type,
    platform: [input.platform],
    certificateRequired: input.certificateRequired,
    certificateAuthorities: input.certificateRequired
      ? Array.from(new Set(input.certificateAuthorities))
      : [],
    projectManager: input.projectManagerId,
    devops: input.devopsManagerId,
    expireDay: new Date(input.testEndDate),
  };
}
