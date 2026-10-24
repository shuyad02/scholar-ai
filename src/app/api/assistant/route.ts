import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AssistantQuerySchema } from "@/lib/validations";
import { retrieveRelevantEvidence } from "@/lib/rag";
import { successResponse, errorResponse } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limiter";
import { AssistantResponse } from "@/types";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: NextRequest) {
  try {
    // Apply rate limit: max 20 queries per minute per IP
    const rateLimit = checkRateLimit(req, 20, 60 * 1000);

    const body = await req.json();
    const { query, scholarshipId } = AssistantQuerySchema.parse(body);

    // 1. Retrieve top evidence chunks via vector + keyword semantic search
    const retrieved = await retrieveRelevantEvidence(query, scholarshipId, 4);

    const sources = retrieved.map((item) => ({
      documentTitle: item.chunk.document.title,
      chunkContent: item.chunk.chunkContent,
      similarityScore: Math.round(item.finalScore * 100) / 100,
    }));

    const scholarshipsReferencedMap = new Map<string, { id: string; title: string; provider: string; url?: string }>();

    for (const r of retrieved) {
      const s = r.chunk.document.scholarship;
      if (!scholarshipsReferencedMap.has(s.id)) {
        scholarshipsReferencedMap.set(s.id, {
          id: s.id,
          title: s.title,
          provider: s.provider,
          url: s.officialUrl,
        });
      }
    }

    const scholarshipsReferenced = Array.from(scholarshipsReferencedMap.values());

    // 2. Format context for Grounded Generation
    const evidenceText = retrieved
      .map(
        (r, idx) =>
          `[Source ${idx + 1}: ${r.chunk.document.scholarship.title} - "${r.chunk.document.title}"]\n${r.chunk.chunkContent}`
      )
      .join("\n\n");

    const isEvidenceSparse = retrieved.length === 0 || retrieved[0].finalScore < 0.25;

    // 3. Generate Grounded Answer via Gemini
    let answer = "";
    let confidence: "CONFIRMED" | "POTENTIAL" | "INSUFFICIENT_EVIDENCE" = isEvidenceSparse
      ? "INSUFFICIENT_EVIDENCE"
      : "CONFIRMED";

    if (genAI && apiKey && !isEvidenceSparse) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          systemInstruction: `You are ScholarAI Assistant, an authoritative AI admissions counselor grounded exclusively in verified scholarship documentation.
CRITICAL OPERATING RULES:
1. Answer the user's inquiry using ONLY the retrieved documentary evidence provided in the prompt.
2. If the retrieved evidence does not state the answer, say explicitly: "The official documentation indexed does not specify this detail. Please review the official portal or contact admissions."
3. NEVER invent application deadlines, award values, or eligibility thresholds.
4. CITE the relevant scholarship and document title in your explanation.
5. Format key criteria or deadlines as clean markdown bullet points.`,
        });

        const prompt = `Retrieved Official Evidence:\n${evidenceText}\n\nStudent Inquiry: "${query}"\n\nProvide a factual, concise response grounded strictly in the evidence above:`;

        const result = await model.generateContent(prompt);
        answer = result.response.text();
      } catch (err) {
        console.warn("[ScholarAI Assistant] Gemini call error, using deterministic synthesis:", err);
        answer = generateFallbackAnswer(query, retrieved);
      }
    } else {
      answer = generateFallbackAnswer(query, retrieved);
    }

    const responseData: AssistantResponse = {
      answer,
      scholarshipsReferenced,
      sources,
      confidence,
    };

    const res = successResponse(responseData, "Assistant query processed successfully");
    res.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
    return res;
  } catch (error) {
    return errorResponse(error);
  }
}

function generateFallbackAnswer(
  query: string,
  retrieved: Awaited<ReturnType<typeof retrieveRelevantEvidence>>
): string {
  if (retrieved.length === 0 || retrieved[0].finalScore < 0.2) {
    return `Based on the official scholarship documentation currently indexed, there is insufficient evidence to directly answer: "${query}". Please check the official scholarship provider portals or try refining your query with specific scholarship names (e.g., "Fulbright", "Chevening", "DAAD").`;
  }

  const top = retrieved[0];
  const s = top.chunk.document.scholarship;

  return `According to official documentation for **${s.title}** (*${top.chunk.document.title}*):\n\n> "${top.chunk.chunkContent.trim()}"\n\nFor full details and verified guidelines, visit the [official program portal](${s.officialUrl}).`;
}
