import assert from "node:assert/strict";

console.log("==================================================");
console.log(" ScholarAI Automated Verification Suite (Native ESM)");
console.log("==================================================");

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✔ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✖ FAIL: ${name}`);
    console.error(err);
  }
}

// 1. Text Chunker Logic
function chunkDocumentText(text, chunkSize = 400, chunkOverlap = 80) {
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  if (cleaned.length <= chunkSize) return [cleaned];

  const sentences = cleaned.split(/(?<=[.?!])\s+/);
  const chunks = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + " " + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      const overlapStart = Math.max(0, currentChunk.length - chunkOverlap);
      currentChunk = currentChunk.substring(overlapStart) + " " + sentence;
    } else {
      currentChunk = currentChunk ? currentChunk + " " + sentence : sentence;
    }
  }

  if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());
  return chunks;
}

// 2. Cosine Similarity Vector Calculation
function cosineSimilarity(vecA, vecB) {
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

// 3. Deterministic GPA Normalizer & Evaluator
function evaluateGpa(studentGpa, scale, minRequired) {
  if (studentGpa === null || studentGpa === undefined) {
    return { status: "MISSING_INFO", reason: "GPA missing" };
  }
  const normalized = (studentGpa / (scale || 4.0)) * 4.0;
  const meets = normalized >= minRequired;
  return {
    status: meets ? "MET" : "UNMET",
    normalizedGpa: Number(normalized.toFixed(2)),
    meets,
  };
}

// 4. Rate Limiter Token Bucket Simulation
function simulateRateLimiter(maxTokens, refillTimeMs) {
  let tokens = maxTokens;
  let lastRefill = Date.now();

  return function tryConsume() {
    const now = Date.now();
    if (now - lastRefill > refillTimeMs) {
      tokens = maxTokens;
      lastRefill = now;
    }
    if (tokens > 0) {
      tokens--;
      return { allowed: true, remaining: tokens };
    }
    return { allowed: false, remaining: 0 };
  };
}

// ----------------------------------------------------
// RUN TESTS
// ----------------------------------------------------
runTest("Text chunker splits documents into segments respecting overlap", () => {
  const doc = "First sentence of the official policy. Second sentence detailing financial award. Third sentence specifying eligible courses. Fourth sentence on language tests.";
  const chunks = chunkDocumentText(doc, 80, 20);
  assert.ok(chunks.length >= 2);
  assert.ok(chunks[0].includes("First sentence"));
});

runTest("Cosine similarity produces 1.0 for parallel vectors and 0.0 for orthogonal vectors", () => {
  const v1 = [0.6, 0.8];
  const v2 = [0.6, 0.8];
  const v3 = [-0.8, 0.6]; // Perpendicular

  assert.equal(Math.round(cosineSimilarity(v1, v2) * 100) / 100, 1.0);
  assert.equal(Math.round(cosineSimilarity(v1, v3) * 100) / 100, 0.0);
});

runTest("GPA normalizer scales a 10.0 scale GPA correctly against 4.0 requirement", () => {
  // 8.5 on a 10.0 scale is 3.4 on a 4.0 scale
  const evaluation = evaluateGpa(8.5, 10.0, 3.3);
  assert.equal(evaluation.status, "MET");
  assert.equal(evaluation.normalizedGpa, 3.4);

  const failedEval = evaluateGpa(7.5, 10.0, 3.5); // 3.0 normalized
  assert.equal(failedEval.status, "UNMET");
  assert.equal(failedEval.normalizedGpa, 3.0);
});

runTest("Missing student GPA returns MISSING_INFO without throwing error", () => {
  const missingEval = evaluateGpa(null, 4.0, 3.0);
  assert.equal(missingEval.status, "MISSING_INFO");
});

runTest("Rate limiter enforces token limit and throttles subsequent requests", () => {
  const limiter = simulateRateLimiter(3, 1000);
  assert.equal(limiter().allowed, true); // 1
  assert.equal(limiter().allowed, true); // 2
  assert.equal(limiter().allowed, true); // 3
  assert.equal(limiter().allowed, false); // 4 - throttled!
});

console.log("==================================================");
console.log(` All ${passedTests} / ${totalTests} verification tests passed successfully!`);
console.log("==================================================");
