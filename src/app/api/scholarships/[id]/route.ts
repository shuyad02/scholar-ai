import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { ScholarshipUpsertSchema } from "@/lib/validations";
import { successResponse, errorResponse, AppError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/scholarships/[id]
 * Fetch detailed scholarship record by ID.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const scholarship = await prisma.scholarship.findUnique({
      where: { id },
      include: {
        criteria: true,
        documents: {
          select: {
            id: true,
            title: true,
            sourceUrl: true,
            version: true,
            createdAt: true,
            _count: {
              select: { chunks: true },
            },
          },
        },
        _count: {
          select: { applications: true, savedBy: true, matches: true },
        },
      },
    });

    if (!scholarship) {
      throw new AppError("Scholarship not found", 404, "SCHOLARSHIP_NOT_FOUND");
    }

    // Increment view count asynchronously
    prisma.scholarship
      .update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});

    return successResponse(scholarship, "Scholarship details retrieved");
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PATCH /api/scholarships/[id]
 * Admin endpoint to update scholarship details.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdminUser(req);
    const { id } = await params;
    const body = await req.json();
    const validated = ScholarshipUpsertSchema.partial().parse(body);

    const updated = await prisma.scholarship.update({
      where: { id },
      data: {
        ...validated,
        deadline: validated.deadline ? new Date(validated.deadline) : undefined,
      },
    });

    return successResponse(updated, "Scholarship updated successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/scholarships/[id]
 * Admin endpoint to soft-archive or delete scholarship.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdminUser(req);
    const { id } = await params;

    await prisma.scholarship.delete({
      where: { id },
    });

    return successResponse({ id }, "Scholarship deleted successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
