import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { MatchRequestSchema } from "@/lib/validations";
import { evaluateEligibility } from "@/lib/matching-engine";
import { synthesizeEligibilityExplanation } from "@/lib/gemini-service";
import { successResponse, errorResponse, AppError } from "@/lib/api-response";
import { Prisma } from "@prisma/client";

/**
 * GET /api/matches
 * Returns saved eligibility match records for the authenticated student.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthUser(req);

    const matches = await prisma.scholarshipMatch.findMany({
      where: { userId: session.id },
      include: {
        scholarship: {
          select: {
            id: true,
            title: true,
            provider: true,
            awardAmount: true,
            currency: true,
            fundingType: true,
            deadline: true,
            officialUrl: true,
            isVerified: true,
          },
        },
      },
      orderBy: { eligibilityScore: "desc" },
    });

    return successResponse(matches, "Matches retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/matches
 * Computes deterministic eligibility + Gemini synthesis for a scholarship.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthUser(req);
    const body = await req.json();
    const { scholarshipId, forceRefresh } = MatchRequestSchema.parse(body);

    // 1. Fetch student's profile
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.id },
    });

    if (!profile) {
      throw new AppError(
        "Please complete your Student Profile before running eligibility matching.",
        400,
        "PROFILE_INCOMPLETE"
      );
    }

    // 2. Fetch target scholarship
    if (!scholarshipId) {
      throw new AppError("A valid scholarship ID must be provided.", 400, "MISSING_SCHOLARSHIP_ID");
    }

    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
      include: { criteria: true },
    });

    if (!scholarship) {
      throw new AppError("Scholarship not found", 404, "SCHOLARSHIP_NOT_FOUND");
    }

    // 3. Check cached match if forceRefresh is false
    if (!forceRefresh) {
      const existingMatch = await prisma.scholarshipMatch.findUnique({
        where: {
          userId_scholarshipId: {
            userId: session.id,
            scholarshipId: scholarship.id,
          },
        },
      });

      if (existingMatch) {
        return successResponse(existingMatch, "Retrieved cached eligibility match");
      }
    }

    // 4. Deterministic Rule Matching
    const deterministicResult = evaluateEligibility(profile, scholarship);

    // 5. Gemini AI Synthesis for transparent explanation & actionable next steps
    const { explanation, nextSteps } = await synthesizeEligibilityExplanation(
      deterministicResult,
      session.name
    );

    // 6. Persist or update match in database
    const savedMatch = await prisma.scholarshipMatch.upsert({
      where: {
        userId_scholarshipId: {
          userId: session.id,
          scholarshipId: scholarship.id,
        },
      },
      update: {
        eligibilityScore: deterministicResult.eligibilityScore,
        status: deterministicResult.status,
        matchedCriteria: deterministicResult.matchedCriteria as unknown as Prisma.InputJsonValue,
        unmetCriteria: deterministicResult.unmetCriteria as unknown as Prisma.InputJsonValue,
        missingInfo: deterministicResult.missingInfo as unknown as Prisma.InputJsonValue,
        explanation,
        nextSteps,
        calculatedAt: new Date(),
      },
      create: {
        userId: session.id,
        scholarshipId: scholarship.id,
        eligibilityScore: deterministicResult.eligibilityScore,
        status: deterministicResult.status,
        matchedCriteria: deterministicResult.matchedCriteria as unknown as Prisma.InputJsonValue,
        unmetCriteria: deterministicResult.unmetCriteria as unknown as Prisma.InputJsonValue,
        missingInfo: deterministicResult.missingInfo as unknown as Prisma.InputJsonValue,
        explanation,
        nextSteps,
      },
    });

    return successResponse(
      {
        ...deterministicResult,
        explanation,
        nextSteps,
        id: savedMatch.id,
      },
      "Eligibility evaluation complete"
    );
  } catch (error) {
    return errorResponse(error);
  }
}
