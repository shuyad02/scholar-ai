import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";
import { AppError } from "./api-response";
import { Role } from "@/types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "scholar-ai-super-secret-jwt-key-minimum-32-chars-long!"
);

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/**
 * Hash plaintext password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify plaintext password against stored hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign JWT session token
 */
export async function signToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token and extract payload
 */
export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

/**
 * Extract authenticated user from Request (Bearer header or HTTP-only cookie)
 */
export async function getAuthUser(req?: NextRequest): Promise<SessionUser | null> {
  let token: string | undefined;

  // 1. Check Bearer Authorization Header
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  // 2. Check Cookie
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("scholar_auth_token")?.value;
    } catch {
      // Cookies not accessible in some standalone contexts
    }
  }

  if (!token) return null;

  return verifyToken(token);
}

/**
 * Require authenticated user or throw AppError (401)
 */
export async function requireAuthUser(req?: NextRequest): Promise<SessionUser> {
  const user = await getAuthUser(req);
  if (!user) {
    throw new AppError("Authentication required. Please log in.", 401, "UNAUTHORIZED");
  }
  return user;
}

/**
 * Require ADMIN role or throw AppError (403)
 */
export async function requireAdminUser(req?: NextRequest): Promise<SessionUser> {
  const user = await requireAuthUser(req);
  if (user.role !== "ADMIN") {
    throw new AppError("Access denied. Administrator privileges required.", 403, "FORBIDDEN");
  }
  return user;
}
