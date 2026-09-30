const { GoogleGenAI } = require("@google/genai");
const { cleanAIJsonResponse } = require("../utils/helpers");

// The Gemini client picks up GEMINI_API_KEY from process.env automatically
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Asks Gemini to generate a single FAQ (question + answer + category)
 * for a given topic. Returns a plain JS object.
 */
const generateFAQFromTopic = async (topic) => {
  const prompt = `
You are helping build a company FAQ page.
Given the topic below, generate ONE frequently asked question and a clear, concise answer.
Also suggest ONE short category name for it.

Topic: "${topic}"

Respond with ONLY valid JSON, no markdown formatting, no backticks, in exactly this shape:
{
  "question": "...",
  "answer": "...",
  "category": "..."
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  const cleaned = cleanAIJsonResponse(response.text.trim());

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error("AI response could not be parsed as JSON");
  }

  return parsed;
};

/**
 * Uses Gemini to answer a user's free-text question using a list of
 * existing FAQs as context (simple prompt-stuffing RAG-lite approach).
 */
const answerFromFAQs = async (userQuestion, faqList) => {
  const context = faqList
    .map((f, i) => `${i + 1}. Q: ${f.question}\n   A: ${f.answer}`)
    .join("\n");

  const prompt = `
You are a helpful customer support assistant. Answer the user's question
using ONLY the FAQ context below. If the answer isn't in the context,
say you don't have that information yet.

FAQ context:
${context}

User question: "${userQuestion}"

Give a short, direct answer.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  return response.text.trim();
};

module.exports = { generateFAQFromTopic, answerFromFAQs };
