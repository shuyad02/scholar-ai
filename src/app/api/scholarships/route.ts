import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { ScholarshipQuerySchema, ScholarshipUpsertSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";
import { Prisma } from "@prisma/client";

/**
 * GET /api/scholarships
 * Filterable, searchable, and paginated scholarship discovery endpoint.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    const query = ScholarshipQuerySchema.parse(queryObj);

    // Build Prisma Where Clause
    const where: Prisma.ScholarshipWhereInput = {
      isActive: true,
    };

    // Text search on title, provider, description
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: "insensitive" } },
        { provider: { contains: query.q, mode: "insensitive" } },
        { description: { contains: query.q, mode: "insensitive" } },
      ];
    }

    if (query.educationLevel) {
      where.educationLevels = { has: query.educationLevel };
    }

    if (query.fundingType) {
      where.fundingType = query.fundingType;
    }

    if (query.course) {
      where.eligibleCourses = { has: query.course };
    }

    if (query.country) {
      where.locationRestrictions = { has: query.country };
    }

    if (query.minAward !== undefined || query.maxAward !== undefined) {
      where.awardAmount = {};
      if (query.minAward !== undefined) where.awardAmount.gte = query.minAward;
      if (query.maxAward !== undefined) where.awardAmount.lte = query.maxAward;
    }

    // Pagination
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    // Sorting
    const orderBy: Prisma.ScholarshipOrderByWithRelationInput = {
      [query.sortBy]: query.sortOrder,
    };

    const [scholarships, total] = await Promise.all([
      prisma.scholarship.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          criteria: true,
          _count: {
            select: { applications: true, documents: true },
          },
        },
      }),
      prisma.scholarship.count({ where }),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return successResponse(scholarships, "Scholarships retrieved successfully", {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/scholarships
 * Protected Admin endpoint to create a new scholarship.
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

    return successResponse(scholarship, "Scholarship created successfully", undefined, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
