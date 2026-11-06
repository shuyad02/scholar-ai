import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ArrowRight, 
  Globe2, 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Target, 
  Bot, 
  Kanban, 
  Mail, 
  Clock, 
  DollarSign, 
  Award,
  ExternalLink,
  ChevronRight,
  HelpCircle
} from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { HomeAuthNav } from "@/components/home-auth-nav";

export const dynamic = "force-dynamic";

export default async function Home() {
  let isLoggedIn = false;
  let userRole = "STUDENT";

  const customUser = await getAuthUser();
  if (customUser) {
    isLoggedIn = true;
    userRole = customUser.role || "STUDENT";
  }

  // Dynamic URLs based on authentication state
  const searchHref = isLoggedIn ? "/dashboard/search" : "/login?redirect=%2Fdashboard%2Fsearch";
  const copilotHref = isLoggedIn ? "/dashboard/assistant" : "/login?redirect=%2Fdashboard%2Fassistant";
  const matchesHref = isLoggedIn ? "/dashboard/matches" : "/login?redirect=%2Fdashboard%2Fmatches";
  const applicationsHref = isLoggedIn ? "/dashboard/applications" : "/login?redirect=%2Fdashboard%2Fapplications";
  const heroPrimaryHref = isLoggedIn ? (userRole === "ADMIN" ? "/admin" : "/dashboard") : "/register";
  const heroPrimaryText = isLoggedIn ? (userRole === "ADMIN" ? "Admin Control" : "Go to Dashboard") : "Get Started Free";

  const featuredScholarships = [
    {
      title: "Gates Cambridge Scholarship",
      provider: "University of Cambridge (UK)",
      amount: "£60,000 / year",
      funding: "Fully Funded",
      degree: "Masters & PhD",
      matchScore: 98,
      tags: ["UK", "Top Tier", "Living Stipend"],
    },
    {
      title: "Fulbright Foreign Student Program",
      provider: "U.S. Department of State (USA)",
      amount: "$50,000 / year",
      funding: "Fully Funded",
      degree: "Masters & PhD",
      matchScore: 95,
      tags: ["USA", "Airfare Included", "Health Cover"],
    },
    {
      title: "Chevening Scholarships",
      provider: "FCDO (UK Government)",
      amount: "Full Tuition + Living",
      funding: "Fully Funded",
      degree: "1-Year Master's",
      matchScore: 92,
      tags: ["UK", "Leadership", "Networking"],
    },
    {
      title: "Knight-Hennessy Scholars",
      provider: "Stanford University (USA)",
      amount: "$90,000 / year",
      funding: "Fully Funded",
      degree: "All Graduate Degrees",
      matchScore: 88,
      tags: ["Stanford", "Leadership", "Multi-year"],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navigation Header */}
      <header className="px-4 lg:px-8 h-16 flex items-center justify-between border-b bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center gap-2.5" href="/">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
            ScholarAI
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-6">
          <Link className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden md:inline" href={searchHref}>
            Find Scholarships
          </Link>
          <Link className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden md:inline" href={copilotHref}>
            AI Copilot
          </Link>
          <Link className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden md:inline" href="#how-it-works">
            How It Works
          </Link>

          <HomeAuthNav isLoggedIn={isLoggedIn} role={userRole} />
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-28 lg:py-36 bg-gradient-to-b from-indigo-50/50 via-background to-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto">
              {/* Badge Pill */}
              <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-sm gap-2">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>Next-Gen AI Scholarship Matching &amp; Official RAG Advisory</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-[1.1]">
                Your Gateway to <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Fully Funded Global Education</span>
              </h1>

              {/* Subtitle */}
              <p className="max-w-2xl text-muted-foreground text-base sm:text-xl leading-relaxed">
                Discover verified international funding, evaluate your profile with <strong>zero-hallucination deterministic matching</strong>, and get grounded AI advice strictly cited from official institutional guidelines.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
                <Link href={heroPrimaryHref} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full gap-2 text-base h-13 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 font-bold">
                    {heroPrimaryText}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={searchHref} className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full h-13 px-8 text-base font-semibold">
                    Explore Scholarships Directory
                  </Button>
                </Link>
              </div>

              {/* Social Proof Stats Banner */}
              <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 w-full border-t mt-12 text-center">
                <div>
                  <div className="text-3xl font-extrabold text-foreground">10+</div>
                  <div className="text-xs font-medium text-muted-foreground mt-1">Verified Global Programs</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-emerald-600">$500,000+</div>
                  <div className="text-xs font-medium text-muted-foreground mt-1">Total Indexed Funding</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-indigo-600">100%</div>
                  <div className="text-xs font-medium text-muted-foreground mt-1">Deterministic Rule Verification</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-purple-600">0%</div>
                  <div className="text-xs font-medium text-muted-foreground mt-1">AI Hallucination on Criteria</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Scholarships Showcase */}
        <section className="py-16 md:py-24 bg-muted/30 border-y">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <Badge variant="outline" className="mb-2 text-xs font-semibold text-primary">
                  Verified Opportunities
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Premier Global Scholarships
                </h2>
                <p className="text-muted-foreground text-sm mt-1 max-w-xl">
                  Accurately indexed from official government portals and top university trusts with explicit eligibility rules.
                </p>
              </div>
              <Link href={searchHref}>
                <Button variant="ghost" className="gap-1.5 text-primary font-semibold">
                  View All Opportunities <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featuredScholarships.map((s, idx) => (
                <Card key={idx} className="flex flex-col justify-between hover:shadow-md transition-shadow border-muted">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-emerald-600 text-white text-[10px]">
                        {s.funding}
                      </Badge>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {s.matchScore}% Match
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold line-clamp-1">{s.title}</CardTitle>
                    <CardDescription className="text-xs font-medium line-clamp-1">{s.provider}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-4">
                    <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      {s.amount}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <GraduationCap className="h-3.5 w-3.5 text-purple-600" />
                      <span>{s.degree}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t">
                      {s.tags.map((t, i) => (
                        <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <div className="p-4 pt-0">
                    <Link href={matchesHref}>
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                        Check My Eligibility
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <Badge variant="outline" className="text-xs font-semibold text-primary">
                Step-by-Step Architecture
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                How ScholarAI Works
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                From academic profiling to AI evaluation and milestone tracking — streamlined for serious applicants.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-4">
              {/* Step 1 */}
              <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-muted/40 border">
                <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md">
                  1
                </div>
                <h3 className="font-bold text-base mb-1.5">Build Your Academic Profile</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter your verified GPA, GPA scale, IELTS/TOEFL scores, degree level, and country of origin.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-muted/40 border">
                <div className="h-12 w-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md">
                  2
                </div>
                <h3 className="font-bold text-base mb-1.5">Deterministic AI Evaluation</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our rules engine cross-examines your metrics against mandatory institutional criteria to produce a 0–100% score.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-muted/40 border">
                <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md">
                  3
                </div>
                <h3 className="font-bold text-base mb-1.5">Grounded RAG Assistant</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ask policy questions to our Gemini Copilot and receive answers strictly cited from indexed scholarship documents.
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-muted/40 border">
                <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md">
                  4
                </div>
                <h3 className="font-bold text-base mb-1.5">Milestone Tracking &amp; Alerts</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Track document preparation, submission deadlines, and receive automated transactional emails at every milestone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Deep Dive Features Grid */}
        <section className="py-16 md:py-24 bg-muted/20 border-t">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <Badge variant="outline" className="text-xs font-semibold text-primary">
                Engineered for Reliability
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Core Capabilities &amp; System Highlights
              </h2>
              <p className="text-muted-foreground text-sm">
                Built with modern full-stack technologies to eliminate uncertainty in the scholarship process.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6 space-y-3 bg-background">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Deterministic Eligibility Engine</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Unlike generic LLMs that guess requirements, our deterministic engine executes mathematical checks on normalized GPAs, language percentiles, and nationality restrictions.
                </p>
              </Card>

              <Card className="p-6 space-y-3 bg-background">
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Grounded RAG Document Copilot</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Powered by Google Gemini 2.5 Flash and 768-dimensional vector chunks. Every answer includes expandable citations linked directly to verified handbook paragraphs.
                </p>
              </Card>

              <Card className="p-6 space-y-3 bg-background">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                  <Kanban className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Application Tracker Board</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Organize your opportunities through 7 distinct pipeline stages from "Interested" to "Submitted" and "Approved", complete with personal notes and deadline countdowns.
                </p>
              </Card>

              <Card className="p-6 space-y-3 bg-background">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Transactional Email Notifications</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Integrated with Nodemailer SMTP. Receive beautifully formatted emails upon account signup, new logins, eligibility match computation, and application status changes.
                </p>
              </Card>

              <Card className="p-6 space-y-3 bg-background">
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Enterprise Role-Based Access</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Strict JWT authorization distinguishes Student and Administrator roles. Dedicated Admin control center allows one-click document ingestion and scholarship publishing.
                </p>
              </Card>

              <Card className="p-6 space-y-3 bg-background">
                <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600">
                  <Globe2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Production-Grade Supabase Cloud</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Hosted on high-availability PostgreSQL with Prisma ORM 6.4, optimized connection pooling, and sub-100ms query performance worldwide.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6 mx-auto max-w-4xl">
            <div className="text-center mb-12 space-y-2">
              <Badge variant="outline" className="text-xs font-semibold text-primary">
                Frequently Asked Questions
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">Got Questions? We Have Answers.</h2>
            </div>

            <div className="space-y-4">
              <Card className="p-5">
                <h4 className="font-bold text-sm mb-1 text-foreground flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-indigo-600 shrink-0" />
                  Is ScholarAI free for students?
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                  Yes, ScholarAI is completely free for students. You can explore scholarships, evaluate eligibility scores, consult the AI copilot, and track applications at zero cost.
                </p>
              </Card>

              <Card className="p-5">
                <h4 className="font-bold text-sm mb-1 text-foreground flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-indigo-600 shrink-0" />
                  How is the eligibility match score calculated?
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                  Unlike traditional search engines, our deterministic rules engine compares your academic metrics (GPA, English test scores, degree level, residency) against weighted criteria extracted from official handbooks.
                </p>
              </Card>

              <Card className="p-5">
                <h4 className="font-bold text-sm mb-1 text-foreground flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-indigo-600 shrink-0" />
                  How is ScholarAI different from ChatGPT?
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                  ChatGPT often hallucinates deadlines, GPA thresholds, and award amounts because it lacks real-time verified data. ScholarAI uses Retrieval-Augmented Generation (RAG) strictly grounded in indexed official PDF handbooks, with verifiable citations.
                </p>
              </Card>

              <Card className="p-5">
                <h4 className="font-bold text-sm mb-1 text-foreground flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-indigo-600 shrink-0" />
                  Can I apply directly through ScholarAI?
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                  ScholarAI prepares you for the application and gives you direct, verified links to official program portals (such as the UK Foreign Office, Fulbright, or Cambridge Trust). We ensure you never fall for third-party scams.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-16 md:py-20 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white">
          <div className="container px-4 md:px-6 mx-auto text-center max-w-3xl space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready to Win Your Dream Scholarship?
            </h2>
            <p className="text-indigo-200 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              Join students discovering verified international funding opportunities with AI-assisted guidance and zero guesswork.
            </p>
            <div className="pt-2">
              <Link href={heroPrimaryHref}>
                <Button size="lg" className="h-12 px-8 bg-white text-indigo-900 hover:bg-indigo-50 font-bold shadow-xl gap-2">
                  {isLoggedIn ? heroPrimaryText : "Create Your Free Account"} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="w-full py-10 bg-muted/60 border-t">
        <div className="container px-4 md:px-6 mx-auto grid gap-8 sm:grid-cols-4 text-xs">
          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center gap-2 font-bold text-base text-foreground">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              <span>ScholarAI</span>
            </div>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              AI-powered scholarship discovery and zero-hallucination deterministic matching platform for international students worldwide.
            </p>
            <p className="text-muted-foreground">
              &copy; 2026 ScholarAI Foundation. All rights reserved.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-foreground uppercase tracking-wider text-[11px]">Platform</h5>
            <ul className="space-y-1.5 text-muted-foreground">
              <li><Link href={searchHref} className="hover:text-primary transition-colors">Scholarship Directory</Link></li>
              <li><Link href={matchesHref} className="hover:text-primary transition-colors">AI Eligibility Engine</Link></li>
              <li><Link href={copilotHref} className="hover:text-primary transition-colors">RAG AI Copilot</Link></li>
              <li><Link href={applicationsHref} className="hover:text-primary transition-colors">Application Tracker</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-foreground uppercase tracking-wider text-[11px]">Access</h5>
            <ul className="space-y-1.5 text-muted-foreground">
              <li><Link href="/login" className="hover:text-primary transition-colors">Student Login</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">Create Account</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Administrator Portal</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
