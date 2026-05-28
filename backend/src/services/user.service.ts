import type { Types } from "mongoose";
import { ContactAuditLog } from "../models/ContactAuditLog.js";
import { User, type UserDocument } from "../models/User.js";
import { BLOOD_GROUPS, type BloodGroup } from "../types/enums.js";
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
    uniqueId: string;
    bloodGroup: string;
    role: string;
    isAvailable: boolean;
    division: string;
    district: string;
    upazila: string;
    maskedPhone: string;
  }>
> {
  const donors = await User.find(
    {},
    {
      name: 1,
      uniqueId: 1,
      bloodGroup: 1,
      role: 1,
      phone: 1,
      isAvailable: 1,
      division: 1,
      district: 1,
      upazila: 1,
    }
  )
    .sort({ isAvailable: -1, points: -1, createdAt: -1 })
    .lean();

  return donors.map((d) => ({
    id: d._id.toString(),
    name: d.name,
    uniqueId: d.uniqueId ?? "",
    bloodGroup: d.bloodGroup,
    role: d.role,
    isAvailable: d.isAvailable,
    division: d.division,
    district: d.district,
    upazila: d.upazila,
    maskedPhone: maskPhone(d.phone),
  }));
}

export interface DonorSearchFilters {
  bloodGroup?: string;
  division?: string;
  district?: string;
  upazila?: string;
}

export async function searchDonorsMaskedFiltered(filters: DonorSearchFilters) {
  const query: Record<string, unknown> = {};
  if (filters.bloodGroup) query.bloodGroup = filters.bloodGroup.toUpperCase();
  if (filters.division) query.division = filters.division;
  if (filters.district) query.district = filters.district;
  if (filters.upazila) query.upazila = filters.upazila;

  const donors = await User.find(query, {
    name: 1,
    uniqueId: 1,
    bloodGroup: 1,
    role: 1,
    phone: 1,
    isAvailable: 1,
    division: 1,
    district: 1,
    upazila: 1,
  })
    .sort({ isAvailable: -1, points: -1, createdAt: -1 })
    .lean();

  return donors.map((d) => ({
    id: d._id.toString(),
    name: d.name,
    uniqueId: d.uniqueId ?? "",
    bloodGroup: d.bloodGroup,
    role: d.role,
    isAvailable: d.isAvailable,
    division: d.division,
    district: d.district,
    upazila: d.upazila,
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

export interface UpdateUserProfileInput {
  name?: string;
  bloodGroup?: string;
  division?: string;
  district?: string;
  upazila?: string;
  village?: string;
  profileImageUrl?: string;
  isAvailable?: boolean;
}

function normalizeBloodGroup(value: string): BloodGroup {
  const normalized = value.trim().toUpperCase() as BloodGroup;
  if (!BLOOD_GROUPS.includes(normalized)) {
    throw new AppError("Invalid blood group", "VALIDATION_ERROR", 400);
  }
  return normalized;
}

export async function updateUserProfile(
  userId: string,
  input: UpdateUserProfileInput
): Promise<UserDocument> {
  const updates: Record<string, unknown> = {};

  if (typeof input.name === "string") updates.name = input.name.trim();
  if (typeof input.bloodGroup === "string")
    updates.bloodGroup = normalizeBloodGroup(input.bloodGroup);
  if (typeof input.division === "string") updates.division = input.division.trim();
  if (typeof input.district === "string") updates.district = input.district.trim();
  if (typeof input.upazila === "string") updates.upazila = input.upazila.trim();
  if (typeof input.village === "string") updates.village = input.village.trim();
  if (typeof input.profileImageUrl === "string")
    updates.profileImageUrl = input.profileImageUrl.trim();
  if (typeof input.isAvailable === "boolean") updates.isAvailable = input.isAvailable;

  const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true });
  if (!user) {
    throw new AppError("User not found", "USER_NOT_FOUND", 404);
  }
  return user;
}

