import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

export async function runGemini(prompt) {
  // Create model instance
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Generate text
  const result = await model.generateContent(prompt);
  return result.response.text();
}