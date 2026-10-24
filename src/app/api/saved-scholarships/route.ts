import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, AppError } from "@/lib/api-response";
import { z } from "zod";

const SaveScholarshipSchema = z.object({
  scholarshipId: z.string().cuid("Invalid scholarship ID"),
});

/**
 * GET /api/saved-scholarships
 * List all scholarships saved by the authenticated student.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthUser(req);

    const saved = await prisma.savedScholarship.findMany({
      where: { userId: session.id },
      include: {
        scholarship: {
          include: {
            criteria: true,
          },
        },
      },
      orderBy: { savedAt: "desc" },
    });

    return successResponse(saved, "Saved scholarships retrieved");
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/saved-scholarships
 * Bookmark a scholarship.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthUser(req);
    const body = await req.json();
    const { scholarshipId } = SaveScholarshipSchema.parse(body);

    // Verify scholarship exists
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
    });

    if (!scholarship) {
      throw new AppError("Scholarship not found", 404, "NOT_FOUND");
    }

    const saved = await prisma.savedScholarship.upsert({
      where: {
        userId_scholarshipId: {
          userId: session.id,
          scholarshipId,
        },
      },
      update: {},
      create: {
        userId: session.id,
        scholarshipId,
      },
      include: {
        scholarship: true,
      },
    });

    return successResponse(saved, "Scholarship saved successfully", undefined, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
