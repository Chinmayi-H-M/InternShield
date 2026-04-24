import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Link as LinkIcon, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';

const Checker = () => {
  const [activeTab, setActiveTab] = useState('link');
  const [inputVal, setInputVal] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!inputVal) return;
    setIsChecking(true);
    
    try {
      const response = await fetch('https://internshield-a4wm.onrender.com/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputVal })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze');
      }

      const data = await response.json();
      setIsChecking(false);
      navigate('/dashboard', { state: { result: data, inputText: inputVal } });
    } catch (error) {
      console.error(error);
      setIsChecking(false);
      alert('Failed to analyze internship. Ensure backend is running.');
    }
  };

  return (
    <div className="animate-fade-in container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <div className="text-center" style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Verify an Internship</h1>
        <p className="text-muted text-lg">Use our AI to instantly detect red flags in a job listing.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', background: 'var(--color-surface)' }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          {[
            { id: 'link', icon: <LinkIcon size={18} />, label: 'Paste Link' },
            { id: 'text', icon: <FileText size={18} />, label: 'Description' },
            { id: 'image', icon: <ImageIcon size={18} />, label: 'Upload Image' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer',
                padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 500,
                color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                backgroundColor: activeTab === tab.id ? 'var(--color-primary-bg)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <form onSubmit={handleCheck}>
          {activeTab === 'link' && (
            <div className="form-group">
              <label className="form-label">Job Posting URL</label>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--color-text-muted)' }} size={20} />
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://linkedin.com/jobs/view/..." 
                  style={{ paddingLeft: '3rem', paddingRight: '1rem' }}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  required
                  disabled={isChecking}
                />
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="form-group">
              <label className="form-label">Paste Job Description</label>
              <textarea 
                className="form-textarea" 
                rows={8} 
                placeholder="The company is looking for a driven intern. You must pay $50 for onboarding..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                required
                disabled={isChecking}
              ></textarea>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="form-group">
              <label className="form-label">Upload Screenshot</label>
              <div 
                style={{ 
                  border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', 
                  padding: '3rem 1rem', textAlign: 'center', cursor: 'pointer', background: 'var(--color-background)' 
                }}
              >
                <ImageIcon size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem auto' }} />
                <p className="font-medium">Click to upload or drag & drop</p>
                <p className="text-muted text-sm">PNG, JPG, up to 10MB</p>
              </div>
              {/* Dummy input for state tracking to satisfy requirement */}
              <input type="file" style={{ display: 'none' }} id="file-upload" onChange={(e) => setInputVal(e.target.value)} />
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem' }}
            disabled={(!inputVal && activeTab !== 'image') || isChecking} // Simple validation
          >
            {isChecking ? (
              <span className="flex items-center gap-2" style={{ justifyContent: 'center' }}>
                <Loader2 className="animate-float" style={{ animationTimingFunction: 'linear', animationDuration: '1s', animationIterationCount: 'infinite', animationName: 'spin' }} size={20} /> 
                Analyzing with AI...
              </span>
            ) : (
              'Analyze Internship'
            )}
          </button>
        </form>

        <style>{`
          @keyframes spin { 
            from { transform: rotate(0deg); } 
            to { transform: rotate(360deg); } 
          }
        `}</style>
      </div>
    </div>
  );
};

export default Checker;
