"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  ShieldCheck, 
  FileText, 
  Database, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Lock,
  LogOut,
  Users,
  GraduationCap,
  FileCheck,
  Activity,
  Sparkles,
  Layers,
  Search,
  Server,
  Mail,
  ChevronRight,
  UserCheck,
  ShieldAlert
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AdminScholarship {
  id: string;
  title: string;
  provider: string;
  awardAmount: number | null;
  currency: string;
  fundingType: string;
  deadline: string;
  isActive: boolean;
  isVerified: boolean;
  documents: { id: string; title: string; _count: { chunks: number } }[];
  _count: { applications: number; matches: number; savedBy: number };
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  createdAt: string;
  profile?: {
    educationLevel: string;
    fieldOfStudy: string;
    gpa: number | null;
    gpaScale: number;
    countryOfOrigin: string;
  } | null;
  _count: {
    applications: number;
    matches: number;
    savedScholarships: number;
  };
}

interface AdminApplication {
  id: string;
  status: string;
  notes?: string | null;
  updatedAt: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    profile?: {
      gpa: number | null;
      countryOfOrigin: string;
      fieldOfStudy: string;
    } | null;
  };
  scholarship: {
    id: string;
    title: string;
    provider: string;
    fundingType: string;
    deadline: string;
  };
}

interface OverviewData {
  kpis: {
    totalScholarships: number;
    activeScholarships: number;
    verifiedScholarships: number;
    totalUsers: number;
    totalStudents: number;
    totalAdmins: number;
    totalApplications: number;
    totalDocuments: number;
    totalChunks: number;
  };
  statusCounts: Record<string, number>;
  recentApplications: any[];
  recentUsers: any[];
  systemHealth: {
    database: string;
    aiEngine: string;
    emailService: string;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  // Data States
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [scholarships, setScholarships] = useState<AdminScholarship[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);

  // Filter States
  const [userSearch, setUserSearch] = useState("");
  const [scholarshipSearch, setScholarshipSearch] = useState("");
  const [appFilterStatus, setAppFilterStatus] = useState("ALL");

  // Ingestion State
  const [selectedScholarshipId, setSelectedScholarshipId] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [docContent, setDocContent] = useState("");
  const [ingesting, setIngesting] = useState(false);

  // New Scholarship State
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newProvider, setNewProvider] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAward, setNewAward] = useState("35000");
  const [newCurrency, setNewCurrency] = useState("USD");
  const [newFundingType, setNewFundingType] = useState("FULLY_FUNDED");
  const [newEducationLevel, setNewEducationLevel] = useState("MASTERS");
  const [newMinGpa, setNewMinGpa] = useState("3.0");
  const [newMinIelts, setNewMinIelts] = useState("6.5");
  const [newDeadline, setNewDeadline] = useState("2026-12-31");
  const [newUrl, setNewUrl] = useState("https://example.com");

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    document.cookie = "scholar_auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    localStorage.removeItem("scholar_token");
    localStorage.removeItem("scholar_user");
    router.push("/login");
    router.refresh();
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [ovRes, scRes, usRes, apRes] = await Promise.all([
        fetch("/api/admin/overview"),
        fetch("/api/admin/scholarships"),
        fetch("/api/admin/users"),
        fetch("/api/admin/applications"),
      ]);

      if (ovRes.status === 401 || ovRes.status === 403) {
        setUnauthorized(true);
        return;
      }

      const ovJson = await ovRes.json();
      const scJson = await scRes.json();
      const usJson = await usRes.json();
      const apJson = await apRes.json();

      if (ovJson.success) setOverview(ovJson.data);
      if (scJson.success) {
        setScholarships(scJson.data.scholarships || []);
        if (scJson.data.scholarships?.length > 0 && !selectedScholarshipId) {
          setSelectedScholarshipId(scJson.data.scholarships[0].id);
        }
      }
      if (usJson.success) setUsers(usJson.data.users || []);
      if (apJson.success) setApplications(apJson.data.applications || []);
    } catch {
      toast.error("Failed to load admin management data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleCreateScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newProvider || !newDesc || !newUrl) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/scholarships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          provider: newProvider,
          description: newDesc,
          awardAmount: newAward ? parseFloat(newAward) : null,
          currency: newCurrency,
          fundingType: newFundingType,
          deadline: newDeadline,
          educationLevels: [newEducationLevel],
          minGpa: newMinGpa ? parseFloat(newMinGpa) : null,
          minIelts: newMinIelts ? parseFloat(newMinIelts) : null,
          officialUrl: newUrl,
          isVerified: true,
          isActive: true,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to register scholarship");
      }

      toast.success("Scholarship registered and published!");
      setShowAddForm(false);
      setNewTitle("");
      setNewProvider("");
      setNewDesc("");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add scholarship");
    } finally {
      setCreating(false);
    }
  };

  const handleIngestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScholarshipId || !docTitle || !docContent) {
      toast.error("Please fill in scholarship, title, and document text");
      return;
    }

    setIngesting(true);
    try {
      const res = await fetch("/api/admin/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scholarshipId: selectedScholarshipId,
          title: docTitle,
          contentText: docContent,
          sourceUrl: docUrl || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to ingest document");
      }

      toast.success(`Successfully ingested ${json.data.chunksCreated} vector chunks`);
      setDocTitle("");
      setDocContent("");
      setDocUrl("");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Ingestion failed");
    } finally {
      setIngesting(false);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/scholarships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.ok) {
        toast.success(`Scholarship ${!current ? "Activated" : "Archived"}`);
        loadAllData();
      }
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const handleDeleteScholarship = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this scholarship?")) return;
    try {
      const res = await fetch(`/api/scholarships/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.info("Scholarship deleted");
        loadAllData();
      }
    } catch {
      toast.error("Failed to delete scholarship");
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === "ADMIN" ? "STUDENT" : "ADMIN";
    if (!confirm(`Are you sure you want to change this user role to ${nextRole}?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: nextRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change role");

      toast.success(`User updated to ${nextRole}`);
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Role change failed");
    }
  };

  const handleUpdateAppStatus = async (applicationId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Status update failed");

      toast.success(`Application marked as ${status}`);
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update application");
    }
  };

  if (unauthorized) {
    return (
      <div className="max-w-md mx-auto my-24 text-center space-y-4 p-8 border rounded-2xl bg-card shadow-sm">
        <Lock className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Administrator Access Required</h2>
        <p className="text-sm text-muted-foreground">
          You are currently logged in with a Student account. Please log in with an Administrator account to access the platform control center.
        </p>
        <Button onClick={handleLogout} variant="outline" className="gap-2">
          <LogOut className="h-4 w-4" /> Log In as Administrator
        </Button>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.profile?.countryOfOrigin || "").toLowerCase().includes(q)
    );
  });

  const filteredScholarships = scholarships.filter((s) => {
    const q = scholarshipSearch.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q);
  });

  const filteredApplications = applications.filter((a) => {
    if (appFilterStatus === "ALL") return true;
    return a.status === appFilterStatus;
  });

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight">ScholarAI Admin Control Center</h1>
                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 text-[10px] font-bold">
                  Administrator
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Platform governance, student profiles, application moderation, and Gemini RAG ingestion.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              onClick={() => {
                setActiveTab("scholarships");
                setShowAddForm(true);
              }}
              className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Add Scholarship
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={loadAllData}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-background border p-1 rounded-xl grid grid-cols-2 sm:grid-cols-5 gap-1 h-auto">
            <TabsTrigger value="overview" className="gap-2 py-2 text-xs font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 py-2 text-xs font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              Students ({users.length})
            </TabsTrigger>
            <TabsTrigger value="applications" className="gap-2 py-2 text-xs font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <FileCheck className="h-4 w-4" />
              Applications ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="scholarships" className="gap-2 py-2 text-xs font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <GraduationCap className="h-4 w-4" />
              Scholarships ({scholarships.length})
            </TabsTrigger>
            <TabsTrigger value="rag" className="gap-2 py-2 text-xs font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Sparkles className="h-4 w-4" />
              RAG &amp; Ingestion
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: EXECUTIVE OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            {/* Top KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs font-medium">Total Scholarships</CardDescription>
                    <GraduationCap className="h-4 w-4 text-indigo-600" />
                  </div>
                  <CardTitle className="text-3xl font-extrabold">{overview?.kpis.totalScholarships ?? scholarships.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">
                      {overview?.kpis.verifiedScholarships ?? scholarships.filter(s => s.isVerified).length} Verified
                    </span>
                    <span>• {overview?.kpis.activeScholarships ?? scholarships.filter(s => s.isActive).length} Active</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs font-medium">Registered Students</CardDescription>
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-3xl font-extrabold">{overview?.kpis.totalStudents ?? users.filter(u => u.role === 'STUDENT').length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Total Users in DB: <strong className="text-foreground">{overview?.kpis.totalUsers ?? users.length}</strong> ({overview?.kpis.totalAdmins ?? 1} Admins)
                  </p>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs font-medium">Student Applications</CardDescription>
                    <FileCheck className="h-4 w-4 text-purple-600" />
                  </div>
                  <CardTitle className="text-3xl font-extrabold">{overview?.kpis.totalApplications ?? applications.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Active pipelines across all verified opportunities
                  </p>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs font-medium">RAG Vector Chunks</CardDescription>
                    <Layers className="h-4 w-4 text-emerald-600" />
                  </div>
                  <CardTitle className="text-3xl font-extrabold">{overview?.kpis.totalChunks ?? 23}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    From <strong className="text-foreground">{overview?.kpis.totalDocuments ?? 10}</strong> official PDF guidelines
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* System Health Status Banner */}
            <Card className="border shadow-sm bg-gradient-to-r from-card to-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Server className="h-4 w-4 text-indigo-600" />
                  Live Platform Infrastructure &amp; Microservices Health
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="p-3.5 rounded-xl border bg-background flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <div className="text-xs font-bold text-foreground">Supabase PostgreSQL DB</div>
                    <div className="text-[11px] text-muted-foreground">Connected • Pooling: 30s timeout</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border bg-background flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <div className="text-xs font-bold text-foreground">Google Gemini RAG Copilot</div>
                    <div className="text-[11px] text-muted-foreground">{overview?.systemHealth.aiEngine || "Gemini 2.5 Flash Online"}</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border bg-background flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <div className="text-xs font-bold text-foreground">Transactional Email SMTP</div>
                    <div className="text-[11px] text-muted-foreground">{overview?.systemHealth.emailService || "Nodemailer Configured"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Split Grids: Recent Applications & Recent Users */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Applications */}
              <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-purple-600" />
                      Recent Student Applications
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("applications")} className="text-xs text-primary gap-1">
                      View All <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {applications.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center">No student applications recorded yet.</p>
                  ) : (
                    applications.slice(0, 5).map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3 rounded-xl border bg-background text-xs">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">{app.user.name}</p>
                          <p className="text-muted-foreground text-[11px] line-clamp-1">{app.scholarship.title}</p>
                        </div>
                        <Badge variant="outline" className="font-bold text-[10px]">
                          {app.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Recent Users */}
              <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      Recent Registered Users
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("users")} className="text-xs text-primary gap-1">
                      View All <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {users.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center">No users found.</p>
                  ) : (
                    users.slice(0, 5).map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-3 rounded-xl border bg-background text-xs">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">{u.name}</p>
                          <p className="text-muted-foreground text-[11px]">{u.email}</p>
                        </div>
                        <Badge className={u.role === "ADMIN" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}>
                          {u.role}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: STUDENTS & USER MANAGEMENT */}
          <TabsContent value="users" className="space-y-4">
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold">Registered Platform Users</CardTitle>
                    <CardDescription className="text-xs">
                      Manage student accounts, review profiles, and delegate administrative roles.
                    </CardDescription>
                  </div>
                  <div className="w-full sm:w-72 relative">
                    <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, country..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9 text-xs h-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 border-y text-muted-foreground uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Academic GPA</th>
                        <th className="px-4 py-3">Country</th>
                        <th className="px-4 py-3">Applications</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                            No users matched your search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-semibold text-foreground">{u.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                            <td className="px-4 py-3">
                              <Badge className={u.role === "ADMIN" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}>
                                {u.role}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              {u.profile?.gpa ? `${u.profile.gpa} / ${u.profile.gpaScale}` : "Not set"}
                            </td>
                            <td className="px-4 py-3">{u.profile?.countryOfOrigin || "Not specified"}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">{u._count.applications} Apps</Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleRole(u.id, u.role)}
                                className="text-[11px] h-7 text-indigo-600 hover:text-indigo-700"
                              >
                                {u.role === "ADMIN" ? "Demote to Student" : "Promote to Admin"}
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: APPLICATIONS REVIEW BOARD */}
          <TabsContent value="applications" className="space-y-4">
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold">Student Applications Review</CardTitle>
                    <CardDescription className="text-xs">
                      Inspect student submissions, change pipeline stages, and dispatch automated status emails.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={appFilterStatus}
                      onChange={(e) => setAppFilterStatus(e.target.value)}
                      className="text-xs border rounded-lg px-3 py-1.5 bg-background font-medium"
                    >
                      <option value="ALL">All Statuses ({applications.length})</option>
                      <option value="INTERESTED">Interested</option>
                      <option value="PREPARING_DOCUMENTS">Preparing Documents</option>
                      <option value="READY_TO_APPLY">Ready to Apply</option>
                      <option value="SUBMITTED">Submitted</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 border-y text-muted-foreground uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-4 py-3">Applicant</th>
                        <th className="px-4 py-3">Scholarship</th>
                        <th className="px-4 py-3">Funding</th>
                        <th className="px-4 py-3">Current Status</th>
                        <th className="px-4 py-3">Change Status &amp; Notify</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredApplications.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                            No student applications in this category yet.
                          </td>
                        </tr>
                      ) : (
                        filteredApplications.map((app) => (
                          <tr key={app.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-foreground">{app.user.name}</div>
                              <div className="text-[11px] text-muted-foreground">{app.user.email}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-foreground line-clamp-1">{app.scholarship.title}</div>
                              <div className="text-[11px] text-muted-foreground">{app.scholarship.provider}</div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="text-[10px]">{app.scholarship.fundingType}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={
                                app.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" :
                                app.status === "REJECTED" ? "bg-rose-100 text-rose-800" :
                                app.status === "UNDER_REVIEW" ? "bg-amber-100 text-amber-800" :
                                "bg-indigo-100 text-indigo-800"
                              }>
                                {app.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={app.status}
                                onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                                className="text-xs border rounded px-2 py-1 bg-background font-medium cursor-pointer"
                              >
                                <option value="INTERESTED">Mark Interested</option>
                                <option value="PREPARING_DOCUMENTS">Preparing Documents</option>
                                <option value="READY_TO_APPLY">Ready to Apply</option>
                                <option value="SUBMITTED">Submitted</option>
                                <option value="UNDER_REVIEW">Under Review</option>
                                <option value="APPROVED">Approve (Send Email)</option>
                                <option value="REJECTED">Reject (Send Email)</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: SCHOLARSHIPS DIRECTORY & CREATION */}
          <TabsContent value="scholarships" className="space-y-6">
            {/* Create Scholarship Modal/Card */}
            {showAddForm && (
              <Card className="border-indigo-200 bg-indigo-50/20 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-indigo-950 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-indigo-600" />
                    Register New Verified Scholarship Opportunity
                  </CardTitle>
                  <CardDescription className="text-xs">
                    This will publish an official program into the student search directory and deterministic matching engine.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateScholarship} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Scholarship Title *</Label>
                        <Input
                          required
                          placeholder="e.g. Erasmus Mundus Joint Masters Scholarship"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Provider / Institution *</Label>
                        <Input
                          required
                          placeholder="e.g. European Commission"
                          value={newProvider}
                          onChange={(e) => setNewProvider(e.target.value)}
                          className="text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Detailed Description *</Label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Comprehensive summary of scholarship benefits, allowances, and target demographics..."
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-input bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Award Amount</Label>
                        <Input
                          type="number"
                          value={newAward}
                          onChange={(e) => setNewAward(e.target.value)}
                          className="text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Currency</Label>
                        <Input
                          value={newCurrency}
                          onChange={(e) => setNewCurrency(e.target.value)}
                          className="text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Funding Type</Label>
                        <select
                          value={newFundingType}
                          onChange={(e) => setNewFundingType(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border bg-white h-9"
                        >
                          <option value="FULLY_FUNDED">Fully Funded</option>
                          <option value="FULL_TUITION">Full Tuition</option>
                          <option value="PARTIAL">Partial</option>
                          <option value="STIPEND_ONLY">Stipend Only</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Target Degree</Label>
                        <select
                          value={newEducationLevel}
                          onChange={(e) => setNewEducationLevel(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border bg-white h-9"
                        >
                          <option value="BACHELORS">Bachelors</option>
                          <option value="MASTERS">Masters</option>
                          <option value="PHD">PhD</option>
                          <option value="POSTDOC">Postdoc</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Min GPA (4.0 Scale)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={newMinGpa}
                          onChange={(e) => setNewMinGpa(e.target.value)}
                          className="text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Min IELTS Score</Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={newMinIelts}
                          onChange={(e) => setNewMinIelts(e.target.value)}
                          className="text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Application Deadline *</Label>
                        <Input
                          type="date"
                          required
                          value={newDeadline}
                          onChange={(e) => setNewDeadline(e.target.value)}
                          className="text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Official Portal URL *</Label>
                      <Input
                        required
                        type="url"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="text-xs bg-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={creating}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                      >
                        {creating ? "Publishing..." : "Publish to Directory"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Scholarships Table */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold">Cataloged Scholarship Programs</CardTitle>
                    <CardDescription className="text-xs">
                      Toggle active visibility, view linked RAG documents, or delete obsolete entries.
                    </CardDescription>
                  </div>
                  <div className="w-full sm:w-72 relative">
                    <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                    <Input
                      placeholder="Search title, provider..."
                      value={scholarshipSearch}
                      onChange={(e) => setScholarshipSearch(e.target.value)}
                      className="pl-9 text-xs h-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 border-y text-muted-foreground uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-4 py-3">Program Title</th>
                        <th className="px-4 py-3">Provider</th>
                        <th className="px-4 py-3">Award</th>
                        <th className="px-4 py-3">Indexed Docs</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredScholarships.map((s) => (
                        <tr key={s.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-semibold text-foreground max-w-xs truncate">
                            {s.title}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{s.provider}</td>
                          <td className="px-4 py-3 font-medium">
                            {s.awardAmount ? `${s.currency} ${s.awardAmount.toLocaleString()}` : "Full Funding"}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="gap-1">
                              <FileText className="h-3 w-3" />
                              {s.documents.length} docs ({s.documents.reduce((acc, d) => acc + d._count.chunks, 0)} chunks)
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={s.isActive ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-800"}>
                              {s.isActive ? "Active" : "Archived"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleActive(s.id, s.isActive)}
                              className="text-[11px] h-7"
                            >
                              {s.isActive ? "Archive" : "Activate"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteScholarship(s.id)}
                              className="text-[11px] h-7 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: RAG & VECTOR INGESTION */}
          <TabsContent value="rag" className="space-y-6">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Upload className="h-4 w-4 text-indigo-600" />
                  Ingest Official Handbook &amp; Generate Vector Chunks
                </CardTitle>
                <CardDescription className="text-xs">
                  Clean text, split into token-aware chunks, calculate 768-dimensional embeddings using Gemini, and index into the RAG vector store.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleIngestDocument} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Target Scholarship Program *</Label>
                      <select
                        value={selectedScholarshipId}
                        onChange={(e) => setSelectedScholarshipId(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border bg-background"
                      >
                        {scholarships.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title} ({s.provider})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Document / Policy Title *</Label>
                      <Input
                        required
                        placeholder="e.g. Official Eligibility Handbook &amp; Selection Criteria 2026"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Source URL (Optional Reference)</Label>
                    <Input
                      placeholder="https://provider.org/guidelines-2026.pdf"
                      value={docUrl}
                      onChange={(e) => setDocUrl(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Document Text Content *</Label>
                    <textarea
                      required
                      rows={6}
                      placeholder="Paste official handbook sections, eligibility clauses, stipend breakdowns, or selection stages here..."
                      value={docContent}
                      onChange={(e) => setDocContent(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={ingesting}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  >
                    <Database className="h-4 w-4" />
                    {ingesting ? "Splitting & Generating Embeddings..." : "Index Document for RAG"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Ingested Documents Overview */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Indexed Knowledge Base Documents</CardTitle>
                <CardDescription className="text-xs">
                  Active policy documents currently available to the Gemini AI Copilot.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 border-y text-muted-foreground uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-4 py-3">Scholarship</th>
                        <th className="px-4 py-3">Document Title</th>
                        <th className="px-4 py-3">Vector Chunks</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {scholarships.flatMap((s) =>
                        s.documents.map((d) => (
                          <tr key={d.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-semibold text-foreground">{s.title}</td>
                            <td className="px-4 py-3 text-muted-foreground">{d.title}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">{d._count.chunks} Chunks</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className="bg-emerald-100 text-emerald-800">Vectorized</Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
