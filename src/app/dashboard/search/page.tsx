"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  GraduationCap, 
  Globe2, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface ScholarshipItem {
  id: string;
  title: string;
  provider: string;
  description: string;
  awardAmount: number | null;
  currency: string;
  fundingType: string;
  deadline: string;
  educationLevels: string[];
  eligibleCourses: string[];
  locationRestrictions: string[];
  citizenshipRequirements: string[];
  minGpa: number | null;
  minIelts: number | null;
  minToefl: number | null;
  officialUrl: string;
  isVerified: boolean;
  criteria?: { id: string; description: string; isMandatory: boolean }[];
}

export default function ScholarshipSearchPage() {
  const [scholarships, setScholarships] = useState<ScholarshipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [degreeLevel, setDegreeLevel] = useState("");
  const [fundingType, setFundingType] = useState("");
  const [country, setCountry] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchScholarships = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (degreeLevel) params.append("educationLevel", degreeLevel);
      if (fundingType) params.append("fundingType", fundingType);
      if (country) params.append("country", country);
      params.append("page", String(page));
      params.append("limit", "6");

      const res = await fetch(`/api/scholarships?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setScholarships(json.data || []);
        if (json.meta) {
          setTotalPages(json.meta.totalPages || 1);
          setTotalRecords(json.meta.total || 0);
        }
      }
    } catch (e) {
      console.error("Failed to load scholarships", e);
      toast.error("Could not load scholarships");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, degreeLevel, fundingType, country, page]);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  // Load saved scholarships IDs
  useEffect(() => {
    async function fetchSaved() {
      try {
        const res = await fetch("/api/saved-scholarships");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const ids = new Set<string>(json.data.map((item: { scholarshipId: string }) => item.scholarshipId));
          setSavedIds(ids);
        }
      } catch {
        // Not logged in or ignore
      }
    }
    fetchSaved();
  }, []);

  const handleToggleSave = async (id: string) => {
    setSavingId(id);
    const isCurrentlySaved = savedIds.has(id);

    // Optimistic UI update
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      if (isCurrentlySaved) {
        const res = await fetch(`/api/saved-scholarships/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to remove bookmark");
        toast.info("Removed from saved scholarships");
      } else {
        const res = await fetch("/api/saved-scholarships", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scholarshipId: id }),
        });
        if (!res.ok) throw new Error("Failed to save scholarship");
        toast.success("Scholarship bookmarked!");
      }
    } catch {
      // Rollback on failure
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlySaved) next.add(id);
        else next.delete(id);
        return next;
      });
      toast.error("Failed to update saved status. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Discover Scholarships</h1>
        <p className="text-muted-foreground mt-1">
          Explore verified international funding opportunities with explicit eligibility criteria.
        </p>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, provider, keywords..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          <div>
            <select
              value={degreeLevel}
              onChange={(e) => {
                setDegreeLevel(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All Degree Levels</option>
              <option value="BACHELORS">Bachelor's</option>
              <option value="MASTERS">Master's</option>
              <option value="PHD">PhD</option>
              <option value="POSTDOC">Postdoc</option>
            </select>
          </div>

          <div>
            <select
              value={fundingType}
              onChange={(e) => {
                setFundingType(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All Funding Types</option>
              <option value="FULLY_FUNDED">Fully Funded</option>
              <option value="FULL_TUITION">Full Tuition</option>
              <option value="PARTIAL">Partial Support</option>
              <option value="STIPEND_ONLY">Stipend Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing <strong>{scholarships.length}</strong> of <strong>{totalRecords}</strong> opportunities
        </span>
      </div>

      {/* Scholarships Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n} className="h-64 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : scholarships.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No scholarships found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Try relaxing your search terms or filter criteria to discover more opportunities.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setDegreeLevel("");
                setFundingType("");
                setCountry("");
              }}
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {scholarships.map((s) => {
            const isSaved = savedIds.has(s.id);
            const formattedDeadline = new Date(s.deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <Card key={s.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={s.isVerified ? "default" : "secondary"} className="gap-1 text-xs">
                      {s.isVerified && <ShieldCheck className="h-3 w-3" />}
                      {s.isVerified ? "Verified Official" : "Unverified"}
                    </Badge>
                    <button
                      onClick={() => handleToggleSave(s.id)}
                      disabled={savingId === s.id}
                      className="text-muted-foreground hover:text-primary transition-colors p-1"
                      aria-label="Bookmark scholarship"
                    >
                      {isSaved ? (
                        <BookmarkCheck className="h-5 w-5 text-primary fill-primary" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <CardTitle className="text-lg line-clamp-1 mt-2">{s.title}</CardTitle>
                  <CardDescription className="text-xs font-medium text-foreground/80">
                    {s.provider}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-sm">
                  <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
                    {s.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="font-semibold text-foreground">
                        {s.awardAmount ? `${s.currency} ${s.awardAmount.toLocaleString()}` : "Full Tuition + Living"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 text-blue-600" />
                      <span>{formattedDeadline}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                      <GraduationCap className="h-3.5 w-3.5 text-purple-600" />
                      <span>{s.educationLevels.join(", ")}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t flex gap-2">
                  <Link href={`/dashboard/search/${s.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View Criteria
                    </Button>
                  </Link>

                  <a href={s.officialUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="px-2">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm font-medium">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
