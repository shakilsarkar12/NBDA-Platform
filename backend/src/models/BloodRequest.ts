import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import { BLOOD_GROUPS, type BloodGroup } from "../types/enums.js";

export interface BloodRequestDocument extends Document {
  patientName: string;
  bloodGroup: BloodGroup;
  bagsNeeded: number;
  hospitalNameAndAddress: string;
  relativeContact: string;
  deadline: Date;
  createdByUserId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bloodRequestSchema = new Schema<BloodRequestDocument>(
  {
    patientName: { type: String, required: true, trim: true },
    bloodGroup: { type: String, required: true, enum: BLOOD_GROUPS },
    bagsNeeded: { type: Number, required: true, min: 1 },
    hospitalNameAndAddress: { type: String, required: true, trim: true },
    relativeContact: { type: String, required: true, trim: true },
    deadline: { type: Date, required: true },
    createdByUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true, collection: "BloodRequests" }
);

bloodRequestSchema.index({ createdAt: -1 });
bloodRequestSchema.index({ bloodGroup: 1, deadline: 1 });

export const BloodRequest: Model<BloodRequestDocument> =
  mongoose.models.BloodRequest ??
  mongoose.model<BloodRequestDocument>("BloodRequest", bloodRequestSchema);

