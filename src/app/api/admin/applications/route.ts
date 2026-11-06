import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { successResponse, errorResponse, AppError } from "@/lib/api-response";
import { sendEmail } from "@/lib/email";
import { ApplicationStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);

    const applications = await prisma.scholarshipApplication.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                gpa: true,
                countryOfOrigin: true,
                fieldOfStudy: true,
              },
            },
          },
        },
        scholarship: {
          select: {
            id: true,
            title: true,
            provider: true,
            fundingType: true,
            deadline: true,
          },
        },
      },
    });

    return successResponse({ applications }, "Applications retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminUser(req);
    const body = await req.json();
    const { applicationId, status, notes } = body;

    if (!applicationId || !Object.values(ApplicationStatus).includes(status)) {
      throw new AppError("Invalid application ID or status", 400);
    }

    const application = await prisma.scholarshipApplication.update({
      where: { id: applicationId },
      data: {
        status,
        ...(notes !== undefined ? { notes } : {}),
      },
      include: {
        user: { select: { email: true, name: true } },
        scholarship: { select: { title: true } },
      },
    });

    // Send email alert for important status changes
    if (["APPROVED", "REJECTED", "UNDER_REVIEW"].includes(status)) {
      try {
        await sendEmail({
          to: application.user.email,
          subject: `Scholarship Application Status Update: ${application.scholarship.title}`,
          html: `
            <h2>Application Update</h2>
            <p>Dear ${application.user.name},</p>
            <p>The status of your application for <strong>${application.scholarship.title}</strong> has been updated to: <strong>${status}</strong>.</p>
            <p>Log in to your ScholarAI student dashboard to review details and next steps.</p>
          `,
        });
      } catch (mailErr) {
        console.error("Failed to send status update email:", mailErr);
      }
    }

    return successResponse({ application }, `Application status updated to ${status}`);
  } catch (error) {
    return errorResponse(error);
  }
}
