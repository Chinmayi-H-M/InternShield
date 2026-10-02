/**
 * InternShield Risk Signal Engine
 * ================================
 * 
 * This module contains:
 * 1. Structured risk/positive signal definitions
 * 2. detectSignals(text) — scans user input for known patterns
 * 3. calculateFinalScore(geminiResult, signals) — merges AI + rules
 * 
 * SCORING STRATEGY (interview-friendly explanation):
 * -------------------------------------------------
 * When Gemini IS available:
 *   - Gemini provides a holistic base score (0-100)
 *   - Deterministic rules detect specific signals with defined point values
 *   - Since Gemini likely ALREADY considered obvious patterns (e.g., "registration fee"),
 *     applying the full rule penalty would double-count the same risk
 *   - So rule adjustments are DAMPENED by 50% before being added to Gemini's score
 *   - finalScore = clamp(geminiScore + ruleAdjustment * 0.5, 0, 100)
 * 
 * When Gemini FAILS (fallback):
 *   - Start from a NEUTRAL score of 50 (not 80!)
 *   - Apply rules at FULL strength (no AI score to double-count with)
 *   - If fewer than 2 signals are detected, there isn't enough evidence
 *     to classify confidently → return status "Uncertain"
 *   - finalScore = clamp(50 + ruleAdjustment, 0, 100)
 */

// ============================================================
// TEXT-BASED RISK SIGNALS
// Applied when user submits a job description or internship text
// ============================================================
const TEXT_RISK_SIGNALS = [
    {
        id: 'registration_fee',
        category: 'financial',
        severity: 'critical',
        points: -40,
        title: 'Registration Fee Requested',
        description: 'Legitimate internships never ask applicants to pay a registration fee.',
        test: (text) => text.includes('registration fee')
    },
    {
        id: 'training_fee',
        category: 'financial',
        severity: 'critical',
        points: -30,
        title: 'Training Fee Detected',
        description: 'Requiring payment for training is a common scam tactic.',
        test: (text) => text.includes('training fee')
    },
    {
        id: 'urgent_joining',
        category: 'urgency',
        severity: 'high',
        points: -15,
        title: 'Urgent Joining Pressure',
        description: 'Pressuring candidates to join immediately is a manipulation tactic.',
        test: (text) => text.includes('urgent join') || text.includes('join immediately') || text.includes('join today')
    },
    {
        id: 'urgent_payment',
        category: 'urgency',
        severity: 'critical',
        points: -25,
        title: 'Urgent Payment Pressure',
        description: 'Demanding immediate payment is a strong indicator of fraud.',
        test: (text) => text.includes('pay now') || text.includes('pay immediately') || text.includes('payment deadline today')
    },
    {
        id: 'unrealistic_earnings',
        category: 'financial',
        severity: 'critical',
        points: -25,
        title: 'Unrealistic Earnings Promise',
        description: 'Promises of instant or guaranteed high earnings are hallmarks of scam listings.',
        test: (text) => text.includes('earn 50000 instantly') ||
            text.includes('guaranteed income') ||
            /earn\s+\d{4,}\s*(per|a)\s*day/.test(text)
    },
    {
        id: 'whatsapp_only',
        category: 'communication',
        severity: 'high',
        points: -20,
        title: 'WhatsApp-Only Communication',
        description: 'Legitimate companies use official email and portals, not just WhatsApp.',
        test: (text) => text.includes('whatsapp') || text.includes('whats app')
    },
    {
        id: 'gmail_only',
        category: 'communication',
        severity: 'medium',
        points: -10,
        title: 'No Official Email Domain',
        description: 'Using only generic email (Gmail) instead of a company domain is suspicious.',
        test: (text) => text.includes('gmail only') || /contact.*@gmail\.com/.test(text)
    },
    {
        id: 'suspicious_domain_text_xyz',
        category: 'domain',
        severity: 'high',
        points: -35,
        title: 'Suspicious Domain (.xyz)',
        description: 'The .xyz domain extension is commonly used by scam websites.',
        test: (text) => text.includes('.xyz')
    },
    {
        id: 'suspicious_domain_text_top',
        category: 'domain',
        severity: 'high',
        points: -30,
        title: 'Suspicious Domain (.top)',
        description: 'The .top domain extension is commonly used by scam websites.',
        test: (text) => text.includes('.top')
    }
];

// ============================================================
// TEXT-BASED POSITIVE SIGNALS
// ============================================================
const TEXT_POSITIVE_SIGNALS = [
    {
        id: 'official_website',
        category: 'credibility',
        severity: 'low',
        points: 10,
        title: 'Official Company Website',
        description: 'Mentioning an official company website adds credibility.',
        test: (text) => text.includes('official website') || text.includes('company website')
    },
    {
        id: 'interview_process',
        category: 'credibility',
        severity: 'low',
        points: 10,
        title: 'Interview Process Mentioned',
        description: 'A structured interview process indicates a legitimate hiring practice.',
        test: (text) => text.includes('interview process') || text.includes('interview round')
    },
    {
        id: 'stipend',
        category: 'financial',
        severity: 'low',
        points: 5,
        title: 'Stipend Information',
        description: 'Mentioning a stipend suggests a genuine paid internship.',
        test: (text) => text.includes('stipend')
    },
    {
        id: 'company_email',
        category: 'credibility',
        severity: 'low',
        points: 10,
        title: 'Company Domain Email',
        description: 'Using a company-domain email shows professional communication.',
        test: (text) => text.includes('company domain email') || text.includes('company email')
    }
];

// ============================================================
// URL-BASED SIGNAL DEFINITIONS
// Applied when user submits a URL
// ============================================================
const SUSPICIOUS_DOMAINS = [
    { ext: '.xyz', points: -35, title: 'Suspicious Domain Extension (.xyz)' },
    { ext: '.top', points: -30, title: 'Suspicious Domain Extension (.top)' },
    { ext: '.click', points: -20, title: 'Suspicious Domain Extension (.click)' },
    { ext: '.live', points: -20, title: 'Suspicious Domain Extension (.live)' },
    { ext: '.buzz', points: -20, title: 'Suspicious Domain Extension (.buzz)' }
];

const TRUSTED_DOMAINS = [
    { domain: 'google.com', points: 20, title: 'Trusted Domain (Google)' },
    { domain: 'microsoft.com', points: 20, title: 'Trusted Domain (Microsoft)' },
    { domain: 'amazon.jobs', points: 20, title: 'Trusted Domain (Amazon Jobs)' },
    { domain: 'linkedin.com', points: 15, title: 'Trusted Domain (LinkedIn)' }
];

const SUSPICIOUS_URL_KEYWORDS = [
    { keyword: 'apply-now', points: -15, title: 'Suspicious URL Keyword (apply-now)' },
    { keyword: 'instant-job', points: -15, title: 'Suspicious URL Keyword (instant-job)' },
    { keyword: 'join-fast', points: -15, title: 'Suspicious URL Keyword (join-fast)' },
    { keyword: 'scam', points: -15, title: 'Suspicious URL Keyword (scam)' }
];


// ============================================================
// DETECTION ENGINE
// ============================================================

/**
 * Check if a string looks like a URL.
 */
const isUrl = (str) => {
    try {
        new URL(str);
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * Scan user input and return all matching signals.
 * 
 * @param {string} text - Raw user input (URL or text description)
 * @returns {{ isUrlInput: boolean, signals: object[] }}
 *   Each signal: { id, category, severity, points, title, description, type: 'risk'|'positive' }
 */
function detectSignals(text) {
    const lowerText = text.trim().toLowerCase();
    const signals = [];

    const isUrlInput = lowerText.startsWith('http://') ||
        lowerText.startsWith('https://') ||
        lowerText.startsWith('www.') ||
        isUrl(lowerText);

    if (isUrlInput) {
        // --- URL MODE ---
        let urlObj;
        try {
            urlObj = new URL(lowerText.startsWith('http') ? lowerText : `https://${lowerText}`);
        } catch (e) {
            urlObj = { hostname: lowerText };
        }
        const hostname = urlObj.hostname || lowerText;

        // Suspicious domain extensions
        for (const domain of SUSPICIOUS_DOMAINS) {
            if (hostname.endsWith(domain.ext)) {
                signals.push({
                    id: `sus_domain_${domain.ext.slice(1)}`,
                    category: 'domain',
                    severity: 'high',
                    points: domain.points,
                    title: domain.title,
                    description: `The URL uses a ${domain.ext} domain, commonly associated with scam websites.`,
                    type: 'risk'
                });
            }
        }

        // Suspiciously long URL
        if (lowerText.length > 80) {
            signals.push({
                id: 'long_url',
                category: 'domain',
                severity: 'medium',
                points: -10,
                title: 'Suspiciously Long URL',
                description: 'The provided URL is unusually long, which can indicate a phishing attempt.',
                type: 'risk'
            });
        }

        // Suspicious URL keywords
        for (const kw of SUSPICIOUS_URL_KEYWORDS) {
            if (lowerText.includes(kw.keyword)) {
                signals.push({
                    id: `sus_url_kw_${kw.keyword}`,
                    category: 'domain',
                    severity: 'high',
                    points: kw.points,
                    title: kw.title,
                    description: `URL contains suspicious keyword: "${kw.keyword}"`,
                    type: 'risk'
                });
            }
        }

        // Trusted domains
        for (const gen of TRUSTED_DOMAINS) {
            if (hostname === gen.domain || hostname.endsWith(`.${gen.domain}`)) {
                signals.push({
                    id: `trusted_${gen.domain.replace(/\./g, '_')}`,
                    category: 'credibility',
                    severity: 'low',
                    points: gen.points,
                    title: gen.title,
                    description: `URL is from a known trusted domain: ${gen.domain}`,
                    type: 'positive'
                });
            }
        }
    } else {
        // --- TEXT MODE ---
        for (const signal of TEXT_RISK_SIGNALS) {
            if (signal.test(lowerText)) {
                signals.push({
                    id: signal.id,
                    category: signal.category,
                    severity: signal.severity,
                    points: signal.points,
                    title: signal.title,
                    description: signal.description,
                    type: 'risk'
                });
            }
        }

        for (const signal of TEXT_POSITIVE_SIGNALS) {
            if (signal.test(lowerText)) {
                signals.push({
                    id: signal.id,
                    category: signal.category,
                    severity: signal.severity,
                    points: signal.points,
                    title: signal.title,
                    description: signal.description,
                    type: 'positive'
                });
            }
        }
    }

    return { isUrlInput, signals };
}


// ============================================================
// SCORING ENGINE
// ============================================================

// Dampening factor: when Gemini IS available, rule adjustments are
// multiplied by this to avoid double-counting with Gemini's analysis.
const DAMPENING_FACTOR = 0.5;

// Neutral starting score when Gemini is unavailable.
const FALLBACK_BASE_SCORE = 50;

// Minimum number of detected signals needed to classify confidently
// when Gemini is unavailable. Below this → "Uncertain" status.
const MIN_SIGNALS_FOR_CONFIDENCE = 2;

/**
 * Merge Gemini's AI result with deterministic signal detections
 * into a final score, status, and explanation.
 * 
 * @param {object|null} geminiResult - Validated Gemini response, or null if Gemini failed.
 *   Expected shape: { score: number, status: string, reasons: string[], recommendation: string }
 * @param {object[]} signals - Array of detected signals from detectSignals().
 * @returns {{ score, status, reasons, recommendation, analysisSource }}
 */
function calculateFinalScore(geminiResult, signals) {
    const isGeminiAvailable = geminiResult !== null;
    const analysisSource = isGeminiAvailable ? 'ai+rules' : 'rules-only';

    // --- Build reasons array for the frontend ---
    const reasons = [];

    // Include Gemini's textual reasons (if available)
    if (isGeminiAvailable && Array.isArray(geminiResult.reasons)) {
        for (const r of geminiResult.reasons) {
            reasons.push({
                type: 'alert',
                title: 'AI Analysis',
                desc: r,
                points: null,  // AI reasons don't have individual point values
                source: 'ai'
            });
        }
    }

    // Include deterministic signal detections (with point values)
    for (const signal of signals) {
        reasons.push({
            type: signal.type === 'risk' ? 'danger' : 'success',
            title: signal.title,
            desc: signal.description,
            points: signal.points,
            source: 'rules'
        });
    }

    // --- Calculate score ---
    const totalRuleAdjustment = signals.reduce((sum, s) => sum + s.points, 0);

    let score;
    if (isGeminiAvailable) {
        // Dampened merge: Gemini base + (rules × 0.5) to avoid double-counting
        const dampenedAdjustment = Math.round(totalRuleAdjustment * DAMPENING_FACTOR);
        score = geminiResult.score + dampenedAdjustment;
    } else {
        // Full-strength rules from neutral baseline (no AI to double-count with)
        score = FALLBACK_BASE_SCORE + totalRuleAdjustment;
    }

    // Clamp to valid range
    score = Math.max(0, Math.min(100, score));

    // --- Determine classification ---
    let status;
    let recommendation;

    // Special case: Gemini unavailable AND insufficient evidence
    if (!isGeminiAvailable && signals.length < MIN_SIGNALS_FOR_CONFIDENCE) {
        status = 'Uncertain';
        recommendation = 'Our AI analysis was unavailable and automated rules found limited evidence. Please verify this opportunity through independent research before proceeding.';
        if (reasons.length === 0) {
            reasons.push({
                type: 'alert',
                title: 'Analysis Limited',
                desc: 'AI analysis was unavailable and insufficient signals were detected for a confident assessment.',
                points: null,
                source: 'system'
            });
        }
    } else if (score >= 70) {
        status = 'Safe';
        recommendation = isGeminiAvailable
            ? 'This internship appears legitimate based on AI and rule-based analysis. You can proceed with the application.'
            : 'Rule-based analysis suggests this is likely legitimate, but AI verification was unavailable. Verify independently.';
        if (reasons.length === 0) {
            reasons.push({
                type: 'success',
                title: 'Looks Good',
                desc: 'No major red flags detected.',
                points: null,
                source: 'system'
            });
        }
    } else if (score >= 40) {
        status = 'Suspicious';
        recommendation = 'Proceed with caution. Suspicious patterns were detected. Verify the company details before sharing any sensitive information.';
    } else {
        status = 'Scam';
        recommendation = 'Avoid applying! High probability of a scam based on multiple red flags identified.';
    }

    return { score, status, reasons, recommendation, analysisSource };
}


module.exports = {
    detectSignals,
    calculateFinalScore,
    isUrl,
    // Exported for testing / extensibility
    TEXT_RISK_SIGNALS,
    TEXT_POSITIVE_SIGNALS,
    SUSPICIOUS_DOMAINS,
    TRUSTED_DOMAINS,
    SUSPICIOUS_URL_KEYWORDS,
    DAMPENING_FACTOR,
    FALLBACK_BASE_SCORE,
    MIN_SIGNALS_FOR_CONFIDENCE
};
