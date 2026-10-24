import { z } from "zod";

export const DegreeLevelEnum = z.enum([
  "HIGH_SCHOOL",
  "BACHELORS",
  "MASTERS",
  "PHD",
  "POSTDOC",
]);

export const FundingTypeEnum = z.enum([
  "FULL_TUITION",
  "FULLY_FUNDED",
  "PARTIAL",
  "STIPEND_ONLY",
]);

export const ApplicationStatusEnum = z.enum([
  "INTERESTED",
  "PREPARING_DOCUMENTS",
  "READY_TO_APPLY",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
]);

// Auth Schemas
export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "ADMIN"]).default("STUDENT"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Student Profile Schema
export const StudentProfileSchema = z.object({
  educationLevel: DegreeLevelEnum.default("BACHELORS"),
  fieldOfStudy: z.string().min(2, "Field of study is required"),
  gpa: z.number().min(0).max(10).nullable().optional(),
  gpaScale: z.number().default(4.0),
  graduationYear: z.number().int().min(2000).max(2040).nullable().optional(),
  countryOfOrigin: z.string().min(2, "Citizenship/Country of Origin is required"),
  currentCountry: z.string().min(2, "Current residence country is required"),
  familyIncomeUsd: z.number().nonnegative().nullable().optional(),
  ieltsScore: z.number().min(0).max(9).nullable().optional(),
  toeflScore: z.number().min(0).max(120).nullable().optional(),
  greScore: z.number().int().min(260).max(340).nullable().optional(),
  workExperienceYears: z.number().min(0).default(0),
  publicationsCount: z.number().int().min(0).default(0),
  achievements: z.string().max(2000).nullable().optional(),
  skills: z.array(z.string()).default([]),
});

// Scholarship Filter & Query Schema
export const ScholarshipQuerySchema = z.object({
  q: z.string().optional(),
  educationLevel: DegreeLevelEnum.optional(),
  fundingType: FundingTypeEnum.optional(),
  course: z.string().optional(),
  country: z.string().optional(),
  minAward: z.coerce.number().optional(),
  maxAward: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sortBy: z.enum(["deadline", "awardAmount", "createdAt"]).default("deadline"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Scholarship Create/Update Schema (Admin)
export const ScholarshipUpsertSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  provider: z.string().min(2, "Provider name is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  awardAmount: z.number().positive().nullable().optional(),
  currency: z.string().default("USD"),
  fundingType: FundingTypeEnum.default("FULLY_FUNDED"),
  deadline: z.string().or(z.date()),
  educationLevels: z.array(DegreeLevelEnum).min(1, "At least one education level required"),
  eligibleCourses: z.array(z.string()).default([]),
  locationRestrictions: z.array(z.string()).default([]),
  citizenshipRequirements: z.array(z.string()).default([]),
  minGpa: z.number().min(0).max(4.0).nullable().optional(),
  minIelts: z.number().min(0).max(9).nullable().optional(),
  minToefl: z.number().min(0).max(120).nullable().optional(),
  maxFamilyIncome: z.number().nonnegative().nullable().optional(),
  officialUrl: z.string().url("Must be a valid URL"),
  isVerified: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

// Application Tracking Schema
export const ApplicationCreateSchema = z.object({
  scholarshipId: z.string().cuid(),
  status: ApplicationStatusEnum.default("INTERESTED"),
  deadline: z.string().or(z.date()).optional(),
  personalNotes: z.string().max(2000).optional(),
});

export const ApplicationUpdateSchema = z.object({
  status: ApplicationStatusEnum.optional(),
  deadline: z.string().or(z.date()).optional(),
  personalNotes: z.string().max(2000).optional(),
  submissionDate: z.string().or(z.date()).nullable().optional(),
});

// RAG Assistant Query Schema
export const AssistantQuerySchema = z.object({
  query: z.string().min(3, "Query must be at least 3 characters").max(500),
  scholarshipId: z.string().optional(), // Optional scope to single scholarship
});

// Eligibility Match Query Schema
export const MatchRequestSchema = z.object({
  scholarshipId: z.string().cuid().optional(), // Omit to match against all active scholarships
  forceRefresh: z.boolean().default(false),
});
