"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  Globe2, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  Bookmark, 
  ArrowLeft,
  ShieldCheck,
  Send
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Criterion {
  id: string;
  criterionType: string;
  operator: string;
  targetValue: string;
  isMandatory: boolean;
  weight: number;
  description: string;
}

interface ScholarshipDetail {
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
  criteria: Criterion[];
}

export default function ScholarshipDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [scholarship, setScholarship] = useState<ScholarshipDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<any | null>(null);
  const [savingApp, setSavingApp] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/scholarships/${id}`);
        const json = await res.json();
        if (json.success) {
          setScholarship(json.data);
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load scholarship details");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleEvaluateEligibility = async () => {
    setMatching(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scholarshipId: id, forceRefresh: true }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Eligibility evaluation failed");
      }
      setMatchResult(json.data);
      toast.success("Eligibility evaluated against your profile!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error evaluating eligibility";
      toast.error(message);
    } finally {
      setMatching(false);
    }
  };

  const handleAddToTracker = async () => {
    setSavingApp(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scholarshipId: id,
          status: "INTERESTED",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to add to tracker");
      }
      toast.success("Scholarship added to your Application Tracker!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error tracking application";
      toast.error(message);
    } finally {
      setSavingApp(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading scholarship criteria...</div>;
  }

  if (!scholarship) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-bold">Scholarship Not Found</h2>
        <Link href="/dashboard/search">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Search
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard/search">
        <Button variant="ghost" size="sm" className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Search
        </Button>
      </Link>

      {/* Main Header Card */}
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant={scholarship.isVerified ? "default" : "secondary"} className="gap-1">
              {scholarship.isVerified && <ShieldCheck className="h-3.5 w-3.5" />}
              {scholarship.isVerified ? "Verified Official Scholarship" : "Unverified"}
            </Badge>
            <Badge variant="outline">{scholarship.fundingType.replace("_", " ")}</Badge>
          </div>

          <CardTitle className="text-2xl font-bold">{scholarship.title}</CardTitle>
          <CardDescription className="text-base text-foreground/80 font-medium">
            Offered by {scholarship.provider}
          </CardDescription>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Award Value</span>
              <span className="font-semibold text-emerald-600">
                {scholarship.awardAmount
                  ? `${scholarship.currency} ${scholarship.awardAmount.toLocaleString()}`
                  : "Full Tuition & Stipend"}
              </span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground block">Deadline</span>
              <span className="font-semibold text-blue-600">
                {new Date(scholarship.deadline).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground block">Target Degrees</span>
              <span className="font-semibold">{scholarship.educationLevels.join(", ")}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-base mb-2">Program Overview</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {scholarship.description}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button
              onClick={handleEvaluateEligibility}
              disabled={matching}
              className="gap-2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground"
            >
              <Sparkles className="h-4 w-4" />
              {matching ? "Analyzing Eligibility..." : "Run AI Eligibility Evaluation"}
            </Button>

            <Button onClick={handleAddToTracker} disabled={savingApp} variant="outline" className="gap-2">
              <Send className="h-4 w-4" />
              Add to Application Tracker
            </Button>

            <a href={scholarship.officialUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="gap-2">
                Official Portal <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* AI Eligibility Result (if triggered) */}
      {matchResult && (
        <Card className="border-primary/50 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Eligibility Analysis Result</CardTitle>
              </div>
              <Badge
                className={
                  matchResult.eligibilityScore >= 80
                    ? "bg-emerald-600"
                    : matchResult.eligibilityScore >= 50
                    ? "bg-amber-600"
                    : "bg-rose-600"
                }
              >
                {matchResult.eligibilityScore}% Match ({matchResult.status.replace("_", " ")})
              </Badge>
            </div>
            <CardDescription>{matchResult.explanation}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Matched */}
            {matchResult.matchedCriteria?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                  Satisfied Criteria
                </h4>
                <div className="space-y-2">
                  {matchResult.matchedCriteria.map((c: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-md">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-foreground">{c.description}</span>
                        <p className="text-muted-foreground mt-0.5">{c.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unmet */}
            {matchResult.unmetCriteria?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-rose-700 uppercase tracking-wide mb-2">
                  Unmet Requirements
                </h4>
                <div className="space-y-2">
                  {matchResult.unmetCriteria.map((c: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-md">
                      <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-foreground">{c.description}</span>
                        <p className="text-muted-foreground mt-0.5">{c.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Info */}
            {matchResult.missingInfo?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                  Missing Profile Information
                </h4>
                <div className="space-y-2">
                  {matchResult.missingInfo.map((m: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-md">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-foreground">{m.field}</span>: {m.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Explicit Criteria Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Explicit Eligibility Rules</CardTitle>
          <CardDescription>
            These conditions are verified deterministically by the rules engine before AI explanation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {scholarship.criteria && scholarship.criteria.length > 0 ? (
            scholarship.criteria.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-muted/20 text-sm">
                <div>
                  <span className="font-medium block">{c.description}</span>
                  <span className="text-xs text-muted-foreground">
                    Condition: {c.criterionType} {c.operator} {c.targetValue}
                  </span>
                </div>
                <Badge variant={c.isMandatory ? "destructive" : "outline"} className="text-xs shrink-0">
                  {c.isMandatory ? "Mandatory" : "Preferred"}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">General eligibility rules apply.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
