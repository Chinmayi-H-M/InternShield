/**
 * Verification script — traces examples through the actual detection engine.
 * This is NOT a test file. It's a scratch script to verify behavior manually.
 * 
 * Run: cd backend && node __tests__/verify_traces.js
 */

const { detectSignals, calculateFinalScore } = require('../services/riskSignals');

console.log('='.repeat(70));
console.log('TRACE 1: Scam input (Gemini available — hypothetical score 15)');
console.log('='.repeat(70));

const scamInput = 'Congratulations! You have been selected for a software internship. Pay ₹2000 registration fee to confirm your position. Contact us on WhatsApp immediately.';
console.log('\nInput:', scamInput);

const { signals: signals1, isUrlInput: isUrl1 } = detectSignals(scamInput);
console.log('\nisUrlInput:', isUrl1);
console.log('\nDetected signals:');
signals1.forEach(s => {
    console.log(`  [${s.type.toUpperCase()}] ${s.id}: ${s.title} (${s.points} pts)`);
});

const totalAdj1 = signals1.reduce((sum, s) => sum + s.points, 0);
console.log('\nTotal rule adjustment:', totalAdj1);
console.log('Dampened adjustment (× 0.5):', Math.round(totalAdj1 * 0.5));

// Hypothetical Gemini score
const geminiResult1 = { score: 15, status: 'Scam', reasons: ['Payment requested', 'No company details'], recommendation: 'Avoid' };
const result1 = calculateFinalScore(geminiResult1, signals1);
console.log('\nGemini base score:', geminiResult1.score);
console.log('Final score:', result1.score, `(${geminiResult1.score} + ${Math.round(totalAdj1 * 0.5)} = ${geminiResult1.score + Math.round(totalAdj1 * 0.5)}, clamped to 0-100)`);
console.log('Status:', result1.status);
console.log('Analysis source:', result1.analysisSource);
console.log('\nReasons shown to user:');
result1.reasons.forEach(r => {
    const pts = r.points !== null ? ` [${r.points} pts]` : '';
    console.log(`  [${r.source}] ${r.type}: ${r.title}${pts} — ${r.desc}`);
});

console.log('\n' + '='.repeat(70));
console.log('TRACE 2: Same input, Gemini FAILS');
console.log('='.repeat(70));

const result2 = calculateFinalScore(null, signals1);
console.log('\ngeminiResult:', null);
console.log('Starting score: 50 (FALLBACK_BASE_SCORE)');
console.log('Total rule adjustment (FULL, no dampening):', totalAdj1);
console.log('Raw calculation: 50 +', totalAdj1, '=', 50 + totalAdj1);
console.log('Final score:', result2.score, '(clamped to 0-100)');
console.log('Status:', result2.status);
console.log('Signals detected:', signals1.length, '(≥ 2, so NOT Uncertain)');

console.log('\n' + '='.repeat(70));
console.log('TRACE 3: Gemini fails + minimal input → Uncertain');
console.log('='.repeat(70));

const minimalInput = 'We are looking for an intern to join our team.';
const { signals: signals3 } = detectSignals(minimalInput);
console.log('\nInput:', minimalInput);
console.log('Detected signals:', signals3.length);
const result3 = calculateFinalScore(null, signals3);
console.log('Score:', result3.score);
console.log('Status:', result3.status, '(< 2 signals AND Gemini failed → Uncertain)');

console.log('\n' + '='.repeat(70));
console.log('TRACE 4: Registration fee variations');
console.log('='.repeat(70));

const variations = [
    'registration fee',
    'pay a registration fee',
    'application fee',
    'processing fee',
    'training fee',
    'security deposit',
    'pay ₹2000 to confirm your internship'
];

variations.forEach(phrase => {
    const input = `You need to pay ${phrase} to join this internship.`;
    const { signals } = detectSignals(input);
    const detected = signals.map(s => s.id);
    const hasHit = signals.length > 0;
    console.log(`\n  "${phrase}"`);
    console.log(`    Detected: ${hasHit ? 'YES → ' + detected.join(', ') : 'NO — not covered by current rules'}`);
});

console.log('\n' + '='.repeat(70));
console.log('TRACE 5: URL detection');
console.log('='.repeat(70));

const url1 = 'https://example.xyz/apply-now';
const { signals: urlSignals1, isUrlInput: isUrlA } = detectSignals(url1);
console.log(`\nURL: ${url1}`);
console.log('isUrlInput:', isUrlA);
console.log('Signals:');
urlSignals1.forEach(s => console.log(`  [${s.type}] ${s.id}: ${s.points} pts`));
const urlResult1 = calculateFinalScore({ score: 50, status: 'Suspicious', reasons: [], recommendation: '' }, urlSignals1);
console.log('With Gemini base 50, final score:', urlResult1.score);

const url2 = 'https://www.google.com/careers';
const { signals: urlSignals2, isUrlInput: isUrlB } = detectSignals(url2);
console.log(`\nURL: ${url2}`);
console.log('isUrlInput:', isUrlB);
console.log('Signals:');
urlSignals2.forEach(s => console.log(`  [${s.type}] ${s.id}: ${s.points} pts`));
const urlResult2 = calculateFinalScore({ score: 85, status: 'Safe', reasons: [], recommendation: '' }, urlSignals2);
console.log('With Gemini base 85, final score:', urlResult2.score);

console.log('\n' + '='.repeat(70));
console.log('TRACE 6: Firestore object');
console.log('='.repeat(70));
console.log(`
The exact object saved to Firestore (analyze.js lines 51-58):
{
    text: trimmedText.substring(0, 500),  // First 500 chars ONLY
    score: finalAnalysis.score,
    status: finalAnalysis.status,
    analysisSource: finalAnalysis.analysisSource,
    signalCount: signals.length,
    createdAt: new Date().toISOString()
}
Collection name: "analyses"
`);

console.log('='.repeat(70));
console.log('ALL TRACES COMPLETE');
console.log('='.repeat(70));
