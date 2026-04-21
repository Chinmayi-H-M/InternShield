import { ShieldAlert, Upload } from 'lucide-react';
import { useState } from 'react';

const Report = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="animate-fade-in container" style={{ padding: '4rem 1.5rem', maxWidth: '700px' }}>
      
      {submitted ? (
        <div className="glass-panel text-center animate-fade-in" style={{ padding: '4rem 2rem', background: 'var(--color-surface)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <ShieldAlert size={40} style={{ color: 'var(--color-success)' }} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Report Submitted</h2>
          <p className="text-muted text-lg" style={{ marginBottom: '2rem' }}>
            Thank you! Your report helps improve our AI models and protects other students.
          </p>
          <button onClick={() => setSubmitted(false)} className="btn btn-secondary">Submit Another Report</button>
        </div>
      ) : (
        <>
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', background: 'var(--color-danger-bg)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
              <ShieldAlert size={32} style={{ color: 'var(--color-danger)' }} />
            </div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Report a Scam</h1>
            <p className="text-muted text-lg">Did you encounter a fake internship? Share proof to help our community.</p>
          </div>

          <form className="glass-panel" style={{ padding: '2rem', background: 'var(--color-surface)' }} onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Company Name / Poster</label>
              <input type="text" className="form-input" placeholder="e.g. Nexus Global" required />
            </div>

            <div className="form-group">
              <label className="form-label">Job URL or Email Source</label>
              <input type="text" className="form-input" placeholder="https://..." required />
            </div>

            <div className="form-group">
              <label className="form-label">Why is it a scam?</label>
              <textarea className="form-textarea" rows={4} placeholder="They asked for my banking information before sending a contract..." required></textarea>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Upload Proof (Screenshots, Emails)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--color-border)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <Upload className="text-muted" size={24} />
                <input type="file" style={{ width: '100%', fontSize: '0.9rem' }} multiple />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
              Submit Report
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Report;
