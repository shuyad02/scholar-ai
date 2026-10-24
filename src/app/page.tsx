import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe2, GraduationCap, Sparkles, BookOpen } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  try {
    const authObj = await auth();
    if (authObj?.userId) {
      redirect("/dashboard");
    }
  } catch {
    // Continue to landing page if Clerk auth is unconfigured or not logged in
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">ScholarAI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/dashboard/search">
            Scholarships
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/dashboard/assistant">
            AI Assistant
          </Link>
          <Link href="/dashboard">
            <Button size="sm">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Scholarship Matching &amp; RAG Advisory
              </div>
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Your journey to <span className="text-primary">global education</span> starts here
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed">
                  Discover verified international scholarships, verify criteria with zero-hallucination deterministic matching, and get grounded RAG advice with official citations.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full gap-2 text-base h-12 px-8">
                    Explore Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard/search" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full h-12 px-8 text-base">
                    Find Scholarships
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Everything you need to succeed</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We provide the tools and grounded intelligence to make your study abroad dream a reality.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-muted/50 rounded-2xl transition-all hover:scale-105">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Globe2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Verified Database</h3>
                <p className="text-center text-muted-foreground text-sm">Access verified scholarships from Chevening, Fulbright, DAAD and top global foundations.</p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-muted/50 rounded-2xl transition-all hover:scale-105">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Deterministic Matcher</h3>
                <p className="text-center text-muted-foreground text-sm">Deterministic rule evaluation verifies your GPA, country, and study field against official criteria.</p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-muted/50 rounded-2xl transition-all hover:scale-105">
                <div className="p-4 bg-primary/10 rounded-full">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Grounded RAG Copilot</h3>
                <p className="text-center text-muted-foreground text-sm">Ask any question and receive answers strictly grounded in official scholarship documentation.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-muted border-t">
        <div className="container px-4 md:px-6 mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 ScholarAI. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="/dashboard">
              Dashboard
            </Link>
            <Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="/dashboard/assistant">
              AI Copilot
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
