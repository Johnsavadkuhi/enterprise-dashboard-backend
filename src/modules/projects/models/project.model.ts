import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { PROJECT_STATUS, PROJECT_STATUS_VALUES, PROJECT_TYPE_VALUES, type ProjectType } from "@/constants/projects";

const projectIdentifierSchema = new Schema(
  {
    developer: { type: String, trim: true },
    employer: { type: String, trim: true },
    certificateRequest: { type: String, trim: true },
    organizationalUnitName: { type: String, trim: true },
    projectManagerName: { type: String, trim: true },
    unitPhoneNumber: { type: String, trim: true },
    beneficiaryOffice: { type: String, trim: true },
    followerName: { type: String, trim: true },
    beneficiaryPhoneNumber: { type: String, trim: true },
    datacenterName: { type: String, trim: true },
    responsibleName: { type: String, trim: true },
    datacenterPhoneNumber: { type: String, trim: true },
    projectAcceptanceDate: { type: Date },
    reportIssueDate: { type: Date },
    testDate: { type: Date },
    docId: { type: String, trim: true },
  },
  { _id: false }
);

const projectSchema = new Schema(
  {
    projectName: { type: String, required: true, trim: true },
    type: { type: String, enum: PROJECT_TYPE_VALUES },
    description: { type: Schema.Types.Mixed },
    status: { type: String, enum: PROJECT_STATUS_VALUES, default: PROJECT_STATUS.OPEN },
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },

    // Legacy-compatible project identity fields.
    letterNumber: { type: String, trim: true },
    version: { type: String, trim: true },
    projectType: { type: [String], default: [] },
    platform: { type: [String], default: [] },
    descriptions: { type: [String], default: undefined },
    identifier: projectIdentifierSchema,

    // Project-level managers from the legacy model.
    projectManager: { type: Schema.Types.ObjectId, ref: "User" },
    qualityManager: { type: Schema.Types.ObjectId, ref: "User" },
    devops: { type: Schema.Types.ObjectId, ref: "User" },

    // Temporary compatibility fields. ProjectAssignment should become the source of truth.
    assignedUserIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    userProject: [{ type: Schema.Types.ObjectId, ref: "ProjectAssignment" }],

    expireDay: { type: Date },
    expireDayQuality: { type: Date },
    verifiedByAdmin: { type: Date },
    verifiedReportByAdmin: { type: Date },
    numberOfTest: { type: Number },
    reportPassword: { type: String, default: "" },
  },
  { timestamps: true }
);

projectSchema.pre("validate", function () {
  this.ownerId ||= this.projectManager;

  if (!this.projectType?.length && this.type) {
    this.projectType = [this.type];
  }

  if (!this.type && this.projectType?.length) {
    const [firstType] = this.projectType;
    if ((PROJECT_TYPE_VALUES as readonly string[]).includes(firstType)) {
      this.type = firstType as ProjectType;
    }
  }
});

projectSchema.index({ projectName: 1 });
projectSchema.index(
  { projectName: 1, version: 1 },
  {
    unique: true,
    partialFilterExpression: {
      projectName: { $type: "string" },
      version: { $type: "string" },
    },
  }
);
projectSchema.index({ ownerId: 1, status: 1, createdAt: -1 });
projectSchema.index({ type: 1, status: 1, createdAt: -1 });
projectSchema.index({ projectType: 1, status: 1 });
projectSchema.index({ projectManager: 1, status: 1 });
projectSchema.index({ qualityManager: 1, status: 1 });
projectSchema.index({ devops: 1, status: 1 });
projectSchema.index({ assignedUserIds: 1, status: 1 });
projectSchema.index({ userProject: 1 });
projectSchema.index({ letterNumber: 1 });
projectSchema.index({ "identifier.docId": 1 });

export type ProjectDocument = InferSchemaType<typeof projectSchema> & { _id: mongoose.Types.ObjectId };
export const ProjectModel = mongoose.model<ProjectDocument>("Project", projectSchema);
