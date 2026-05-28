import { BloodRequest } from "../models/BloodRequest.js";
import { BLOOD_GROUPS, type BloodGroup } from "../types/enums.js";
import { AppError } from "../utils/errors.js";
import { normalizePhone } from "../utils/phone.js";

export interface CreateBloodRequestInput {
  patientName: string;
  bloodGroup: string;
  bagsNeeded: number;
  hospitalNameAndAddress: string;
  relativeContact: string;
  deadline: string;
  createdByUserId?: string;
}

function asBloodGroup(value: string): BloodGroup {
  const normalized = value.trim().toUpperCase() as BloodGroup;
  if (!BLOOD_GROUPS.includes(normalized)) {
    throw new AppError("Invalid blood group", "VALIDATION_ERROR", 400);
  }
  return normalized;
}

function assertNonEmpty(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new AppError(`${field} is required`, "VALIDATION_ERROR", 400);
  }
  return normalized;
}

export async function createBloodRequest(input: CreateBloodRequestInput) {
  const deadline = new Date(input.deadline);
  if (Number.isNaN(deadline.getTime())) {
    throw new AppError("Invalid deadline", "VALIDATION_ERROR", 400);
  }

  const doc = await BloodRequest.create({
    patientName: assertNonEmpty(input.patientName, "Patient name"),
    bloodGroup: asBloodGroup(input.bloodGroup),
    bagsNeeded: Math.max(1, Number(input.bagsNeeded)),
    hospitalNameAndAddress: assertNonEmpty(
      input.hospitalNameAndAddress,
      "Hospital name and address"
    ),
    relativeContact: normalizePhone(input.relativeContact),
    deadline,
    createdByUserId: input.createdByUserId,
  });

  return doc;
}

export async function listActiveBloodRequests() {
  const now = new Date();
  const requests = await BloodRequest.find({ deadline: { $gte: now } })
    .sort({ createdAt: -1 })
    .lean();

  return requests.map((r) => ({
    id: r._id.toString(),
    patientName: r.patientName,
    bloodGroup: r.bloodGroup,
    bagsNeeded: r.bagsNeeded,
    hospitalNameAndAddress: r.hospitalNameAndAddress,
    deadline: r.deadline,
    createdAt: r.createdAt,
    maskedContact: `${r.relativeContact.slice(0, 3)}*****${r.relativeContact.slice(-2)}`,
    contactTargetUserId: r.createdByUserId?.toString() ?? null,
  }));
}

