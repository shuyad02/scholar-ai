"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface MatchRecord {
  id: string;
  eligibilityScore: number;
  status: string;
  matchedCriteria: any[];
  unmetCriteria: any[];
  missingInfo: any[];
  explanation: string;
  nextSteps: string[];
  calculatedAt: string;
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

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await fetch("/api/matches");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setMatches(json.data);
        }
      } catch (e) {
        console.error("Failed to load matches", e);
        toast.error("Could not load match results");
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  const filteredMatches = matches.filter((m) => {
    if (selectedFilter === "ALL") return true;
    return m.status === selectedFilter;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Eligibility Matches</h1>
          <p className="text-muted-foreground mt-1">
            Deterministic rule evaluations and Gemini AI explanations tailored to your verified profile.
          </p>
        </div>

        <Link href="/dashboard/search">
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Evaluate New Scholarships
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-3">
        {["ALL", "HIGH_MATCH", "MODERATE_MATCH", "INCOMPLETE_DATA", "INELIGIBLE"].map((tab) => (
          <Button
            key={tab}
            variant={selectedFilter === tab ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedFilter(tab)}
            className="text-xs"
          >
            {tab.replace("_", " ")}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="h-44 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : filteredMatches.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No matches calculated yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Visit the scholarship discovery page and click &ldquo;Run AI Eligibility Evaluation&rdquo; on any scholarship to calculate your personalized match score.
            </p>
            <Link href="/dashboard/search">
              <Button>Find Scholarships to Evaluate</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredMatches.map((m) => {
            const badgeColor =
              m.eligibilityScore >= 80
                ? "bg-emerald-600"
                : m.eligibilityScore >= 50
                ? "bg-amber-600"
                : "bg-rose-600";

            return (
              <Card key={m.id} className="overflow-hidden border hover:border-primary/50 transition-colors">
                <CardHeader className="bg-muted/10 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${badgeColor} text-white text-xs`}>
                          {m.eligibilityScore}% Match
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {m.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{m.scholarship.title}</CardTitle>
                      <CardDescription className="text-sm font-medium text-foreground/80 mt-0.5">
                        {m.scholarship.provider}
                      </CardDescription>
                    </div>

                    <div className="text-left sm:text-right text-xs text-muted-foreground">
                      <span>Evaluated on {new Date(m.calculatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                  {/* AI Explanation */}
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      Advisor Explanation
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {m.explanation}
                    </p>
                  </div>

                  {/* Summary grid */}
                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    {/* Satisfied criteria */}
                    <div>
                      <h4 className="font-semibold text-emerald-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Satisfied Requirements ({m.matchedCriteria.length})
                      </h4>
                      <ul className="space-y-1">
                        {m.matchedCriteria.slice(0, 3).map((c: any, i: number) => (
                          <li key={i} className="text-muted-foreground line-clamp-1">
                            • {c.description}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Next Steps */}
                    <div>
                      <h4 className="font-semibold text-primary uppercase tracking-wider mb-1.5">
                        Recommended Next Steps
                      </h4>
                      <ul className="space-y-1">
                        {m.nextSteps.map((step: string, i: number) => (
                          <li key={i} className="text-muted-foreground line-clamp-1">
                            • {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t bg-muted/5 flex justify-between items-center">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                      {m.scholarship.awardAmount
                        ? `${m.scholarship.currency} ${m.scholarship.awardAmount.toLocaleString()}`
                        : "Fully Funded"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-blue-600" />
                      {new Date(m.scholarship.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <Link href={`/dashboard/search/${m.scholarship.id}`}>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                      View Full Breakdown <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
