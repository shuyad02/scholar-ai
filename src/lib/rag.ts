import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "./prisma";
import { chunkDocumentText, cosineSimilarity, generateDeterministicPseudoVector } from "./rag-core";

export { chunkDocumentText, cosineSimilarity, generateDeterministicPseudoVector };

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Computes dense vector embeddings using Google's text-embedding-004 model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (genAI && apiKey) {
    try {
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      if (result.embedding?.values) {
        return result.embedding.values;
      }
    } catch (err) {
      console.warn("[ScholarAI RAG] Gemini embedding API unavailable, using fallback:", err);
    }
  }

  // Deterministic local vector embedding fallback (768 dimensions)
  return generateDeterministicPseudoVector(text, 768);
}

/**
 * Ingest and index a scholarship document into searchable vector chunks
 */
export async function ingestScholarshipDocument(
  scholarshipId: string,
  title: string,
  contentText: string,
  sourceUrl?: string
) {
  const doc = await prisma.scholarshipDocument.create({
    data: {
      scholarshipId,
      title,
      sourceUrl,
      contentText,
      version: 1,
    },
  });

  const textChunks = chunkDocumentText(contentText);

  for (let i = 0; i < textChunks.length; i++) {
    const chunkText = textChunks[i];
    const embedding = await generateEmbedding(chunkText);

    await prisma.documentChunk.create({
      data: {
        documentId: doc.id,
        chunkIndex: i,
        chunkContent: chunkText,
        tokenCount: Math.ceil(chunkText.length / 4),
        embedding,
        metadata: {
          scholarshipId,
          documentTitle: title,
          sourceUrl,
        },
      },
    });
  }

  return doc;
}

/**
 * Semantic Vector & Keyword Hybrid Retrieval
 */
export async function retrieveRelevantEvidence(
  query: string,
  scholarshipIdFilter?: string,
  topK = 4
) {
  const queryEmbedding = await generateEmbedding(query);
  const queryKeywords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);

  const chunks = await prisma.documentChunk.findMany({
    where: scholarshipIdFilter
      ? {
          document: {
            scholarshipId: scholarshipIdFilter,
          },
        }
      : undefined,
    include: {
      document: {
        include: {
          scholarship: {
            select: {
              id: true,
              title: true,
              provider: true,
              officialUrl: true,
            },
          },
        },
      },
    },
    take: 100,
  });

  const scoredChunks = chunks.map((chunk) => {
    let similarity = 0;
    if (chunk.embedding && chunk.embedding.length > 0) {
      similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
    }

    const lowerContent = chunk.chunkContent.toLowerCase();
    let keywordHits = 0;
    for (const kw of queryKeywords) {
      if (lowerContent.includes(kw)) keywordHits++;
    }
    const keywordBoost = Math.min(0.2, keywordHits * 0.05);

    return {
      chunk,
      finalScore: similarity + keywordBoost,
      similarity,
    };
  });

  scoredChunks.sort((a, b) => b.finalScore - a.finalScore);

  return scoredChunks.slice(0, topK);
}
