"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Clock, 
  Trash2, 
  ExternalLink, 
  FileEdit, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Send,
  Sparkles,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ApplicationItem {
  id: string;
  status:
    | "INTERESTED"
    | "PREPARING_DOCUMENTS"
    | "READY_TO_APPLY"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED";
  deadline: string | null;
  personalNotes: string | null;
  submissionDate: string | null;
  scholarship: {
    id: string;
    title: string;
    provider: string;
    awardAmount: number | null;
    currency: string;
    fundingType: string;
    deadline: string;
    officialUrl: string;
    isVerified: boolean;
  };
}

const STATUS_COLUMNS = [
  { key: "INTERESTED", label: "Interested", color: "bg-blue-500/10 text-blue-700 border-blue-200" },
  { key: "PREPARING_DOCUMENTS", label: "Preparing Docs", color: "bg-amber-500/10 text-amber-700 border-amber-200" },
  { key: "READY_TO_APPLY", label: "Ready to Apply", color: "bg-purple-500/10 text-purple-700 border-purple-200" },
  { key: "SUBMITTED", label: "Submitted", color: "bg-indigo-500/10 text-indigo-700 border-indigo-200" },
  { key: "UNDER_REVIEW", label: "Under Review", color: "bg-cyan-500/10 text-cyan-700 border-cyan-200" },
  { key: "APPROVED", label: "Approved 🎉", color: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  { key: "REJECTED", label: "Rejected", color: "bg-rose-500/10 text-rose-700 border-rose-200" },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      const json = await res.json();
      if (json.success && json.data) {
        setApplications(json.data.applications || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  /**
   * Optimistic status change with automatic rollback
   */
  const handleStatusChange = async (appId: string, newStatus: ApplicationItem["status"]) => {
    const previousApplications = [...applications];

    // Optimistic update
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update status on server");
      }

      toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
    } catch (error) {
      // Rollback on failure
      setApplications(previousApplications);
      const msg = error instanceof Error ? error.message : "Network error";
      toast.error(`Rollback: ${msg}`);
    }
  };

  /**
   * Save personal notes with optimistic feedback
   */
  const handleSaveNotes = async (appId: string) => {
    const previousApplications = [...applications];

    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, personalNotes: noteText } : app))
    );
    setEditingNotesId(null);

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalNotes: noteText }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to save note");
      }

      toast.success("Personal note saved");
    } catch {
      setApplications(previousApplications);
      toast.error("Failed to save note. Changes reverted.");
    }
  };

  /**
   * Delete application record
   */
  const handleDelete = async (appId: string) => {
    if (!confirm("Are you sure you want to remove this scholarship from your tracker?")) {
      return;
    }

    const previousApplications = [...applications];
    setApplications((prev) => prev.filter((app) => app.id !== appId));

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete");
      }

      toast.info("Scholarship removed from application tracker");
    } catch {
      setApplications(previousApplications);
      toast.error("Failed to remove scholarship. Changes reverted.");
    }
  };

  // Metric summaries
  const total = applications.length;
  const inProgress = applications.filter((a) =>
    ["INTERESTED", "PREPARING_DOCUMENTS", "READY_TO_APPLY"].includes(a.status)
  ).length;
  const submitted = applications.filter((a) =>
    ["SUBMITTED", "UNDER_REVIEW"].includes(a.status)
  ).length;
  const approved = applications.filter((a) => a.status === "APPROVED").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title & Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Application Tracker</h1>
          <p className="text-muted-foreground mt-1">
            Organize documents, track milestone statuses, and maintain personal notes with optimistic updates.
          </p>
        </div>

        <Link href="/dashboard/search">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Scholarship to Tracker
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Total Tracked</CardDescription>
            <CardTitle className="text-2xl font-bold">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">In Progress</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600">{inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Submitted &amp; In Review</CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600">{submitted}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Approved Awards</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">{approved}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Applications List & Status Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="h-32 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No applications tracked yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Browse our scholarship discovery directory and add opportunities you want to prepare documents for.
            </p>
            <Link href="/dashboard/search">
              <Button>Find Scholarships</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const daysLeft = app.deadline
              ? Math.ceil(
                  (new Date(app.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                )
              : null;

            const isEditingNote = editingNotesId === app.id;

            return (
              <Card key={app.id} className="hover:border-primary/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {app.scholarship.fundingType.replace("_", " ")}
                        </Badge>
                        {daysLeft !== null && (
                          <Badge
                            variant={daysLeft <= 7 ? "destructive" : "secondary"}
                            className="text-xs gap-1"
                          >
                            <Clock className="h-3 w-3" />
                            {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
                          </Badge>
                        )}
                      </div>

                      <CardTitle className="text-lg">
                        <Link
                          href={`/dashboard/search/${app.scholarship.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {app.scholarship.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-xs font-medium">
                        {app.scholarship.provider}
                      </CardDescription>
                    </div>

                    {/* Status Dropdown Selector with Optimistic Trigger */}
                    <div className="flex items-center gap-2">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleStatusChange(app.id, e.target.value as ApplicationItem["status"])
                        }
                        className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {STATUS_COLUMNS.map((col) => (
                          <option key={col.key} value={col.key}>
                            {col.label}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-muted-foreground hover:text-destructive p-1.5 transition-colors"
                        title="Remove from tracker"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-xs border-t pt-3">
                  {/* Personal Notes Section */}
                  <div>
                    {isEditingNote ? (
                      <div className="space-y-2">
                        <Input
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add milestone notes, draft links, or contact info..."
                          className="text-xs"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSaveNotes(app.id)} className="h-7 text-xs">
                            Save Note
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingNotesId(null)}
                            className="h-7 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setEditingNotesId(app.id);
                          setNoteText(app.personalNotes || "");
                        }}
                        className="cursor-pointer group flex items-start gap-1.5 p-2 rounded bg-muted/30 hover:bg-muted/60 transition-colors"
                      >
                        <FileEdit className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground group-hover:text-foreground">
                          {app.personalNotes
                            ? app.personalNotes
                            : "Click here to add personal notes, SOP status, or reviewer reminders..."}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>
                      Deadline:{" "}
                      {app.deadline
                        ? new Date(app.deadline).toLocaleDateString()
                        : "No deadline specified"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={app.scholarship.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Official Portal <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
