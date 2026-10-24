import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { ApplicationCreateSchema } from "@/lib/validations";
import { successResponse, errorResponse, AppError } from "@/lib/api-response";
import { ApplicationStatus } from "@prisma/client";

/**
 * GET /api/applications
 * Returns all scholarship applications tracked by the current student.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthUser(req);
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") as ApplicationStatus | null;

    const applications = await prisma.scholarshipApplication.findMany({
      where: {
        userId: session.id,
        status: statusFilter || undefined,
      },
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
      orderBy: [
        { deadline: "asc" },
        { updatedAt: "desc" },
      ],
    });

    // Summary statistics
    const stats = {
      total: applications.length,
      interested: applications.filter((a) => a.status === "INTERESTED").length,
      preparing: applications.filter((a) => a.status === "PREPARING_DOCUMENTS").length,
      ready: applications.filter((a) => a.status === "READY_TO_APPLY").length,
      submitted: applications.filter((a) => a.status === "SUBMITTED").length,
      underReview: applications.filter((a) => a.status === "UNDER_REVIEW").length,
      approved: applications.filter((a) => a.status === "APPROVED").length,
      rejected: applications.filter((a) => a.status === "REJECTED").length,
    };

    return successResponse({ applications, stats }, "Applications retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/applications
 * Adds a scholarship to the student's tracker with duplicate prevention.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthUser(req);
    const body = await req.json();
    const validated = ApplicationCreateSchema.parse(body);

    // 1. Verify scholarship exists
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: validated.scholarshipId },
    });

    if (!scholarship) {
      throw new AppError("Scholarship not found", 404, "SCHOLARSHIP_NOT_FOUND");
    }

    // 2. Prevent duplicate application records
    const existing = await prisma.scholarshipApplication.findUnique({
      where: {
        userId_scholarshipId: {
          userId: session.id,
          scholarshipId: validated.scholarshipId,
        },
      },
    });

    if (existing) {
      throw new AppError(
        "You are already tracking an application for this scholarship.",
        409,
        "DUPLICATE_APPLICATION"
      );
    }

    // 3. Create application record
    const application = await prisma.scholarshipApplication.create({
      data: {
        userId: session.id,
        scholarshipId: validated.scholarshipId,
        status: validated.status,
        deadline: validated.deadline ? new Date(validated.deadline) : scholarship.deadline,
        personalNotes: validated.personalNotes,
      },
      include: {
        scholarship: true,
      },
    });

    return successResponse(application, "Application tracked successfully", undefined, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
