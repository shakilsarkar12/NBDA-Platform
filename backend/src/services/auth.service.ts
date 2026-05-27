import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { Otp, OTP_EXPIRY_MS } from "../models/Otp.js";
import { User, type UserDocument } from "../models/User.js";
import {
  BLOOD_GROUPS,
  USER_ROLES,
  type BloodGroup,
  type UserRole,
} from "../types/enums.js";
import { AppError } from "../utils/errors.js";
import { generateOtpCode, verifyOtpCode } from "../utils/otp.js";
import { normalizePhone } from "../utils/phone.js";
import { sendOtpSms } from "./sms.service.js";

const BCRYPT_ROUNDS = 12;
const MAX_OTP_ATTEMPTS = 5;

import type { RegisterPayload } from "../types/register.js";

export type { RegisterPayload };

export interface RegisterInput extends RegisterPayload {
  phone: string;
}

export interface CompleteRegistrationInput {
  phone: string;
  code: string;
  password: string;
}

export interface LoginInput {
  phone: string;
  password: string;
}

function assertBloodGroup(value: string): BloodGroup {
  const normalized = value.toUpperCase().trim() as BloodGroup;
  if (!BLOOD_GROUPS.includes(normalized)) {
    throw new AppError(`Invalid blood group: ${value}`, "INVALID_BLOOD_GROUP");
  }
  return normalized;
}

function assertRole(value: string): UserRole {
  if (!USER_ROLES.includes(value as UserRole)) {
    throw new AppError(`Invalid role: ${value}`, "INVALID_ROLE");
  }
  return value as UserRole;
}

function validatePassword(password: string): void {
  if (password.length < 8) {
    throw new AppError(
      "Password must be at least 8 characters",
      "WEAK_PASSWORD"
    );
  }
}

function requireNonEmpty(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new AppError(`${field} is required`, "VALIDATION_ERROR");
  }
  return normalized;
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

export async function registerUser(input: RegisterInput): Promise<{
  success: boolean;
  message: string;
  expiresAt: string;
}> {
  const phone = normalizePhone(input.phone);

  const existingUser = await User.findOne({ phone }).lean();
  if (existingUser) {
    throw new AppError(
      "A user with this phone number already exists",
      "PHONE_ALREADY_REGISTERED",
      409
    );
  }

  const payload: RegisterPayload = {
    name: requireNonEmpty(input.name, "Name"),
    bloodGroup: assertBloodGroup(input.bloodGroup),
    division: requireNonEmpty(input.division, "Division"),
    district: requireNonEmpty(input.district, "District"),
    upazila: requireNonEmpty(input.upazila, "Upazila"),
    village: requireNonEmpty(input.village, "Village"),
    role: assertRole(input.role ?? "User"),
  };

  const code = generateOtpCode();

  await Otp.deleteMany({ phone, purpose: "registration" });

  await Otp.create({
    phone,
    code,
    purpose: "registration",
    payload,
    attempts: 0,
  });

  await sendOtpSms(phone, code);

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS).toISOString();

  return {
    success: true,
    message: "OTP sent successfully. Please verify within 5 minutes.",
    expiresAt,
  };
}

export async function verifyOtpAndRegister(
  input: CompleteRegistrationInput
): Promise<{ user: UserDocument; accessToken: string }> {
  const phone = normalizePhone(input.phone);
  validatePassword(input.password);
  const code = requireNonEmpty(input.code, "OTP code");

  const otpRecord = await Otp.findOne({
    phone,
    purpose: "registration",
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new AppError(
      "OTP expired or not found. Please register again.",
      "OTP_NOT_FOUND",
      404
    );
  }

  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    await Otp.deleteOne({ _id: otpRecord._id });
    throw new AppError(
      "Too many invalid attempts. Please register again.",
      "OTP_MAX_ATTEMPTS",
      429
    );
  }

  if (!verifyOtpCode(otpRecord.code, code)) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new AppError("Invalid OTP code", "OTP_INVALID", 401);
  }

  const duplicate = await User.findOne({ phone }).lean();
  if (duplicate) {
    await Otp.deleteOne({ _id: otpRecord._id });
    throw new AppError(
      "A user with this phone number already exists",
      "PHONE_ALREADY_REGISTERED",
      409
    );
  }

  const hashedPassword = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  let user: UserDocument;
  try {
    user = await User.create({
      ...otpRecord.payload,
      phone,
      password: hashedPassword,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(
        "A user with this phone number already exists",
        "PHONE_ALREADY_REGISTERED",
        409
      );
    }
    throw error;
  }

  await Otp.deleteOne({ _id: otpRecord._id });

  // Never return hashed password to clients.
  user.password = undefined as unknown as string;

  const accessToken = signAccessToken(user);

  return { user, accessToken };
}

// Backward-compatible alias for any existing imports.
export const completeRegistration = verifyOtpAndRegister;

export async function loginUser(
  input: LoginInput
): Promise<{ user: UserDocument; accessToken: string }> {
  const phone = normalizePhone(input.phone);

  const user = await User.findOne({ phone }).select("+password");
  if (!user) {
    throw new AppError("Invalid phone or password", "INVALID_CREDENTIALS", 401);
  }

  const passwordMatch = await bcrypt.compare(input.password, user.password);
  if (!passwordMatch) {
    throw new AppError("Invalid phone or password", "INVALID_CREDENTIALS", 401);
  }

  user.password = undefined as unknown as string;
  const accessToken = signAccessToken(user);

  return { user, accessToken };
}

function signAccessToken(user: UserDocument): string {
  return jwt.sign(
    {
      sub: user._id.toString(),
      phone: user.phone,
      role: user.role,
      uniqueId: user.uniqueId,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] }
  );
}
