import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { 
  BookOpen, 
  GraduationCap, 
  LayoutDashboard, 
  Settings, 
  Sparkles,
  Search,
  CheckCircle2,
  User
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-background hidden md:block">
        <div className="flex h-16 items-center px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">ScholarAI</span>
          </Link>
        </div>
        <div className="flex flex-col py-4">
          <nav className="grid gap-1 px-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/search"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <Search className="h-4 w-4" />
              Find Scholarships
            </Link>
            <Link
              href="/dashboard/matches"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Eligibility Matches
            </Link>
            <Link
              href="/dashboard/applications"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <BookOpen className="h-4 w-4" />
              My Applications
            </Link>
            <Link
              href="/dashboard/assistant"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              AI Assistant
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <User className="h-4 w-4" />
              Academic Profile
            </Link>
          </nav>
        </div>
        <div className="mt-auto absolute bottom-0 left-0 right-0 p-4 border-t">
          <nav className="grid gap-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <Settings className="h-4 w-4" />
              Admin Portal
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            Scholarship Discovery &amp; Eligibility
          </div>
          <UserButton />
        </header>
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
