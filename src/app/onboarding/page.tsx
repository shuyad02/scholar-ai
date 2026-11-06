import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect("/login?redirect=%2Fonboarding");
  }

  // Check if profile already exists
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: { profile: true },
  });

  if (user?.profile) {
    // Profile already exists — skip onboarding
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-background rounded-xl border shadow-sm overflow-hidden">
        <div className="p-8 border-b bg-muted/50">
          <h1 className="text-2xl font-bold">Welcome to ScholarAI! 🎓</h1>
          <p className="text-muted-foreground mt-2">
            Let&apos;s set up your academic profile so our AI can match you with the best scholarships.
          </p>
        </div>
        <div className="p-8">
          <OnboardingForm userId={authUser.id} dbUserId={user?.id} />
        </div>
      </div>
    </div>
  );
}
