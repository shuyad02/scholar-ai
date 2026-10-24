import { StudentProfile, Scholarship, EligibilityCriterion } from "@prisma/client";
import { CriterionEvaluation, EligibilityAnalysisResult, MatchStatus } from "@/types";

interface ExtendedScholarship extends Scholarship {
  criteria: EligibilityCriterion[];
}

/**
 * Deterministic Rules-Based Eligibility Matching Engine
 * Evaluates student profiles against explicit scholarship criteria.
 * Zero LLM hallucination: all mathematical and factual checks are deterministic.
 */
export function evaluateEligibility(
  profile: StudentProfile,
  scholarship: ExtendedScholarship
): Omit<EligibilityAnalysisResult, "explanation" | "nextSteps"> {
  const matchedCriteria: CriterionEvaluation[] = [];
  const unmetCriteria: CriterionEvaluation[] = [];
  const missingInfo: { field: string; description: string; impact: "HIGH" | "MEDIUM" | "LOW" }[] = [];

  let totalWeight = 0;
  let earnedWeight = 0;
  let hasUnmetMandatory = false;
  let hasMissingMandatory = false;

  const criteria = scholarship.criteria || [];

  // If no granular criteria defined, evaluate against top-level scholarship fields
  if (criteria.length === 0) {
    return evaluateFallbackFields(profile, scholarship);
  }

  for (const criterion of criteria) {
    const weight = criterion.weight || 1.0;
    totalWeight += weight;

    const evaluation = evaluateSingleCriterion(profile, criterion);

    if (evaluation.status === "MET") {
      earnedWeight += weight;
      matchedCriteria.push(evaluation);
    } else if (evaluation.status === "UNMET") {
      if (criterion.isMandatory) hasUnmetMandatory = true;
      unmetCriteria.push(evaluation);
    } else {
      // MISSING_INFO
      if (criterion.isMandatory) hasMissingMandatory = true;
      missingInfo.push({
        field: criterion.criterionType,
        description: evaluation.reason,
        impact: criterion.isMandatory ? "HIGH" : "MEDIUM",
      });
    }
  }

  // Calculate raw deterministic score (0 - 100)
  let rawScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 70;
  rawScore = Math.round(rawScore * 10) / 10;

  // Determine Match Status
  let status: MatchStatus = "MODERATE_MATCH";

  if (hasUnmetMandatory) {
    status = "INELIGIBLE";
    rawScore = Math.min(rawScore, 35); // Cap score if mandatory criteria fail
  } else if (hasMissingMandatory) {
    status = "INCOMPLETE_DATA";
  } else if (rawScore >= 80) {
    status = "HIGH_MATCH";
  } else if (rawScore >= 50) {
    status = "MODERATE_MATCH";
  } else {
    status = "LOW_MATCH";
  }

  return {
    scholarshipId: scholarship.id,
    scholarshipTitle: scholarship.title,
    eligibilityScore: rawScore,
    status,
    matchedCriteria,
    unmetCriteria,
    missingInfo,
  };
}

/**
 * Evaluates an individual criterion deterministically against student profile
 */
function evaluateSingleCriterion(
  profile: StudentProfile,
  criterion: EligibilityCriterion
): CriterionEvaluation {
  const { criterionType, operator, targetValue, description, isMandatory } = criterion;

  switch (criterionType) {
    case "ACADEMIC_GPA": {
      const requiredGpa = parseFloat(targetValue);
      if (profile.gpa === null || profile.gpa === undefined) {
        return {
          id: criterion.id,
          criterionType,
          description,
          isMandatory,
          status: "MISSING_INFO",
          reason: "GPA is missing in your student profile.",
        };
      }

      // Normalize GPA to 4.0 scale
      const normalizedGpa = (profile.gpa / (profile.gpaScale || 4.0)) * 4.0;
      const meetsGpa =
        operator === "GTE"
          ? normalizedGpa >= requiredGpa
          : operator === "LTE"
          ? normalizedGpa <= requiredGpa
          : normalizedGpa >= requiredGpa;

      return {
        id: criterion.id,
        criterionType,
        description,
        isMandatory,
        status: meetsGpa ? "MET" : "UNMET",
        studentValue: Number(normalizedGpa.toFixed(2)),
        requiredValue: requiredGpa,
        reason: meetsGpa
          ? `Normalized GPA (${normalizedGpa.toFixed(2)}/4.0) satisfies requirement (${requiredGpa}).`
          : `Normalized GPA (${normalizedGpa.toFixed(2)}/4.0) is below required minimum (${requiredGpa}).`,
      };
    }

    case "DEGREE_LEVEL": {
      if (!profile.educationLevel) {
        return {
          id: criterion.id,
          criterionType,
          description,
          isMandatory,
          status: "MISSING_INFO",
          reason: "Degree level is not specified in profile.",
        };
      }

      let targets: string[] = [];
      try {
        targets = JSON.parse(targetValue);
      } catch {
        targets = [targetValue];
      }

      const meets = targets.includes(profile.educationLevel);
      return {
        id: criterion.id,
        criterionType,
        description,
        isMandatory,
        status: meets ? "MET" : "UNMET",
        studentValue: profile.educationLevel,
        requiredValue: targets.join(", "),
        reason: meets
          ? `Current degree (${profile.educationLevel}) matches target degree level.`
          : `Degree level (${profile.educationLevel}) is not among eligible degrees (${targets.join(", ")}).`,
      };
    }

    case "COURSE_OF_STUDY": {
      if (!profile.fieldOfStudy) {
        return {
          id: criterion.id,
          criterionType,
          description,
          isMandatory,
          status: "MISSING_INFO",
          reason: "Field of study is missing from profile.",
        };
      }

      let eligibleCourses: string[] = [];
      try {
        eligibleCourses = JSON.parse(targetValue);
      } catch {
        eligibleCourses = targetValue.split(",").map((s) => s.trim());
      }

      const lowerField = profile.fieldOfStudy.toLowerCase();
      const meets = eligibleCourses.some(
        (c) =>
          lowerField.includes(c.toLowerCase()) ||
          c.toLowerCase().includes(lowerField) ||
          c.toLowerCase() === "all disciplines"
      );

      return {
        id: criterion.id,
        criterionType,
        description,
        isMandatory,
        status: meets ? "MET" : "UNMET",
        studentValue: profile.fieldOfStudy,
        requiredValue: eligibleCourses.slice(0, 3).join(", "),
        reason: meets
          ? `Field of study (${profile.fieldOfStudy}) matches approved disciplines.`
          : `Field of study (${profile.fieldOfStudy}) does not match listed disciplines.`,
      };
    }

    case "CITIZENSHIP": {
      if (!profile.countryOfOrigin) {
        return {
          id: criterion.id,
          criterionType,
          description,
          isMandatory,
          status: "MISSING_INFO",
          reason: "Citizenship/country of origin is missing.",
        };
      }

      if (targetValue === "NON_US") {
        const isUs =
          profile.countryOfOrigin.toLowerCase() === "united states" ||
          profile.countryOfOrigin.toLowerCase() === "usa" ||
          profile.countryOfOrigin.toLowerCase() === "us";

        return {
          id: criterion.id,
          criterionType,
          description,
          isMandatory,
          status: !isUs ? "MET" : "UNMET",
          studentValue: profile.countryOfOrigin,
          requiredValue: "Non-US Citizen",
          reason: !isUs
            ? `Citizenship (${profile.countryOfOrigin}) qualifies as international non-US.`
            : "Applicants holding U.S. citizenship are not eligible for this foreign award.",
        };
      }

      let eligibleCountries: string[] = [];
      try {
        eligibleCountries = JSON.parse(targetValue);
      } catch {
        eligibleCountries = targetValue.split(",").map((s) => s.trim());
      }

      const meets = eligibleCountries.some(
        (c) =>
          c.toLowerCase() === profile.countryOfOrigin.toLowerCase() ||
          c.toLowerCase() === "global" ||
          c.toLowerCase() === "developing countries"
      );

      return {
        id: criterion.id,
        criterionType,
        description,
        isMandatory,
        status: meets ? "MET" : "UNMET",
        studentValue: profile.countryOfOrigin,
        requiredValue: eligibleCountries.join(", "),
        reason: meets
          ? `Country of origin (${profile.countryOfOrigin}) meets citizenship requirements.`
          : `Citizenship (${profile.countryOfOrigin}) is not among listed eligible countries.`,
      };
    }

    case "LANGUAGE_TEST": {
      const minIelts = parseFloat(targetValue);
      const studentIelts = profile.ieltsScore;
      const studentToefl = profile.toeflScore;

      if (!studentIelts && !studentToefl) {
        return {
          id: criterion.id,
          criterionType,
          description,
          isMandatory,
          status: "MISSING_INFO",
          reason: "English language proficiency score (IELTS or TOEFL) is missing from profile.",
        };
      }

      let meets = false;
      if (studentIelts && studentIelts >= minIelts) {
        meets = true;
      } else if (studentToefl && studentToefl >= 90) {
        meets = true;
      }

      return {
        id: criterion.id,
        criterionType,
        description,
        isMandatory,
        status: meets ? "MET" : "UNMET",
        studentValue: studentIelts ? `IELTS ${studentIelts}` : `TOEFL ${studentToefl}`,
        requiredValue: `IELTS ${minIelts}+ or TOEFL 90+`,
        reason: meets
          ? "Language test score satisfies requirement."
          : `Score is below the required threshold (IELTS ${minIelts}).`,
      };
    }

    case "FINANCIAL_NEED": {
      const maxIncome = parseFloat(targetValue);
      if (profile.familyIncomeUsd === null || profile.familyIncomeUsd === undefined) {
        return {
          id: criterion.id,
          criterionType,
          description,
          isMandatory,
          status: "MISSING_INFO",
          reason: "Household income is not provided for financial need evaluation.",
        };
      }

      const meets = profile.familyIncomeUsd <= maxIncome;
      return {
        id: criterion.id,
        criterionType,
        description,
        isMandatory,
        status: meets ? "MET" : "UNMET",
        studentValue: `$${profile.familyIncomeUsd.toLocaleString()}`,
        requiredValue: `≤ $${maxIncome.toLocaleString()}`,
        reason: meets
          ? "Household income falls within need-based ceiling."
          : "Household income exceeds ceiling for this need-based grant.",
      };
    }

    case "GENERAL": {
      // Typically used for work experience
      const requiredYears = parseFloat(targetValue);
      if (isNaN(requiredYears)) {
        return {
          id: criterion.id,
          criterionType,
          description,
          isMandatory,
          status: "MET",
          reason: "General criterion accepted.",
        };
      }

      const studentYears = profile.workExperienceYears || 0;
      const meets = studentYears >= requiredYears;

      return {
        id: criterion.id,
        criterionType,
        description,
        isMandatory,
        status: meets ? "MET" : "UNMET",
        studentValue: `${studentYears} years`,
        requiredValue: `${requiredYears} years`,
        reason: meets
          ? `Work experience (${studentYears} yrs) meets required threshold (${requiredYears} yrs).`
          : `Work experience (${studentYears} yrs) is below required minimum (${requiredYears} yrs).`,
      };
    }

    default:
      return {
        id: criterion.id,
        criterionType,
        description,
        isMandatory,
        status: "MET",
        reason: "Criterion checked.",
      };
  }
}

/**
 * Fallback evaluator when granular criteria table rows have not yet been defined
 */
function evaluateFallbackFields(
  profile: StudentProfile,
  scholarship: Scholarship
): Omit<EligibilityAnalysisResult, "explanation" | "nextSteps"> {
  const matchedCriteria: CriterionEvaluation[] = [];
  const unmetCriteria: CriterionEvaluation[] = [];
  const missingInfo: { field: string; description: string; impact: "HIGH" | "MEDIUM" | "LOW" }[] = [];

  let score = 80;

  // Check degree level
  if (scholarship.educationLevels.length > 0) {
    if (scholarship.educationLevels.includes(profile.educationLevel)) {
      matchedCriteria.push({
        id: "fb-degree",
        criterionType: "DEGREE_LEVEL",
        description: `Degree level must be one of: ${scholarship.educationLevels.join(", ")}`,
        isMandatory: true,
        status: "MET",
        reason: `Your degree level (${profile.educationLevel}) is eligible.`,
      });
    } else {
      unmetCriteria.push({
        id: "fb-degree",
        criterionType: "DEGREE_LEVEL",
        description: `Degree level must be one of: ${scholarship.educationLevels.join(", ")}`,
        isMandatory: true,
        status: "UNMET",
        reason: `Your degree level (${profile.educationLevel}) does not match.`,
      });
      score -= 40;
    }
  }

  // Check GPA
  if (scholarship.minGpa !== null) {
    if (profile.gpa === null) {
      missingInfo.push({
        field: "gpa",
        description: "GPA required to evaluate minimum academic requirement.",
        impact: "HIGH",
      });
    } else {
      const normalized = (profile.gpa / profile.gpaScale) * 4.0;
      if (normalized >= scholarship.minGpa) {
        matchedCriteria.push({
          id: "fb-gpa",
          criterionType: "ACADEMIC_GPA",
          description: `Minimum GPA of ${scholarship.minGpa}`,
          isMandatory: true,
          status: "MET",
          reason: `Normalized GPA (${normalized.toFixed(2)}) meets minimum.`,
        });
      } else {
        unmetCriteria.push({
          id: "fb-gpa",
          criterionType: "ACADEMIC_GPA",
          description: `Minimum GPA of ${scholarship.minGpa}`,
          isMandatory: true,
          status: "UNMET",
          reason: `Normalized GPA (${normalized.toFixed(2)}) is below ${scholarship.minGpa}.`,
        });
        score -= 30;
      }
    }
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const status: MatchStatus =
    unmetCriteria.length > 0 ? "INELIGIBLE" : missingInfo.length > 0 ? "INCOMPLETE_DATA" : "HIGH_MATCH";

  return {
    scholarshipId: scholarship.id,
    scholarshipTitle: scholarship.title,
    eligibilityScore: finalScore,
    status,
    matchedCriteria,
    unmetCriteria,
    missingInfo,
  };
}
