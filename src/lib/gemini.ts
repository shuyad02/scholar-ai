import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "missing_key");

// Export a configured model instance for generic text tasks
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Export a configured model instance for complex reasoning if needed
export const geminiProModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
