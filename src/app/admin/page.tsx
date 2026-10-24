"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface AdminScholarship {
  id: string;
  title: string;
  provider: string;
  awardAmount: number | null;
  currency: string;
  deadline: string;
  isActive: boolean;
  isVerified: boolean;
  documents: { id: string; title: string; _count: { chunks: number } }[];
  _count: { applications: number; matches: number };
}

export default function AdminDashboardPage() {
  const [scholarships, setScholarships] = useState<AdminScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  // Ingestion Modal State
  const [selectedScholarshipId, setSelectedScholarshipId] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [docContent, setDocContent] = useState("");
  const [ingesting, setIngesting] = useState(false);

  // New Scholarship State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newProvider, setNewProvider] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAward, setNewAward] = useState("35000");
  const [newDeadline, setNewDeadline] = useState("2026-12-31");
  const [newUrl, setNewUrl] = useState("https://example.com");

  const loadScholarships = async () => {
    try {
      const res = await fetch("/api/admin/scholarships");
      const json = await res.json();
      if (res.status === 401 || res.status === 403) {
        setUnauthorized(true);
        return;
      }
      if (json.success && json.data) {
        setScholarships(json.data.scholarships || []);
        if (json.data.scholarships?.length > 0 && !selectedScholarshipId) {
          setSelectedScholarshipId(json.data.scholarships[0].id);
        }
      }
    } catch {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScholarships();
  }, []);

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

      toast.success("Document ingested and vector chunks generated successfully!");
      setDocTitle("");
      setDocUrl("");
      setDocContent("");
      loadScholarships();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error ingesting document";
      toast.error(message);
    } finally {
      setIngesting(false);
    }
  };

  const handleToggleVerified = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/scholarships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !current }),
      });
      if (res.ok) {
        toast.success(`Scholarship marked as ${!current ? "Verified" : "Unverified"}`);
        loadScholarships();
      }
    } catch {
      toast.error("Failed to toggle verification");
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
        loadScholarships();
      }
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this scholarship?")) return;
    try {
      const res = await fetch(`/api/scholarships/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.info("Scholarship deleted");
        loadScholarships();
      }
    } catch {
      toast.error("Failed to delete scholarship");
    }
  };

  if (unauthorized) {
    return (
      <div className="max-w-md mx-auto my-24 text-center space-y-4 p-8 border rounded-2xl bg-card">
        <Lock className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Administrator Access Required</h2>
        <p className="text-sm text-muted-foreground">
          You are currently logged in with a Student account. Please log in with an Administrator account to access document ingestion and scholarship moderation.
        </p>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Return to Student Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const totalDocuments = scholarships.reduce((acc, s) => acc + s.documents.length, 0);
  const totalChunks = scholarships.reduce(
    (acc, s) => acc + s.documents.reduce((dAcc, d) => dAcc + d._count.chunks, 0),
    0
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Admin &amp; Ingestion Control</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Publish verified opportunities, ingest official PDFs/policies, and manage RAG vector chunks.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Student Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Total Scholarships</CardDescription>
            <CardTitle className="text-2xl font-bold">{scholarships.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Verified Active</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">
              {scholarships.filter((s) => s.isActive && s.isVerified).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Ingested Documents</CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600">{totalDocuments}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Total Vector Chunks</CardDescription>
            <CardTitle className="text-2xl font-bold text-purple-600">{totalChunks}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* RAG Document Ingestion Card */}
      <Card className="border-primary/40 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Ingest Official Document &amp; Generate Embeddings</CardTitle>
          </div>
          <CardDescription>
            Clean text, split into token-aware chunks, calculate 768-dim embeddings, and index into the RAG vector store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleIngestDocument} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scholarshipSelect">Target Scholarship</Label>
                <select
                  id="scholarshipSelect"
                  value={selectedScholarshipId}
                  onChange={(e) => setSelectedScholarshipId(e.target.value)}
                  className="w-full mt-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                >
                  <option value="">Select Scholarship...</option>
                  {scholarships.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.provider})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="docTitle">Document / Policy Title</Label>
                <Input
                  id="docTitle"
                  placeholder="e.g. Official Eligibility Handbook 2026"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="docUrl">Source URL (Optional Reference)</Label>
              <Input
                id="docUrl"
                placeholder="https://provider.org/guidelines.pdf"
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="docContent">Document Text Content</Label>
              <textarea
                id="docContent"
                rows={5}
                placeholder="Paste the official scholarship guidelines, regulations, eligibility criteria, or funding details..."
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                className="w-full mt-1.5 rounded-md border border-input bg-background p-3 text-xs leading-relaxed font-mono shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                required
              />
            </div>

            <Button type="submit" disabled={ingesting} className="gap-2">
              <Database className="h-4 w-4" />
              {ingesting ? "Chunking & Embedding Vectors..." : "Index Document for RAG"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Scholarship Moderation Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Scholarship Opportunities</CardTitle>
              <CardDescription>Manage visibility, verification status, and linked source documents.</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => loadScholarships()}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b text-xs text-muted-foreground uppercase">
                  <th className="py-3 px-2">Scholarship</th>
                  <th className="py-3 px-2">Provider</th>
                  <th className="py-3 px-2">Deadline</th>
                  <th className="py-3 px-2">Docs / Chunks</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {scholarships.map((s) => {
                  const chunkCount = s.documents.reduce((acc, d) => acc + d._count.chunks, 0);

                  return (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2 font-medium">
                        <Link href={`/dashboard/search/${s.id}`} className="hover:underline">
                          {s.title}
                        </Link>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">{s.provider}</td>
                      <td className="py-3 px-2">{new Date(s.deadline).toLocaleDateString()}</td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className="text-[10px]">
                          {s.documents.length} docs ({chunkCount} chunks)
                        </Badge>
                      </td>
                      <td className="py-3 px-2 space-x-1">
                        <Badge variant={s.isVerified ? "default" : "secondary"} className="text-[10px]">
                          {s.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge variant={s.isActive ? "outline" : "destructive"} className="text-[10px]">
                          {s.isActive ? "Active" : "Archived"}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleVerified(s.id, s.isVerified)}
                          className="h-7 px-2 text-[11px]"
                        >
                          {s.isVerified ? "Unverify" : "Verify"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleActive(s.id, s.isActive)}
                          className="h-7 px-2 text-[11px]"
                        >
                          {s.isActive ? "Archive" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(s.id)}
                          className="h-7 px-2 text-[11px] text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
