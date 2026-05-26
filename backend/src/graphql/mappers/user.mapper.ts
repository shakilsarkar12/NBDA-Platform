import type { UserDocument } from "../../models/User.js";

export interface GraphQLUser {
  id: string;
  name: string;
  phone: string;
  bloodGroup: string;
  division: string;
  district: string;
  upazila: string;
  village: string;
  role: string;
  uniqueId: string;
  isAvailable: boolean;
  lastDonatedAt: string | null;
  points: number;
  impactMetrics: number;
  createdAt: string;
  updatedAt: string;
}

export function toGraphQLUser(user: UserDocument): GraphQLUser {
  return {
    id: user._id.toString(),
    name: user.name,
    phone: user.phone,
    bloodGroup: user.bloodGroup,
    division: user.division,
    district: user.district,
    upazila: user.upazila,
    village: user.village,
    role: user.role,
    uniqueId: user.uniqueId ?? "",
    isAvailable: user.isAvailable,
    lastDonatedAt: user.lastDonatedAt?.toISOString() ?? null,
    points: user.points,
    impactMetrics: user.impactMetrics,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
