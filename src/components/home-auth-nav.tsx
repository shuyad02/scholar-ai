"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ShieldCheck, LogOut } from "lucide-react";

interface HomeAuthNavProps {
  isLoggedIn: boolean;
  role?: string;
}

export function HomeAuthNav({ isLoggedIn, role }: HomeAuthNavProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed", err);
    }
    document.cookie =
      "scholar_auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    localStorage.removeItem("scholar_token");
    localStorage.removeItem("scholar_user");
    router.refresh();
  };

  if (isLoggedIn) {
    const dashboardHref = role === "ADMIN" ? "/admin" : "/dashboard";
    const dashboardLabel = role === "ADMIN" ? "Admin Control" : "My Dashboard";
    const DashboardIcon = role === "ADMIN" ? ShieldCheck : LayoutDashboard;

    return (
      <div className="flex items-center gap-2.5">
        <Link href={dashboardHref}>
          <Button
            size="sm"
            className="font-semibold gap-1.5 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3.5"
          >
            <DashboardIcon className="h-4 w-4" />
            <span>{dashboardLabel}</span>
          </Button>
        </Link>
        <Button
          size="sm"
          variant="outline"
          onClick={handleLogout}
          className="font-semibold gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 px-3"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Logout</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <Link href="/login">
        <Button size="sm" variant="outline" className="font-semibold px-4">
          Login
        </Button>
      </Link>
      <Link href="/register">
        <Button
          size="sm"
          className="font-semibold shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4"
        >
          Sign Up
        </Button>
      </Link>
    </div>
  );
}
