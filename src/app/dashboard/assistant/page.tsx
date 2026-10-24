"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  BookOpen, 
  ShieldCheck, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  HelpCircle,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  sources?: {
    documentTitle: string;
    chunkContent: string;
    similarityScore: number;
  }[];
  scholarshipsReferenced?: {
    id: string;
    title: string;
    provider: string;
    url?: string;
  }[];
  confidence?: string;
  timestamp: Date;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello! I am your **ScholarAI Assistant**, grounded strictly in verified scholarship documents, eligibility rules, and official program guidelines.\n\nAsk me anything about scholarship requirements, eligible courses, work experience policies, or award coverage.",
      timestamp: new Date(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [scholarshipScope, setScholarshipScope] = useState("");
  const [scholarshipsList, setScholarshipsList] = useState<{ id: string; title: string }[]>([]);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load scholarships for the dropdown scope
  useEffect(() => {
    async function fetchList() {
      try {
        const res = await fetch("/api/scholarships?limit=20");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setScholarshipsList(json.data.map((s: { id: string; title: string }) => ({ id: s.id, title: s.title })));
        }
      } catch {
        // Fallback
      }
    }
    fetchList();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (queryToSend?: string) => {
    const query = queryToSend || inputQuery;
    if (!query.trim() || loading) return;

    const userMessage: Message = {
      id: "msg-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          scholarshipId: scholarshipScope || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to process question");
      }

      const botMessage: Message = {
        id: "bot-" + Date.now(),
        sender: "assistant",
        text: json.data.answer,
        sources: json.data.sources,
        scholarshipsReferenced: json.data.scholarshipsReferenced,
        confidence: json.data.confidence,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error contacting assistant";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSource = (msgId: string) => {
    setExpandedSources((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">ScholarAI RAG Assistant</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Answers are grounded in indexed official documentation chunks with source citations.
          </p>
        </div>

        {/* Scope Selector */}
        <div className="w-full sm:w-64">
          <select
            value={scholarshipScope}
            onChange={(e) => setScholarshipScope(e.target.value)}
            className="w-full text-xs rounded-md border border-input bg-background px-2.5 py-1.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Search All Scholarships</option>
            {scholarshipsList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Messages Window */}
      <Card className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === "user";
          const showSources = expandedSources[m.id];

          return (
            <div
              key={m.id}
              className={`flex gap-3 text-sm ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 space-y-2.5 ${
                  isUser
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted/50 border rounded-tl-none text-foreground"
                }`}
              >
                {/* Confidence Pill for Assistant Messages */}
                {!isUser && m.confidence && (
                  <div className="flex items-center gap-2 pb-1 border-b text-xs">
                    <Badge
                      variant={
                        m.confidence === "CONFIRMED"
                          ? "default"
                          : m.confidence === "INSUFFICIENT_EVIDENCE"
                          ? "destructive"
                          : "outline"
                      }
                      className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0"
                    >
                      {m.confidence === "CONFIRMED" ? (
                        <ShieldCheck className="h-3 w-3 mr-1 inline" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 mr-1 inline" />
                      )}
                      {m.confidence.replace("_", " ")}
                    </Badge>
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-wrap leading-relaxed text-sm">
                  {m.text}
                </div>

                {/* Referenced Scholarships */}
                {!isUser && m.scholarshipsReferenced && m.scholarshipsReferenced.length > 0 && (
                  <div className="pt-2 border-t text-xs space-y-1">
                    <span className="font-semibold text-muted-foreground block text-[11px] uppercase tracking-wider">
                      Referenced Scholarships:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {m.scholarshipsReferenced.map((s) => (
                        <a
                          key={s.id}
                          href={s.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline bg-background/80 px-2 py-0.5 rounded border"
                        >
                          {s.title}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evidence Drawer Toggle */}
                {!isUser && m.sources && m.sources.length > 0 && (
                  <div className="pt-1">
                    <button
                      onClick={() => toggleSource(m.id)}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors"
                    >
                      <BookOpen className="h-3 w-3" />
                      {showSources ? "Hide Ingested Source Evidence" : `View Evidence Chunks (${m.sources.length})`}
                      {showSources ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>

                    {showSources && (
                      <div className="mt-2 space-y-2 border-t pt-2">
                        {m.sources.map((src, i) => (
                          <div
                            key={i}
                            className="bg-background/80 p-2.5 rounded border text-xs space-y-1 text-muted-foreground"
                          >
                            <div className="flex justify-between items-center font-semibold text-foreground">
                              <span>Source: {src.documentTitle}</span>
                              <Badge variant="outline" className="text-[10px]">
                                {Math.round(src.similarityScore * 100)}% Match
                              </Badge>
                            </div>
                            <p className="italic text-[11px] leading-relaxed">
                              &ldquo;{src.chunkContent}&rdquo;
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 text-sm">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary animate-spin">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="bg-muted/50 border rounded-2xl rounded-tl-none px-4 py-3 text-xs text-muted-foreground animate-pulse">
              Retrieving evidence chunks and grounding response...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </Card>

      {/* Suggested Starter Prompts */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="text-muted-foreground self-center mr-1 text-[11px]">Suggestions:</span>
        {[
          "What work experience is required for Chevening?",
          "Does Fulbright cover full tuition and airfare?",
          "What are the language requirements for DAAD Helmut-Schmidt?",
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1 rounded-full border text-[11px] transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 shrink-0"
      >
        <Input
          placeholder="Ask about scholarship requirements, policies, or funding..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !inputQuery.trim()} className="gap-1.5 px-5">
          <Send className="h-4 w-4" />
          Ask Assistant
        </Button>
      </form>
    </div>
  );
}
