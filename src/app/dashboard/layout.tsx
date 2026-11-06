"use client";

import { useState, useEffect } from "react";
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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("scholar_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.role === "ADMIN") {
          setIsAdmin(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    // Clear JWT cookie from document and clear localStorage
    document.cookie =
      "scholar_auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    localStorage.removeItem("scholar_token");
    localStorage.removeItem("scholar_user");
    router.push("/login");
    router.refresh();
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

        {/* Bottom: Admin Portal (Only if user is ADMIN) */}
        {isAdmin && (
          <div className="border-t p-4 shrink-0">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all"
            >
              <Settings className="h-4 w-4 text-amber-600" />
              Admin Portal
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            Scholarship Discovery &amp; Eligibility
          </div>

          {/* Primary Top-right Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
