// Core Domain Types for ScholarAI

export type Role = "STUDENT" | "ADMIN";

export type DegreeLevel = "HIGH_SCHOOL" | "BACHELORS" | "MASTERS" | "PHD" | "POSTDOC";

export type FundingType = "FULL_TUITION" | "FULLY_FUNDED" | "PARTIAL" | "STIPEND_ONLY";

export type CriterionType =
  | "ACADEMIC_GPA"
  | "DEGREE_LEVEL"
  | "COURSE_OF_STUDY"
  | "CITIZENSHIP"
  | "RESIDENCY"
  | "FINANCIAL_NEED"
  | "LANGUAGE_TEST"
  | "GENERAL";

export type CriterionOperator = "EQUALS" | "IN" | "GTE" | "LTE" | "BETWEEN" | "CONTAINS";

export type MatchStatus =
  | "HIGH_MATCH"
  | "MODERATE_MATCH"
  | "LOW_MATCH"
  | "INELIGIBLE"
  | "INCOMPLETE_DATA";

export type ApplicationStatus =
  | "INTERESTED"
  | "PREPARING_DOCUMENTS"
  | "READY_TO_APPLY"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

// Evaluated Criterion structure
export interface CriterionEvaluation {
  id: string;
  criterionType: CriterionType;
  description: string;
  isMandatory: boolean;
  status: "MET" | "UNMET" | "MISSING_INFO";
  studentValue?: string | number | null;
  requiredValue?: string | number;
  reason: string;
}

// Eligibility Match Result
export interface EligibilityAnalysisResult {
  scholarshipId: string;
  scholarshipTitle: string;
  eligibilityScore: number; // 0 to 100
  status: MatchStatus;
  matchedCriteria: CriterionEvaluation[];
  unmetCriteria: CriterionEvaluation[];
  missingInfo: {
    field: string;
    description: string;
    impact: "HIGH" | "MEDIUM" | "LOW";
  }[];
  explanation: string;
  nextSteps: string[];
}

// RAG Q&A Assistant Response
export interface AssistantResponse {
  answer: string;
  scholarshipsReferenced: {
    id: string;
    title: string;
    provider: string;
    url?: string;
  }[];
  sources: {
    documentTitle: string;
    chunkContent: string;
    similarityScore: number;
  }[];
  confidence: "CONFIRMED" | "POTENTIAL" | "INSUFFICIENT_EVIDENCE";
}
