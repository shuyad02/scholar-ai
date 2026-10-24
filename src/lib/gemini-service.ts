import { GoogleGenerativeAI } from "@google/generative-ai";
import { EligibilityAnalysisResult } from "@/types";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Server-side Gemini AI Service
 * Generates transparent natural language explanations and next steps
 * grounded strictly in deterministic matching results.
 */
export async function synthesizeEligibilityExplanation(
  deterministicResult: Omit<EligibilityAnalysisResult, "explanation" | "nextSteps">,
  studentName?: string
): Promise<{ explanation: string; nextSteps: string[] }> {
  // If Gemini API is not configured or unavailable, return high-quality deterministic fallback
  if (!genAI || !apiKey) {
    return generateDeterministicFallback(deterministicResult);
  }

  const prompt = `You are ScholarAI's Senior Scholarship Admissions Advisor.
Explain the following scholarship eligibility evaluation result clearly, objectively, and encouragingly.

Evaluation Data:
- Student Name: ${studentName || "Candidate"}
- Scholarship: ${deterministicResult.scholarshipTitle}
- Deterministic Match Score: ${deterministicResult.eligibilityScore}%
- Overall Status: ${deterministicResult.status}
- Satisfied Criteria: ${JSON.stringify(deterministicResult.matchedCriteria)}
- Unmet Requirements: ${JSON.stringify(deterministicResult.unmetCriteria)}
- Missing Profile Information: ${JSON.stringify(deterministicResult.missingInfo)}

CRITICAL RULES:
1. Never invent or hallucinate scholarship criteria, deadlines, or requirements.
2. Do NOT treat missing information as proof of eligibility.
3. Do NOT contradict the deterministic match score or status.
4. Output STRICT JSON format with keys "explanation" (string) and "nextSteps" (array of 2-4 strings).

Example output JSON:
{
  "explanation": "You meet the core academic GPA and degree requirements...",
  "nextSteps": [
    "Upload your official transcript...",
    "Take an IELTS test to fulfill the language requirement..."
  ]
}`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2, // Low temperature for factual fidelity
      },
    });

    // Execute with a 7-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    clearTimeout(timeoutId);

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    if (parsed.explanation && Array.isArray(parsed.nextSteps)) {
      return {
        explanation: parsed.explanation,
        nextSteps: parsed.nextSteps,
      };
    }

    return generateDeterministicFallback(deterministicResult);
  } catch (error) {
    console.warn("[ScholarAI Gemini Service Fallback]:", error);
    return generateDeterministicFallback(deterministicResult);
  }
}

/**
 * Deterministic fallback logic ensuring 100% uptime even if external AI provider is offline.
 */
function generateDeterministicFallback(
  res: Omit<EligibilityAnalysisResult, "explanation" | "nextSteps">
): { explanation: string; nextSteps: string[] } {
  let explanation = "";
  const nextSteps: string[] = [];

  if (res.status === "HIGH_MATCH") {
    explanation = `Excellent match! You satisfy all verified mandatory requirements for ${res.scholarshipTitle} with a calculated match score of ${res.eligibilityScore}%.`;
    nextSteps.push("Prepare your statement of purpose tailored to the scholarship provider's mission.");
    nextSteps.push("Gather academic letters of recommendation from faculty.");
    nextSteps.push("Submit your application ahead of the official deadline.");
  } else if (res.status === "INCOMPLETE_DATA") {
    explanation = `Potential opportunity! You meet key criteria, but we lack complete profile data (${res.missingInfo
      .map((m) => m.field)
      .join(", ")}) to confirm full eligibility.`;
    nextSteps.push("Complete missing fields in your Student Profile to verify your score.");
    nextSteps.push("Review official program guidelines on the provider website.");
  } else if (res.status === "INELIGIBLE") {
    explanation = `Currently, your verified profile does not satisfy one or more mandatory eligibility requirements for this award.`;
    nextSteps.push("Explore other scholarships in your discipline that match your qualifications.");
    nextSteps.push("Consider retaking required examinations or building qualifying experience.");
  } else {
    explanation = `Moderate match (${res.eligibilityScore}%). You satisfy several requirements, but competition may favor candidates matching optional criteria.`;
    nextSteps.push("Highlight complementary extracurricular achievements in your application.");
    nextSteps.push("Verify specific program course requirements.");
  }

  return { explanation, nextSteps };
}
