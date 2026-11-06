import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);

    const [
      totalScholarships,
      activeScholarships,
      verifiedScholarships,
      totalUsers,
      totalStudents,
      totalAdmins,
      totalApplications,
      applicationsByStatus,
      totalDocuments,
      totalChunks,
      recentApplications,
      recentUsers,
    ] = await Promise.all([
      prisma.scholarship.count(),
      prisma.scholarship.count({ where: { isActive: true } }),
      prisma.scholarship.count({ where: { isVerified: true } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.scholarshipApplication.count(),
      prisma.scholarshipApplication.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.scholarshipDocument.count(),
      prisma.documentChunk.count(),
      prisma.scholarshipApplication.findMany({
        take: 6,
        orderBy: { updatedAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          scholarship: { select: { id: true, title: true, provider: true } },
        },
      }),
      prisma.user.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { applications: true, matches: true } },
        },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    applicationsByStatus.forEach((item) => {
      statusCounts[item.status] = item._count.status;
    });

    return successResponse(
      {
        kpis: {
          totalScholarships,
          activeScholarships,
          verifiedScholarships,
          totalUsers,
          totalStudents,
          totalAdmins,
          totalApplications,
          totalDocuments,
          totalChunks,
        },
        statusCounts,
        recentApplications,
        recentUsers,
        systemHealth: {
          database: "CONNECTED",
          aiEngine: process.env.GEMINI_API_KEY ? "ONLINE (Gemini 2.5)" : "UNCONFIGURED",
          emailService: process.env.GMAIL_USER ? "ONLINE (Nodemailer SMTP)" : "UNCONFIGURED",
        },
      },
      "Admin overview loaded successfully"
    );
  } catch (error) {
    return errorResponse(error);
  }
}
