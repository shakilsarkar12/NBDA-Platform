import { gql } from "graphql-tag";

export const typeDefs = gql`
  enum UserRole {
    Admin
    Volunteer
    Donor
    User
  }

  type Health {
    status: String!
    timestamp: String!
  }

  type User {
    id: ID!
    name: String!
    phone: String!
    bloodGroup: String!
    division: String!
    district: String!
    upazila: String!
    village: String!
    role: UserRole!
    uniqueId: String!
    isAvailable: Boolean!
    lastDonatedAt: String
    points: Int!
    impactMetrics: Int!
    createdAt: String!
    updatedAt: String!
  }

  type RegisterResponse {
    success: Boolean!
    message: String!
    expiresAt: String!
  }

  type AuthPayload {
    success: Boolean!
    message: String!
    accessToken: String!
    user: User!
  }

  input RegisterInput {
    name: String!
    phone: String!
    bloodGroup: String!
    division: String!
    district: String!
    upazila: String!
    village: String!
    role: UserRole = User
  }

  input VerifyOtpAndRegisterInput {
    phone: String!
    code: String!
    password: String!
  }

  input LoginInput {
    phone: String!
    password: String!
  }

  type Query {
    health: Health!
  }

  type Mutation {
    """Step 1: validate phone, send 6-digit OTP (mock SMS logs to console)."""
    register(input: RegisterInput!): RegisterResponse!

    """Step 2: verify OTP, hash password, assign uniqueId, create user."""
    verifyOtpAndRegister(input: VerifyOtpAndRegisterInput!): AuthPayload!

    """Authenticate with phone + password."""
    login(input: LoginInput!): AuthPayload!
  }
`;
