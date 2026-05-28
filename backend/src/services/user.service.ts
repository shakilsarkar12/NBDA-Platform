import type { Types } from "mongoose";
import { ContactAuditLog } from "../models/ContactAuditLog.js";
import { User, type UserDocument } from "../models/User.js";
import { AppError } from "../utils/errors.js";

const ELIGIBILITY_DAYS = 120;
const ELIGIBILITY_MS = ELIGIBILITY_DAYS * 24 * 60 * 60 * 1000;

export function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  const visiblePrefix = phone.slice(0, 3);
  const visibleSuffix = phone.slice(-2);
  return `${visiblePrefix}${"*".repeat(Math.max(phone.length - 5, 0))}${visibleSuffix}`;
}

export async function getUserByIdOrThrow(userId: string): Promise<UserDocument> {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", "USER_NOT_FOUND", 404);
  }
  return user;
}

export async function setAvailability(
  userId: string,
  isAvailable: boolean
): Promise<UserDocument> {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { isAvailable } },
    { new: true }
  );

  if (!user) {
    throw new AppError("User not found", "USER_NOT_FOUND", 404);
  }

  return user;
}

/**
 * Donation logger for 120-day medical eligibility.
 * Marks donor as unavailable immediately after donation.
 */
export async function logBloodDonation(userId: string): Promise<UserDocument> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        lastDonatedAt: new Date(),
        isAvailable: false,
      },
    },
    { new: true }
  );

  if (!user) {
    throw new AppError("User not found", "USER_NOT_FOUND", 404);
  }

  return user;
}

export async function autoResetEligibility(
  now = new Date()
): Promise<{ matchedCount: number; modifiedCount: number; cutoff: Date }> {
  const cutoff = new Date(now.getTime() - ELIGIBILITY_MS);
  const result = await User.updateMany(
    {
      isAvailable: false,
      lastDonatedAt: { $lte: cutoff },
    },
    { $set: { isAvailable: true } }
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
    cutoff,
  };
}

export async function searchDonorsMasked(): Promise<
  Array<{
    id: string;
    name: string;
    bloodGroup: string;
    role: string;
    isAvailable: boolean;
    maskedPhone: string;
  }>
> {
  const donors = await User.find(
    {},
    { name: 1, bloodGroup: 1, role: 1, phone: 1, isAvailable: 1 }
  )
    .sort({ isAvailable: -1, points: -1, createdAt: -1 })
    .lean();

  return donors.map((d) => ({
    id: d._id.toString(),
    name: d.name,
    bloodGroup: d.bloodGroup,
    role: d.role,
    isAvailable: d.isAvailable,
    maskedPhone: maskPhone(d.phone),
  }));
}

export async function viewDonorContactWithAudit(
  viewedByUserId: string,
  viewedUserId: string
): Promise<{ phone: string }> {
  if (viewedByUserId === viewedUserId) {
    const self = await getUserByIdOrThrow(viewedByUserId);
    return { phone: self.phone };
  }

  const viewer = await getUserByIdOrThrow(viewedByUserId);
  const viewed = await getUserByIdOrThrow(viewedUserId);

  // "verified users" => users who completed registration and have uniqueId.
  if (!viewer.uniqueId) {
    throw new AppError(
      "Only verified users can view donor contact",
      "FORBIDDEN",
      403
    );
  }

  await ContactAuditLog.create({
    viewedByUserId: viewer._id as Types.ObjectId,
    viewedUserId: viewed._id as Types.ObjectId,
  });

  return { phone: viewed.phone };
}

