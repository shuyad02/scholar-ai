import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/validations";
import { hashPassword, signToken } from "@/lib/auth";
import { successResponse, errorResponse, AppError } from "@/lib/api-response";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = RegisterSchema.parse(body);

    // 1. Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    if (existing) {
      throw new AppError("An account with this email address already exists.", 409, "USER_EXISTS");
    }

    // 2. Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // 3. Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        passwordHash,
        role: validatedData.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // 4. Generate JWT
    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // 5. Send welcome email (non-blocking — does NOT delay the API response)
    sendWelcomeEmail({ to: user.email, name: user.name }).catch(() => {});

    const response = successResponse(
      {
        user,
        token,
      },
      "Registration successful",
      undefined,
      201
    );

    // Set secure HTTP-only cookie
    response.headers.set(
      "Set-Cookie",
      `scholar_auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; ${
        process.env.NODE_ENV === "production" ? "Secure;" : ""
      }`
    );

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
