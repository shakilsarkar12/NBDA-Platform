import mongoose, { Schema, type Document, type Model } from "mongoose";
import { OTP_PURPOSES, type OtpPurpose } from "../types/enums.js";
import type { RegisterPayload } from "../types/register.js";

export interface IOtp {
  phone: string;
  code: string;
  purpose: OtpPurpose;
  payload: RegisterPayload;
  attempts: number;
}

export interface OtpDocument extends IOtp, Document {
  createdAt: Date;
  updatedAt: Date;
}

const OTP_TTL_SECONDS = 5 * 60;

const otpSchema = new Schema<OtpDocument>(
  {
    phone: { type: String, required: true, trim: true, index: true },
    code: { type: String, required: true },
    purpose: {
      type: String,
      required: true,
      enum: OTP_PURPOSES,
      default: "registration",
    },
    payload: { type: Schema.Types.Mixed, required: true },
    attempts: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

/** MongoDB TTL — documents removed ~5 minutes after creation */
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: OTP_TTL_SECONDS });

export const Otp: Model<OtpDocument> =
  mongoose.models.Otp ?? mongoose.model<OtpDocument>("Otp", otpSchema);

export const OTP_EXPIRY_MS = OTP_TTL_SECONDS * 1000;
