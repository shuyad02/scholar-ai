import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if profile already exists
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { profile: true },
  });

  if (user?.profile) {
    // If profile exists, onboarding is done
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-background rounded-xl border shadow-sm overflow-hidden">
        <div className="p-8 border-b bg-muted/50">
          <h1 className="text-2xl font-bold">Welcome to ScholarAI! 🎓</h1>
          <p className="text-muted-foreground mt-2">
            Let's set up your academic profile so our AI can match you with the best scholarships.
          </p>
        </div>
        <div className="p-8">
          <OnboardingForm userId={userId} dbUserId={user?.id} />
        </div>
      </div>
    </div>
  );
}
