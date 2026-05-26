export const USER_ROLES = ["Admin", "Volunteer", "Donor", "User"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const OTP_PURPOSES = ["registration"] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];
