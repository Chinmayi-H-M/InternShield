const express = require('express');
const router = express.Router();
const { analyzeInternshipText } = require('../services/geminiService');
const { db } = require('../firebase');

// Rule-based custom scoring logic
const applyCustomRules = (text, geminiResult) => {
    let newScore = geminiResult.score;
    let newReasons = [...geminiResult.reasons];
    const lowerText = text.toLowerCase();

    // Red flag phrases array
    const customRules = [
        { phrase: 'registration fee', penalty: 20 },
        { phrase: 'training fee', penalty: 20 },
        { phrase: 'pay now', penalty: 30 },
        { phrase: 'urgent join', penalty: 10 },
        { phrase: 'earn 50000 instantly', penalty: 30 },
        { phrase: 'whatsapp only', penalty: 15 }
    ];

    let penaltyApplied = false;

    for (const rule of customRules) {
        if (lowerText.includes(rule.phrase)) {
            newScore -= rule.penalty;
            newReasons.push(`Custom Rule flagged: Found "${rule.phrase}"`);
            penaltyApplied = true;
        }
    }

    // Ensure score stays within 0 to 100
    newScore = Math.max(0, Math.min(100, newScore));
    
    // Auto-update status if score drops significantly
    let newStatus = geminiResult.status;
    if (newScore < 40) {
        newStatus = 'Scam';
    } else if (newScore < 70) {
        newStatus = 'Suspicious';
    } else {
        newStatus = 'Safe';
    }

    return {
        score: newScore,
        status: newStatus,
        reasons: newReasons,
        recommendation: penaltyApplied && newStatus === 'Scam' 
            ? "Avoid applying! Clear red flags detected by custom rules." 
            : geminiResult.recommendation
    };
};

// POST /api/analyze
router.post('/analyze', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({ error: 'Text input is required' });
        }

        // 1. Analyze text with Gemini
        const rawAnalysis = await analyzeInternshipText(text);

        // 2. Apply Custom rule-based scoring
        const finalAnalysis = applyCustomRules(text, rawAnalysis);

        // 3. Save to Firebase Firestore (if configured)
        if (db) {
            try {
                await db.collection('analyses').add({
                    text: text,
                    score: finalAnalysis.score,
                    status: finalAnalysis.status,
                    createdAt: new Date().toISOString()
                });
            } catch (fbError) {
                console.error("Firebase save failed:", fbError);
                // We shouldn't fail the request if just the logging fails
            }
        } else {
            console.warn("Firestore db is null, skipping save to 'analyses' collection.");
        }

        // 4. Return Final API Response
        return res.status(200).json(finalAnalysis);

    } catch (error) {
        console.error("Error in /api/analyze:", error);
        return res.status(500).json({ error: 'Internal server error while analyzing content.' });
    }
});

module.exports = router;
