import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  FileText, 
  GraduationCap, 
  CalendarDays, 
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Bookmark,
  CheckCircle2
} from "lucide-react";

export default async function DashboardPage() {
  let currentUserId: string | null = null;
  let currentUserName = "Scholar";

  // 1. Try Clerk Auth first
  try {
    const clerkAuth = await auth();
    if (clerkAuth?.userId) {
      currentUserId = clerkAuth.userId;
    }
  } catch {
    // Clerk not configured or bypassed
  }

  // 2. Try Custom JWT Session fallback
  if (!currentUserId) {
    const customUser = await getAuthUser();
    if (customUser) {
      currentUserId = customUser.id;
      currentUserName = customUser.name || "Scholar";
    }
  }

  // 3. Find or auto-provision student record for immediate demonstrability
  let dbUser = null;
  if (currentUserId) {
    dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ clerkId: currentUserId }, { id: currentUserId }],
      },
      include: { profile: true },
    });
  }

  // Fallback demo user if not logged in yet
  if (!dbUser) {
    dbUser = await prisma.user.findFirst({
      include: { profile: true },
    });
  }

  if (dbUser && dbUser.name) {
    currentUserName = dbUser.name;
  }

  const userId = dbUser?.id || "demo-student";

  // Fetch real database metrics
  const [activeApplications, totalSaved, totalMatches, recentApps, totalScholarships] = await Promise.all([
    prisma.scholarshipApplication.count({
      where: {
        userId,
        status: { notIn: ["REJECTED", "APPROVED"] },
      },
    }),
    prisma.savedScholarship.count({
      where: { userId },
    }),
    prisma.scholarshipMatch.count({
      where: { userId },
    }),
    prisma.scholarshipApplication.findMany({
      where: { userId },
      include: { scholarship: true },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
    prisma.scholarship.count({
      where: { isActive: true },
    }),
  ]);

  const profileStrength = dbUser?.profile ? 90 : 40;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {currentUserName}! 👋</h1>
        <p className="text-muted-foreground mt-1">
          Here is an overview of your scholarship applications, eligibility matches, and upcoming deadlines.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Active Applications</CardTitle>
            <GraduationCap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">Milestones in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Profile Strength</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profileStrength}%</div>
            <Progress value={profileStrength} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {profileStrength >= 80 ? "Profile verified for matching" : "Add test scores to reach 100%"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Saved Opportunities</CardTitle>
            <Bookmark className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSaved}</div>
            <p className="text-xs text-muted-foreground mt-1">Bookmarked programs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Available Programs</CardTitle>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScholarships}</div>
            <p className="text-xs text-muted-foreground mt-1">Verified global scholarships</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Applications */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Recent Applications</CardTitle>
            <CardDescription>
              Track your ongoing scholarship applications and milestone notes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-4 bg-muted rounded-full mb-3">
                  <GraduationCap className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-base">No active applications yet</h3>
                <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
                  Explore verified scholarships and add opportunities you want to track.
                </p>
                <Link href="/dashboard/search">
                  <Button size="sm">Find Scholarships</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{app.scholarship.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.scholarship.provider} • {app.status.replace("_", " ")}
                      </p>
                    </div>
                    <Badge variant={app.status === "APPROVED" ? "default" : "secondary"} className="text-xs">
                      {app.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
                <Link
                  href="/dashboard/applications"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-2"
                >
                  View full application board <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Quick Actions & Recommendations */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">AI Scholarship Advisory</CardTitle>
            </div>
            <CardDescription>
              Instant guidance tailored to your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-xs space-y-2">
              <div className="font-semibold text-primary">Smart Copilot Ready</div>
              <p className="text-muted-foreground leading-relaxed">
                Ask our grounded RAG assistant any question regarding official Chevening, Fulbright, or DAAD requirements.
              </p>
              <Link href="/dashboard/assistant">
                <Button size="sm" variant="default" className="w-full mt-2 text-xs">
                  Open RAG Assistant
                </Button>
              </Link>
            </div>

            <div className="p-3 bg-muted/30 rounded-xl border text-xs space-y-2">
              <div className="font-semibold text-foreground">Deterministic Eligibility Match</div>
              <p className="text-muted-foreground leading-relaxed">
                Evaluate your verified academic metrics against explicit scholarship rules.
              </p>
              <Link href="/dashboard/matches">
                <Button size="sm" variant="outline" className="w-full text-xs">
                  View Calculated Matches
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
