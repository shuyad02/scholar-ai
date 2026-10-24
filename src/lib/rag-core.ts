/**
 * Pure RAG string manipulation and vector mathematics functions
 * Zero external network or database dependencies for lightning-fast testing and execution
 */

/**
 * Text cleaner and chunker respecting sentence boundaries and overlap
 */
export function chunkDocumentText(
  text: string,
  chunkSize = 400,
  chunkOverlap = 80
): string[] {
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  if (cleaned.length <= chunkSize) {
    return [cleaned];
  }

  const sentences = cleaned.split(/(?<=[.?!])\s+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + " " + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Apply overlap from end of current chunk
      const overlapStart = Math.max(0, currentChunk.length - chunkOverlap);
      currentChunk = currentChunk.substring(overlapStart) + " " + sentence;
    } else {
      currentChunk = currentChunk ? currentChunk + " " + sentence : sentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Computes cosine similarity between two vector arrays
 * cos(theta) = (A . B) / (||A|| * ||B||)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Deterministic pseudo-vector generator (768 dimensions)
 */
export function generateDeterministicPseudoVector(text: string, dimensions = 768): number[] {
  const vector = new Array(dimensions).fill(0);
  const lower = text.toLowerCase();

  for (let i = 0; i < lower.length; i++) {
    const charCode = lower.charCodeAt(i);
    const index = (charCode * 31 + i * 17) % dimensions;
    vector[index] += 1;
  }

  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm) || 1;

  for (let i = 0; i < dimensions; i++) {
    vector[i] = vector[i] / norm;
  }

  return vector;
}
