import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { ScholarshipUpsertSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * GET /api/admin/scholarships
 * Returns all scholarship records (active and archived) for administrative review.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);

    const scholarships = await prisma.scholarship.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        criteria: true,
        documents: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            _count: { select: { chunks: true } },
          },
        },
        _count: {
          select: {
            applications: true,
            matches: true,
            savedBy: true,
          },
        },
      },
    });

    const summary = {
      total: scholarships.length,
      active: scholarships.filter((s) => s.isActive).length,
      verified: scholarships.filter((s) => s.isVerified).length,
      unverified: scholarships.filter((s) => !s.isVerified).length,
      totalDocuments: scholarships.reduce((acc, s) => acc + s.documents.length, 0),
    };

    return successResponse({ scholarships, summary }, "Admin scholarships retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/admin/scholarships
 * Admin endpoint to register a new verified scholarship.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdminUser(req);
    const body = await req.json();
    const validated = ScholarshipUpsertSchema.parse(body);

    const scholarship = await prisma.scholarship.create({
      data: {
        title: validated.title,
        provider: validated.provider,
        description: validated.description,
        awardAmount: validated.awardAmount,
        currency: validated.currency,
        fundingType: validated.fundingType,
        deadline: new Date(validated.deadline),
        educationLevels: validated.educationLevels,
        eligibleCourses: validated.eligibleCourses,
        locationRestrictions: validated.locationRestrictions,
        citizenshipRequirements: validated.citizenshipRequirements,
        minGpa: validated.minGpa,
        minIelts: validated.minIelts,
        minToefl: validated.minToefl,
        maxFamilyIncome: validated.maxFamilyIncome,
        officialUrl: validated.officialUrl,
        isVerified: validated.isVerified,
        isActive: validated.isActive,
      },
    });

    return successResponse(scholarship, "Scholarship registered successfully", undefined, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
