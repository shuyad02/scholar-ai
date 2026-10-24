import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/lib/validations";
import { verifyPassword, signToken } from "@/lib/auth";
import { successResponse, errorResponse, AppError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = LoginSchema.parse(body);

    // 1. Locate user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        profile: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
    }

    // 2. Validate password
    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
    }

    // 3. Generate token
    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = successResponse(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          hasProfile: !!user.profile,
        },
        token,
      },
      "Login successful"
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
