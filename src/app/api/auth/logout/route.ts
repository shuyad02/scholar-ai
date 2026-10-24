import { successResponse } from "@/lib/api-response";

export async function POST() {
  const response = successResponse({ loggedOut: true }, "Logged out successfully");

  response.headers.set(
    "Set-Cookie",
    "scholar_auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;"
  );

  return response;
}
