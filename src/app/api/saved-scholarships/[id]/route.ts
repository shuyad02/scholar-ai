import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, AppError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/saved-scholarships/[id]
 * Remove bookmark by scholarship ID or saved record ID.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuthUser(req);
    const { id } = await params;

    // Check if ID is saved record ID or scholarship ID
    const record = await prisma.savedScholarship.findFirst({
      where: {
        userId: session.id,
        OR: [{ id }, { scholarshipId: id }],
      },
    });

    if (!record) {
      throw new AppError("Saved scholarship record not found", 404, "NOT_FOUND");
    }

    await prisma.savedScholarship.delete({
      where: { id: record.id },
    });

    return successResponse({ id: record.id }, "Scholarship removed from saved list");
  } catch (error) {
    return errorResponse(error);
  }
}
