import type { BloodGroup, UserRole } from "./enums.js";

export interface RegisterPayload {
  name: string;
  bloodGroup: BloodGroup;
  division: string;
  district: string;
  upazila: string;
  village: string;
  role: UserRole;
}
