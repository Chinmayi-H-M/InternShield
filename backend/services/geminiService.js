const { GoogleGenerativeAI } = require('@google/generative-ai');

// The sdk automatically picks up GEMINI_API_KEY from process.env if available,
// but we pass it explicitly here for clarity based on your .env vars.
const setupGenAI = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing in environment variables.");
    }
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

/**
 * Validate the parsed Gemini response has the expected shape.
 * Returns a sanitized result or throws if the response is unusable.
 * 
 * Why this matters: Gemini could return { score: "high" } or { status: "Maybe" }
 * and without validation we'd pass garbage to the scoring engine.
 */
const validateGeminiResponse = (parsed) => {
    // Score must be a number
    if (typeof parsed.score !== 'number' || isNaN(parsed.score)) {
        throw new Error('Gemini returned invalid score (not a number).');
    }

    // Clamp score to valid range and round
    const score = Math.max(0, Math.min(100, Math.round(parsed.score)));

    // Status must be one of the valid values
    const validStatuses = ['Safe', 'Suspicious', 'Scam'];
    const status = validStatuses.includes(parsed.status) ? parsed.status : null;
    if (!status) {
        throw new Error(`Gemini returned invalid status: "${parsed.status}".`);
    }

    // Reasons should be an array of strings (filter out non-strings)
    const reasons = Array.isArray(parsed.reasons)
        ? parsed.reasons.filter(r => typeof r === 'string')
        : [];

    // Recommendation should be a string
    const recommendation = typeof parsed.recommendation === 'string'
        ? parsed.recommendation
        : '';

    return { score, status, reasons, recommendation };
};

const analyzeInternshipText = async (text) => {
    try {
        const prompt = `
You are an expert fraud detection AI specialized in analyzing internship and job opportunities.
Analyze the following internship/job opportunity text and classify it.
Your goal is to return a strict JSON object with NO markdown formatting, NO extra conversational text, just the raw JSON.

The rules for analysis:
1. "score": Calculate a trust score out of 100 (0 is highly likely to be a scam, 100 is completely safe).
2. "status": Must be exactly one of: "Safe", "Suspicious", or "Scam".
3. "reasons": An array of short string reasons explaining why you gave this score and status. Mention any red flags like payment requests, unrealistic earnings, urgent joining, etc.
4. "recommendation": A short string with an actionable recommendation for the user.

Text to analyze:
"""
${text}
"""

Return only JSON format like this:
{
  "score": 85,
  "status": "Safe",
  "reasons": ["Valid company details", "Clear role description"],
  "recommendation": "Proceed with application"
}
`;

        const ai = setupGenAI();
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }]}],
            generationConfig: {
                temperature: 0.2, // Low temperature for more analytical/consistent output
                responseMimeType: "application/json" // Force JSON output format
            }
        });

        const responseText = result.response.text();
        
        // As a safeguard against occasional markdown wrappers even with JSON mode
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResult = JSON.parse(cleanText);
        
        // Validate before returning — catch malformed AI responses early
        return validateGeminiResponse(parsedResult);

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to analyze text using Gemini AI.");
    }
};

module.exports = {
    analyzeInternshipText,
    validateGeminiResponse  // Exported for testing
};
