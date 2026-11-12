// server/src/utils/jsonParser.js

/**
 * Safely parses JSON returned by Google Generative AI models.
 * Strips markdown code fences, handles extra commentary, and normalizes line endings.
 *
 * @param {string} text - Raw text output from model
 * @returns {any} Parsed JSON object or array
 */
export function parseGenerativeJson(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty or invalid response received from model');
  }

  // 1. Strip markdown code fences if present (e.g., ```json ... ``` or ``` ... ```)
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const cleanText = (codeBlockMatch ? codeBlockMatch[1] : text).trim();

  // 2. Direct JSON.parse attempt
  try {
    return JSON.parse(cleanText);
  } catch (initialErr) {
    // 3. Fallback: extract the outermost JSON object { ... }
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleanText.slice(firstBrace, lastBrace + 1));
      } catch {}
    }

    // 4. Fallback: extract the outermost JSON array [ ... ]
    const firstBracket = cleanText.indexOf('[');
    const lastBracket = cleanText.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(cleanText.slice(firstBracket, lastBracket + 1));
      } catch {}
    }

    throw new Error(`Failed to parse model output as JSON: ${initialErr.message}`);
  }
}
