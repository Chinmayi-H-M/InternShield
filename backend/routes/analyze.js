const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { analyzeInternshipText } = require('../services/geminiService');
const { detectSignals, calculateFinalScore } = require('../services/riskSignals');

// Maximum allowed input length (characters)
const MAX_INPUT_LENGTH = 5000;

// POST /api/analyze
router.post('/analyze', async (req, res) => {
    try {
        const { text } = req.body;

        // --- Input Validation ---
        if (!text || typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({ error: 'Text input is required.' });
        }

        const trimmedText = text.trim();

        if (trimmedText.length > MAX_INPUT_LENGTH) {
            return res.status(400).json({
                error: `Input is too long. Maximum ${MAX_INPUT_LENGTH} characters allowed.`
            });
        }

        // --- Step 1: Run deterministic signal detection ---
        // This always runs, regardless of whether Gemini succeeds or fails.
        const { signals } = detectSignals(trimmedText);

        // --- Step 2: Call Gemini AI ---
        // If Gemini fails, geminiResult stays null and calculateFinalScore
        // uses the rules-only fallback (neutral 50 base, full-strength rules).
        let geminiResult = null;
        try {
            geminiResult = await analyzeInternshipText(trimmedText);
        } catch (geminiError) {
            console.error("Gemini AI failed, using rules-only fallback:", geminiError.message);
            // geminiResult stays null — calculateFinalScore handles this safely
        }

        // --- Step 3: Calculate final score ---
        // Merges AI assessment + deterministic signals using dampened scoring
        // to avoid double-counting. See riskSignals.js for the full strategy.
        const finalAnalysis = calculateFinalScore(geminiResult, signals);

        // --- Step 4: Save to Firestore (if configured) ---
        if (db) {
            try {
                await db.collection('analyses').add({
                    text: trimmedText.substring(0, 500), // Store first 500 chars only
                    score: finalAnalysis.score,
                    status: finalAnalysis.status,
                    analysisSource: finalAnalysis.analysisSource,
                    signalCount: signals.length,
                    createdAt: new Date().toISOString()
                });
            } catch (fbError) {
                console.error("Firebase save failed:", fbError);
            }
        }

        // --- Step 5: Return final response ---
        return res.status(200).json(finalAnalysis);

    } catch (error) {
        console.error("Error in /api/analyze:", error);
        return res.status(500).json({ error: 'Internal server error while analyzing content.' });
    }
});

module.exports = router;
