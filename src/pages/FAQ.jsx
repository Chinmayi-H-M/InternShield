import React from 'react';

const FAQ = () => {
  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>Frequently Asked Questions</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>How does the AI detection work?</h3>
          <p className="text-muted">Our AI analyzes job descriptions and URLs for common scam patterns, suspicious language, known malicious domains, and unrealistic promises.</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Is InternShield free to use?</h3>
          <p className="text-muted">Yes, our internship checker is completely free for all students to use.</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>What should I do if I find a scam?</h3>
          <p className="text-muted">You should report it immediately using our 'Report Scam' feature so we can warn other students.</p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
