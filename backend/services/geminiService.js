const { GoogleGenerativeAI } = require('@google/generative-ai');

// The sdk automatically picks up GEMINI_API_KEY from process.env if available,
// but we pass it explicitly here for clarity based on your .env vars.
const setupGenAI = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing in environment variables.");
    }
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const analyzeInternshipText = async (text) => {
    try {
        // ai is initialized below

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
        
        return parsedResult;

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to analyze text using Gemini AI.");
    }
};

module.exports = {
    analyzeInternshipText
};
