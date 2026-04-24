const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { analyzeInternshipText } = require('../services/geminiService');

const isUrl = (str) => {
    try {
        new URL(str);
        return true;
    } catch (e) {
        return false;
    }
};

const applyCustomRules = (text, geminiResult) => {
    // Start with Gemini's base score
    let score = geminiResult.score;
    const lowerText = text.trim().toLowerCase();
    
    // Map Gemini's string reasons to our structured objects
    const reasons = (geminiResult.reasons || []).map(r => ({
        type: 'alert',
        title: 'AI Analysis',
        desc: r
    }));

    // Determine if input is a URL
    const isUrlInput = lowerText.startsWith('http://') || lowerText.startsWith('https://') || lowerText.startsWith('www.') || isUrl(lowerText);

    if (isUrlInput) {
        let urlObj;
        try {
            urlObj = new URL(lowerText.startsWith('http') ? lowerText : `https://${lowerText}`);
        } catch (e) {
            urlObj = { hostname: lowerText };
        }
        
        const hostname = urlObj.hostname || lowerText;

        // 1. Detect suspicious domains
        const susDomains = [
            { ext: '.xyz', penalty: 35 },
            { ext: '.top', penalty: 30 },
            { ext: '.click', penalty: 20 },
            { ext: '.live', penalty: 20 },
            { ext: '.buzz', penalty: 20 }
        ];

        for (const domain of susDomains) {
            if (hostname.endsWith(domain.ext)) {
                score -= domain.penalty;
                reasons.push({ type: 'danger', title: 'Suspicious Domain Extension', desc: `Found suspicious domain ending in ${domain.ext}` });
            }
        }

        // 2. Penalize long strange URLs
        if (lowerText.length > 80) {
            score -= 10;
            reasons.push({ type: 'alert', title: 'Suspiciously Long URL', desc: 'The provided URL is unusually long.' });
        }

        // 3. Penalize specific words
        const badUrlWords = ['apply-now', 'instant-job', 'join-fast', 'scam'];
        for (const word of badUrlWords) {
            if (lowerText.includes(word)) {
                score -= 15;
                reasons.push({ type: 'danger', title: 'Suspicious URL Keyword', desc: `URL contains suspicious keyword: "${word}"` });
            }
        }

        // 4. Genuine domains bonus
        const genuineDomains = [
            { domain: 'google.com', bonus: 20 },
            { domain: 'microsoft.com', bonus: 20 },
            { domain: 'amazon.jobs', bonus: 20 },
            { domain: 'linkedin.com', bonus: 15 }
        ];

        for (const gen of genuineDomains) {
            if (hostname === gen.domain || hostname.endsWith(`.${gen.domain}`)) {
                score += gen.bonus;
                reasons.push({ type: 'success', title: 'Trusted Domain', desc: `URL is from a known trusted domain: ${gen.domain}` });
            }
        }
    } else {
        // Text keyword detection
        const negativeRules = [
            { phrase: 'registration fee', penalty: 40, title: 'Registration Fee Detected' },
            { phrase: 'training fee', penalty: 30, title: 'Training Fee Detected' },
            { phrase: 'urgent join', penalty: 15, title: 'High Urgency' },
            { phrase: 'earn 50000 instantly', penalty: 25, title: 'Unrealistic Earnings' },
            { phrase: 'whatsapp', penalty: 20, title: 'WhatsApp Contact Request' },
            { phrase: 'gmail only', penalty: 10, title: 'No Custom Domain Email' },
            { phrase: '.xyz', penalty: 35, title: 'Suspicious Domain Mentioned (.xyz)' },
            { phrase: '.top', penalty: 30, title: 'Suspicious Domain Mentioned (.top)' }
        ];

        const positiveRules = [
            { phrase: 'official website', bonus: 10, title: 'Official Website Mentioned' },
            { phrase: 'interview process', bonus: 10, title: 'Structured Interview' },
            { phrase: 'stipend', bonus: 5, title: 'Paid Internship' },
            { phrase: 'company domain email', bonus: 10, title: 'Professional Email Domain' }
        ];

        for (const rule of negativeRules) {
            if (lowerText.includes(rule.phrase)) {
                score -= rule.penalty;
                reasons.push({ type: 'danger', title: rule.title, desc: `Found suspicious phrase: "${rule.phrase}"` });
            }
        }

        for (const rule of positiveRules) {
            if (lowerText.includes(rule.phrase)) {
                score += rule.bonus;
                reasons.push({ type: 'success', title: rule.title, desc: `Found positive phrase: "${rule.phrase}"` });
            }
        }
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Classification
    let status;
    let recommendation;
    if (score >= 70) {
        status = 'Safe';
        recommendation = 'This internship appears legitimate based on AI and custom rules. You can proceed with the application.';
        if (reasons.length === 0) {
            reasons.push({ type: 'success', title: 'Looks Good', desc: 'No major red flags detected.' });
        }
    } else if (score >= 40) {
        status = 'Suspicious';
        recommendation = 'Proceed with caution. AI or rules detected suspicious patterns. Verify the company details before sharing any sensitive info.';
    } else {
        status = 'Scam';
        recommendation = 'Avoid applying! High probability of a scam based on multiple red flags identified by AI and our rules.';
    }

    return { score, status, reasons, recommendation };
};

// POST /api/analyze
router.post('/analyze', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({ error: 'Text input is required' });
        }

        let rawAnalysis;
        try {
            // 1. Analyze text with Gemini AI
            rawAnalysis = await analyzeInternshipText(text);
        } catch (geminiError) {
            console.error("Gemini AI failed, using fallback starting score:", geminiError);
            // Graceful fallback in case Gemini fails (e.g. invalid API key)
            rawAnalysis = {
                score: 80,
                status: 'Safe',
                reasons: ['AI analysis unavailable. Using rule-based fallback.'],
                recommendation: ''
            };
        }

        // 2. Apply Custom rule-based scoring on top
        const finalAnalysis = applyCustomRules(text, rawAnalysis);

        // Save to Firebase Firestore (if configured)
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
            }
        }

        // Return Final API Response
        return res.status(200).json(finalAnalysis);

    } catch (error) {
        console.error("Error in /api/analyze:", error);
        return res.status(500).json({ error: 'Internal server error while analyzing content.' });
    }
});

module.exports = router;
