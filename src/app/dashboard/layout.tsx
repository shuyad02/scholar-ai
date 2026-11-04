"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Sparkles,
  Search,
  CheckCircle2,
  User,
  LogOut,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    // Clear JWT cookie and localStorage
    document.cookie =
      "scholar_auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    localStorage.removeItem("scholar_token");
    localStorage.removeItem("scholar_user");
    router.push("/login");
  }

  const navLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/search", icon: Search, label: "Find Scholarships" },
    { href: "/dashboard/matches", icon: CheckCircle2, label: "Eligibility Matches", iconClass: "text-emerald-600" },
    { href: "/dashboard/applications", icon: BookOpen, label: "My Applications" },
    { href: "/dashboard/assistant", icon: Sparkles, label: "AI Assistant", iconClass: "text-primary" },
    { href: "/dashboard/profile", icon: User, label: "Academic Profile" },
  ];

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-background hidden md:flex flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">ScholarAI</span>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-4 grid gap-1 content-start">
          {navLinks.map(({ href, icon: Icon, label, iconClass }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}
              >
                <Icon className={`h-4 w-4 ${iconClass || ""}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Admin + Logout */}
        <div className="border-t p-4 grid gap-1 shrink-0">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-all hover:text-primary hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
            Admin Portal
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-all w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            Scholarship Discovery &amp; Eligibility
          </div>

          {/* Top-right logout button (mobile friendly) */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
