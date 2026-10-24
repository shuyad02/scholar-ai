import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { StudentProfileSchema } from "@/lib/validations";
import { successResponse, errorResponse, AppError } from "@/lib/api-response";

/**
 * GET /api/profile
 * Retrieves the current student's private profile.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthUser(req);

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!profile) {
      throw new AppError("Student profile not found. Please complete profile setup.", 404, "PROFILE_NOT_FOUND");
    }

    return successResponse(profile, "Profile retrieved successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PUT /api/profile
 * Upserts the current student's profile with strict input validation.
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuthUser(req);
    const body = await req.json();
    const validated = StudentProfileSchema.parse(body);

    const profile = await prisma.studentProfile.upsert({
      where: { userId: session.id },
      update: {
        educationLevel: validated.educationLevel,
        fieldOfStudy: validated.fieldOfStudy,
        gpa: validated.gpa,
        gpaScale: validated.gpaScale,
        graduationYear: validated.graduationYear,
        countryOfOrigin: validated.countryOfOrigin,
        currentCountry: validated.currentCountry,
        familyIncomeUsd: validated.familyIncomeUsd,
        ieltsScore: validated.ieltsScore,
        toeflScore: validated.toeflScore,
        greScore: validated.greScore,
        workExperienceYears: validated.workExperienceYears,
        publicationsCount: validated.publicationsCount,
        achievements: validated.achievements,
        skills: validated.skills,
        isVerified: true,
      },
      create: {
        userId: session.id,
        educationLevel: validated.educationLevel,
        fieldOfStudy: validated.fieldOfStudy,
        gpa: validated.gpa,
        gpaScale: validated.gpaScale,
        graduationYear: validated.graduationYear,
        countryOfOrigin: validated.countryOfOrigin,
        currentCountry: validated.currentCountry,
        familyIncomeUsd: validated.familyIncomeUsd,
        ieltsScore: validated.ieltsScore,
        toeflScore: validated.toeflScore,
        greScore: validated.greScore,
        workExperienceYears: validated.workExperienceYears,
        publicationsCount: validated.publicationsCount,
        achievements: validated.achievements,
        skills: validated.skills,
        isVerified: true,
      },
    });

    return successResponse(profile, "Profile updated successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
