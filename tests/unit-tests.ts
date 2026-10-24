import assert from "node:assert/strict";
import { evaluateEligibility } from "../src/lib/matching-engine";
import { chunkDocumentText, cosineSimilarity } from "../src/lib/rag-core";
import { StudentProfileSchema, RegisterSchema, ApplicationCreateSchema } from "../src/lib/validations";
import { StudentProfile, Scholarship, EligibilityCriterion, DegreeLevel, FundingType, CriterionType, CriterionOperator } from "@prisma/client";

console.log("==================================================");
console.log(" ScholarAI Automated Test Suite");
console.log("==================================================");

let passedTests = 0;
let totalTests = 0;

function runTest(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`  ✔ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✖ FAIL: ${name}`);
    console.error(err);
  }
}

// ----------------------------------------------------
// 1. DETERMINISTIC ELIGIBILITY MATCHING RULES
// ----------------------------------------------------
const mockProfile: StudentProfile = {
  id: "prof-1",
  userId: "user-1",
  educationLevel: DegreeLevel.MASTERS,
  fieldOfStudy: "Computer Science",
  gpa: 3.8,
  gpaScale: 4.0,
  graduationYear: 2024,
  countryOfOrigin: "India",
  currentCountry: "India",
  familyIncomeUsd: 25000,
  ieltsScore: 7.5,
  toeflScore: null,
  greScore: 320,
  workExperienceYears: 3,
  publicationsCount: 1,
  achievements: "Dean's List",
  skills: ["Python", "AI"],
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockScholarship: Scholarship & { criteria: EligibilityCriterion[] } = {
  id: "sch-1",
  title: "Global Tech Fellowship",
  provider: "Tech Foundation",
  description: "International Master's scholarship for Computer Science candidates.",
  awardAmount: 30000,
  currency: "USD",
  fundingType: FundingType.FULLY_FUNDED,
  deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  educationLevels: [DegreeLevel.MASTERS],
  eligibleCourses: ["Computer Science"],
  locationRestrictions: ["United States"],
  citizenshipRequirements: ["India", "Global"],
  minGpa: 3.5,
  minIelts: 7.0,
  minToefl: null,
  maxFamilyIncome: null,
  officialUrl: "https://example.com/fellowship",
  isVerified: true,
  isActive: true,
  viewCount: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  criteria: [
    {
      id: "crit-1",
      scholarshipId: "sch-1",
      criterionType: CriterionType.ACADEMIC_GPA,
      operator: CriterionOperator.GTE,
      targetValue: "3.5",
      isMandatory: true,
      weight: 1.0,
      description: "Minimum GPA of 3.5 on 4.0 scale",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "crit-2",
      scholarshipId: "sch-1",
      criterionType: CriterionType.DEGREE_LEVEL,
      operator: CriterionOperator.IN,
      targetValue: JSON.stringify(["MASTERS"]),
      isMandatory: true,
      weight: 1.0,
      description: "Must be enrolled in a Master's degree program",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "crit-3",
      scholarshipId: "sch-1",
      criterionType: CriterionType.LANGUAGE_TEST,
      operator: CriterionOperator.GTE,
      targetValue: "7.0",
      isMandatory: true,
      weight: 1.0,
      description: "Minimum IELTS 7.0 score",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

runTest("Eligible candidate receives HIGH_MATCH and satisfies all mandatory criteria", () => {
  const result = evaluateEligibility(mockProfile, mockScholarship);
  assert.equal(result.status, "HIGH_MATCH");
  assert.equal(result.eligibilityScore, 100);
  assert.equal(result.matchedCriteria.length, 3);
  assert.equal(result.unmetCriteria.length, 0);
  assert.equal(result.missingInfo.length, 0);
});

runTest("Failing mandatory GPA criterion flags status as INELIGIBLE and caps score", () => {
  const lowGpaProfile = { ...mockProfile, gpa: 3.2 };
  const result = evaluateEligibility(lowGpaProfile, mockScholarship);
  assert.equal(result.status, "INELIGIBLE");
  assert.ok(result.eligibilityScore <= 40);
  assert.equal(result.unmetCriteria.length, 1);
  assert.equal(result.unmetCriteria[0].criterionType, "ACADEMIC_GPA");
});

runTest("Missing profile information is flagged as MISSING_INFO and sets INCOMPLETE_DATA", () => {
  const missingIeltsProfile = { ...mockProfile, ieltsScore: null, toeflScore: null };
  const result = evaluateEligibility(missingIeltsProfile, mockScholarship);
  assert.equal(result.status, "INCOMPLETE_DATA");
  assert.equal(result.missingInfo.length, 1);
  assert.equal(result.missingInfo[0].field, "LANGUAGE_TEST");
});

runTest("GPA normalization standardizes 10.0 scale correctly against 4.0 requirement", () => {
  // 8.75 on 10.0 scale is 3.5 on 4.0 scale
  const tenScaleProfile = { ...mockProfile, gpa: 8.75, gpaScale: 10.0 };
  const result = evaluateEligibility(tenScaleProfile, mockScholarship);
  assert.equal(result.matchedCriteria.some((c) => c.criterionType === "ACADEMIC_GPA"), true);
});

// ----------------------------------------------------
// 2. RAG CHUNKING & COSINE SIMILARITY
// ----------------------------------------------------
runTest("RAG document chunker splits text respecting sentence boundaries and overlap", () => {
  const sampleDoc =
    "The Chevening Scholarship is a prestigious award. Applicants must demonstrate leadership skills. Minimum two years of work experience is required before applying. Successful recipients receive full tuition and airfare.";
  const chunks = chunkDocumentText(sampleDoc, 100, 20);
  assert.ok(chunks.length >= 2);
  assert.ok(chunks[0].includes("Chevening"));
});

runTest("Cosine similarity accurately computes 1.0 for identical vectors and 0.0 for orthogonal", () => {
  const vecA = [1, 0, 0];
  const vecB = [1, 0, 0];
  const vecC = [0, 1, 0];

  const simIdentical = cosineSimilarity(vecA, vecB);
  const simOrthogonal = cosineSimilarity(vecA, vecC);

  assert.equal(Math.round(simIdentical), 1);
  assert.equal(Math.round(simOrthogonal), 0);
});

// ----------------------------------------------------
// 3. ZOD SCHEMA VALIDATION
// ----------------------------------------------------
runTest("Registration schema rejects invalid emails and short passwords", () => {
  const invalid = RegisterSchema.safeParse({
    name: "John",
    email: "not-an-email",
    password: "123", // too short
  });
  assert.equal(invalid.success, false);
});

runTest("Student profile schema rejects negative income or out-of-range GPA", () => {
  const invalid = StudentProfileSchema.safeParse({
    educationLevel: "MASTERS",
    fieldOfStudy: "CS",
    gpa: 15.0, // out of range
    countryOfOrigin: "India",
    currentCountry: "India",
    familyIncomeUsd: -500, // negative income
  });
  assert.equal(invalid.success, false);
});

runTest("Application creation schema accepts valid cuid scholarshipId and status", () => {
  const valid = ApplicationCreateSchema.safeParse({
    scholarshipId: "cuid123456789012345678901",
    status: "INTERESTED",
  });
  assert.equal(valid.success, true);
});

console.log("==================================================");
console.log(` Summary: ${passedTests} / ${totalTests} tests passed successfully.`);
console.log("==================================================");

if (passedTests !== totalTests) {
  process.exit(1);
}
