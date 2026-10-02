/**
 * InternShield Detection Engine — Test Suite
 * ============================================
 * 
 * Tests the core detection and scoring logic without requiring
 * Gemini API access or Firebase credentials.
 * 
 * Run: cd backend && npm test
 */

const { detectSignals, calculateFinalScore } = require('../services/riskSignals');
const { validateGeminiResponse } = require('../services/geminiService');

// ============================================================
// SIGNAL DETECTION TESTS
// ============================================================

describe('Signal Detection (detectSignals)', () => {

    test('1. Legitimate internship with no payment request', () => {
        const input = 'Google is offering a summer internship for software engineering. ' +
            'The role involves building internal tools. Interview process includes ' +
            '2 coding rounds followed by a manager round. Stipend of 80000 per month.';
        const { signals } = detectSignals(input);
        const riskSignals = signals.filter(s => s.type === 'risk');
        const positiveSignals = signals.filter(s => s.type === 'positive');

        expect(riskSignals.length).toBe(0);
        expect(positiveSignals.length).toBeGreaterThan(0);
        // Should detect: interview_process, stipend
        expect(positiveSignals.some(s => s.id === 'interview_process')).toBe(true);
        expect(positiveSignals.some(s => s.id === 'stipend')).toBe(true);
    });

    test('2. Internship asking for registration fee', () => {
        const input = 'Exciting internship at XYZ Corp. You must pay a registration fee ' +
            'of Rs 2000 to confirm your seat.';
        const { signals } = detectSignals(input);
        const regFee = signals.find(s => s.id === 'registration_fee');

        expect(regFee).toBeDefined();
        expect(regFee.points).toBe(-40);
        expect(regFee.type).toBe('risk');
        expect(regFee.category).toBe('financial');
    });

    test('3. Internship asking for training fee', () => {
        const input = 'Join our data science internship. A training fee of Rs 5000 ' +
            'is required before the program begins.';
        const { signals } = detectSignals(input);
        const trainingFee = signals.find(s => s.id === 'training_fee');

        expect(trainingFee).toBeDefined();
        expect(trainingFee.points).toBe(-30);
        expect(trainingFee.type).toBe('risk');
    });

    test('4. Suspicious URL (.xyz domain + apply-now keyword)', () => {
        const input = 'https://free-internship.xyz/apply-now';
        const { signals, isUrlInput } = detectSignals(input);

        expect(isUrlInput).toBe(true);
        const riskSignals = signals.filter(s => s.type === 'risk');
        expect(riskSignals.length).toBeGreaterThanOrEqual(2); // .xyz + apply-now
        expect(riskSignals.some(s => s.id === 'sus_domain_xyz')).toBe(true);
        expect(riskSignals.some(s => s.id === 'sus_url_kw_apply-now')).toBe(true);
    });

    test('5. WhatsApp-only internship', () => {
        const input = 'For applying, send your resume on WhatsApp to +91 9876543210. ' +
            'No email applications accepted.';
        const { signals } = detectSignals(input);
        const whatsapp = signals.find(s => s.id === 'whatsapp_only');

        expect(whatsapp).toBeDefined();
        expect(whatsapp.points).toBe(-20);
        expect(whatsapp.category).toBe('communication');
    });

    test('6. Legitimate company-domain email', () => {
        const input = 'Apply by sending your resume to our company email at ' +
            'careers@techcorp.com. We will conduct an interview process with 3 rounds.';
        const { signals } = detectSignals(input);
        const companyEmail = signals.find(s => s.id === 'company_email');

        expect(companyEmail).toBeDefined();
        expect(companyEmail.type).toBe('positive');
        expect(companyEmail.points).toBe(10);
    });

    test('8. Empty input returns no signals', () => {
        const { signals } = detectSignals('');
        expect(signals.length).toBe(0);
    });

    test('URL mode: trusted domain gets bonus', () => {
        const input = 'https://careers.google.com/jobs/engineering-intern';
        const { signals, isUrlInput } = detectSignals(input);

        expect(isUrlInput).toBe(true);
        const positive = signals.filter(s => s.type === 'positive');
        expect(positive.length).toBeGreaterThan(0);
        expect(positive.some(s => s.title.includes('Google'))).toBe(true);
    });

    test('Multiple risk signals detected in one input', () => {
        const input = 'Urgent join now! Pay the registration fee of $500 via WhatsApp. ' +
            'Earn 50000 instantly after joining.';
        const { signals } = detectSignals(input);
        const riskSignals = signals.filter(s => s.type === 'risk');

        // Should detect: urgent_joining, registration_fee, whatsapp_only, unrealistic_earnings
        expect(riskSignals.length).toBeGreaterThanOrEqual(3);
    });
});

// ============================================================
// SCORING LOGIC TESTS
// ============================================================

describe('Scoring Logic (calculateFinalScore)', () => {

    test('7. Gemini failure with no signals → Uncertain status', () => {
        const result = calculateFinalScore(null, []);

        expect(result.status).toBe('Uncertain');
        expect(result.analysisSource).toBe('rules-only');
        expect(result.score).toBe(50); // Neutral baseline
        expect(result.recommendation).toContain('AI analysis was unavailable');
    });

    test('7b. Gemini failure with enough risk signals → still classifies (Scam)', () => {
        const signals = [
            { id: 'registration_fee', type: 'risk', points: -40, title: 'Reg Fee', description: 'test', category: 'financial', severity: 'critical' },
            { id: 'whatsapp_only', type: 'risk', points: -20, title: 'WhatsApp', description: 'test', category: 'communication', severity: 'high' }
        ];
        const result = calculateFinalScore(null, signals);

        // 50 + (-40) + (-20) = -10, clamped to 0
        expect(result.score).toBe(0);
        expect(result.status).toBe('Scam');
        expect(result.analysisSource).toBe('rules-only');
    });

    test('9. Score below 0 is clamped to 0', () => {
        const signals = [
            { id: 'a', type: 'risk', points: -40, title: 'T', description: 'd', category: 'financial', severity: 'critical' },
            { id: 'b', type: 'risk', points: -30, title: 'T', description: 'd', category: 'financial', severity: 'critical' },
            { id: 'c', type: 'risk', points: -25, title: 'T', description: 'd', category: 'financial', severity: 'critical' }
        ];
        // With Gemini score 20: 20 + (-95 * 0.5) = 20 - 48 = -28 → clamped to 0
        const result = calculateFinalScore(
            { score: 20, status: 'Scam', reasons: [], recommendation: '' },
            signals
        );
        expect(result.score).toBe(0);
        expect(result.score).toBeGreaterThanOrEqual(0);
    });

    test('10. Score above 100 is clamped to 100', () => {
        const signals = [
            { id: 'a', type: 'positive', points: 20, title: 'T', description: 'd', category: 'credibility', severity: 'low' },
            { id: 'b', type: 'positive', points: 20, title: 'T', description: 'd', category: 'credibility', severity: 'low' },
            { id: 'c', type: 'positive', points: 15, title: 'T', description: 'd', category: 'credibility', severity: 'low' }
        ];
        // With Gemini score 90: 90 + (55 * 0.5) = 90 + 28 = 118 → clamped to 100
        const result = calculateFinalScore(
            { score: 90, status: 'Safe', reasons: [], recommendation: '' },
            signals
        );
        expect(result.score).toBe(100);
        expect(result.score).toBeLessThanOrEqual(100);
    });

    test('Dampening prevents double-counting: AI+rules score vs rules-only score', () => {
        const signals = [
            { id: 'registration_fee', type: 'risk', points: -40, title: 'Reg Fee', description: 'test', category: 'financial', severity: 'critical' }
        ];

        // With Gemini: 30 + (-40 * 0.5) = 30 - 20 = 10
        const withAI = calculateFinalScore(
            { score: 30, status: 'Scam', reasons: ['Payment requested'], recommendation: '' },
            signals
        );

        // Without Gemini: 50 + (-40) = 10
        const withoutAI = calculateFinalScore(null, signals);

        // With AI, the penalty is dampened (halved) because Gemini already accounted for it
        expect(withAI.score).toBe(10);
        // Without AI, full penalty from neutral baseline
        expect(withoutAI.score).toBe(10);
    });

    test('Reasons include both AI and rule sources', () => {
        const signals = [
            { id: 'stipend', type: 'positive', points: 5, title: 'Stipend', description: 'Paid internship', category: 'financial', severity: 'low' }
        ];
        const result = calculateFinalScore(
            { score: 80, status: 'Safe', reasons: ['Valid company'], recommendation: 'OK' },
            signals
        );

        const aiReasons = result.reasons.filter(r => r.source === 'ai');
        const ruleReasons = result.reasons.filter(r => r.source === 'rules');
        expect(aiReasons.length).toBe(1);
        expect(aiReasons[0].desc).toBe('Valid company');
        expect(ruleReasons.length).toBe(1);
        expect(ruleReasons[0].points).toBe(5);
    });

    test('Gemini failure with 1 signal → still Uncertain (below threshold)', () => {
        const signals = [
            { id: 'stipend', type: 'positive', points: 5, title: 'Stipend', description: 'test', category: 'financial', severity: 'low' }
        ];
        const result = calculateFinalScore(null, signals);

        // Only 1 signal < MIN_SIGNALS_FOR_CONFIDENCE (2) → Uncertain
        expect(result.status).toBe('Uncertain');
    });
});

// ============================================================
// GEMINI RESPONSE VALIDATION TESTS
// ============================================================

describe('Gemini Response Validation (validateGeminiResponse)', () => {

    test('Rejects non-numeric score', () => {
        expect(() => validateGeminiResponse({
            score: 'high', status: 'Safe', reasons: [], recommendation: ''
        })).toThrow('not a number');
    });

    test('Rejects invalid status', () => {
        expect(() => validateGeminiResponse({
            score: 50, status: 'Maybe', reasons: [], recommendation: ''
        })).toThrow('invalid status');
    });

    test('Sanitizes valid response', () => {
        const result = validateGeminiResponse({
            score: 85.7, status: 'Safe', reasons: ['Good', 123], recommendation: 'OK'
        });

        expect(result.score).toBe(86); // Rounded
        expect(result.status).toBe('Safe');
        expect(result.reasons).toEqual(['Good']); // Non-string filtered out
        expect(result.recommendation).toBe('OK');
    });

    test('Clamps out-of-range score', () => {
        const tooHigh = validateGeminiResponse({
            score: 150, status: 'Safe', reasons: [], recommendation: ''
        });
        expect(tooHigh.score).toBe(100);

        const tooLow = validateGeminiResponse({
            score: -20, status: 'Scam', reasons: [], recommendation: ''
        });
        expect(tooLow.score).toBe(0);
    });

    test('Handles missing optional fields gracefully', () => {
        const result = validateGeminiResponse({
            score: 50, status: 'Suspicious'
            // reasons and recommendation missing
        });

        expect(result.reasons).toEqual([]);
        expect(result.recommendation).toBe('');
    });
});
