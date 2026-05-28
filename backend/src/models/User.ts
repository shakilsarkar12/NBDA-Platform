import mongoose, { Schema, type Document, type Model } from "mongoose";
import { BLOOD_GROUPS, USER_ROLES, type BloodGroup, type UserRole } from "../types/enums.js";
import { getNextUserSequence } from "../services/counter.service.js";

export interface IUser {
  name: string;
  phone: string;
  password: string;
  bloodGroup: BloodGroup;
  division: string;
  district: string;
  upazila: string;
  village: string;
  role: UserRole;
  uniqueId?: string;
  isAvailable: boolean;
  lastDonatedAt?: Date;
  points: number;
  impactMetrics: number;
}

export interface UserDocument extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, index: true, trim: true },
    password: { type: String, required: true, select: false },
    bloodGroup: {
      type: String,
      required: true,
      enum: BLOOD_GROUPS,
      uppercase: true,
      trim: true,
    },
    division: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    upazila: { type: String, required: true, trim: true },
    village: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: USER_ROLES,
      default: "User",
    },
    uniqueId: { type: String, unique: true, sparse: true, trim: true },
    isAvailable: { type: Boolean, default: true },
    lastDonatedAt: { type: Date },
    points: { type: Number, default: 0, min: 0 },
    impactMetrics: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, collection: "Users" }
);

userSchema.pre("save", async function () {
  if (this.uniqueId) {
    return;
  }

  const year = new Date().getFullYear();
  const seq = await getNextUserSequence(year);
  this.uniqueId = `NBDA-${year}-${String(seq).padStart(4, "0")}`;
});

userSchema.index({ role: 1, bloodGroup: 1 });

export const User: Model<UserDocument> =
  mongoose.models.User ?? mongoose.model<UserDocument>("User", userSchema);
