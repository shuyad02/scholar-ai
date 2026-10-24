import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { ApplicationUpdateSchema } from "@/lib/validations";
import { successResponse, errorResponse, AppError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/applications/[id]
 * Fetch application details with ownership verification.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuthUser(req);
    const { id } = await params;

    const application = await prisma.scholarshipApplication.findFirst({
      where: {
        id,
        userId: session.id, // Strictly scoped to authenticated owner
      },
      include: {
        scholarship: true,
      },
    });

    if (!application) {
      throw new AppError("Application not found or unauthorized.", 404, "NOT_FOUND");
    }

    return successResponse(application, "Application details retrieved");
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PATCH /api/applications/[id]
 * Update application status, deadlines, or personal notes.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuthUser(req);
    const { id } = await params;
    const body = await req.json();
    const validated = ApplicationUpdateSchema.parse(body);

    // Verify ownership
    const existing = await prisma.scholarshipApplication.findFirst({
      where: {
        id,
        userId: session.id,
      },
    });

    if (!existing) {
      throw new AppError("Application record not found or unauthorized.", 404, "NOT_FOUND");
    }

    const updated = await prisma.scholarshipApplication.update({
      where: { id },
      data: {
        status: validated.status,
        personalNotes: validated.personalNotes !== undefined ? validated.personalNotes : existing.personalNotes,
        deadline: validated.deadline ? new Date(validated.deadline) : undefined,
        submissionDate: validated.submissionDate ? new Date(validated.submissionDate) : undefined,
      },
      include: {
        scholarship: true,
      },
    });

    return successResponse(updated, "Application updated successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/applications/[id]
 * Delete application record with ownership check.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuthUser(req);
    const { id } = await params;

    const existing = await prisma.scholarshipApplication.findFirst({
      where: {
        id,
        userId: session.id,
      },
    });

    if (!existing) {
      throw new AppError("Application record not found or unauthorized.", 404, "NOT_FOUND");
    }

    await prisma.scholarshipApplication.delete({
      where: { id },
    });

    return successResponse({ id }, "Application removed from tracker");
  } catch (error) {
    return errorResponse(error);
  }
}
