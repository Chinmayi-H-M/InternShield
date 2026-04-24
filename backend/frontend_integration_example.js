// Example of how to integrate the API in your React frontend

/*
import React, { useState } from 'react';

const AnalyzeInternshipForm = () => {
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch('http://localhost:5000/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error('Failed to analyze the text');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 rounded-lg bg-gray-50 border">
            <h2 className="text-xl font-bold mb-4">Analyze Internship</h2>
            
            <form onSubmit={handleAnalyze} className="mb-4">
                <textarea
                    className="w-full p-2 border rounded resize-none"
                    rows="6"
                    placeholder="Paste internship link, job description, or screenshot text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                />
                <button 
                    type="submit" 
                    className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    disabled={loading}
                >
                    {loading ? 'Analyzing...' : 'Analyze'}
                </button>
            </form>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {result && (
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="font-semibold text-lg mb-2">Results:</h3>
                    <p><strong>Status:</strong> {result.status}</p>
                    <p><strong>Score:</strong> {result.score}/100</p>
                    <div className="my-2">
                        <strong>Reasons:</strong>
                        <ul className="list-disc pl-5">
                            {result.reasons.map((reason, idx) => (
                                <li key={idx} className="text-sm">{reason}</li>
                            ))}
                        </ul>
                    </div>
                    <p><strong>Recommendation:</strong> {result.recommendation}</p>
                </div>
            )}
        </div>
    );
};

export default AnalyzeInternshipForm;
*/
