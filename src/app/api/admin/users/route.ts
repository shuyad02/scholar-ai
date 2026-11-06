import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { successResponse, errorResponse, AppError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            educationLevel: true,
            fieldOfStudy: true,
            gpa: true,
            gpaScale: true,
            countryOfOrigin: true,
          },
        },
        _count: {
          select: {
            applications: true,
            matches: true,
            savedScholarships: true,
          },
        },
      },
    });

    return successResponse({ users }, "Users retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdminUser(req);
    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !["STUDENT", "ADMIN"].includes(role)) {
      throw new AppError("Invalid user ID or role", 400);
    }

    if (userId === admin.id && role !== "ADMIN") {
      throw new AppError("You cannot demote yourself from Administrator", 400);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return successResponse({ user: updated }, `User role updated to ${role}`);
  } catch (error) {
    return errorResponse(error);
  }
}
