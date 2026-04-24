import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, XCircle, CheckCircle, AlertTriangle, ChevronRight, Briefcase, Info } from 'lucide-react';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="animate-fade-in container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>No analysis data found</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Please submit an internship description to see the results.</p>
        <button onClick={() => navigate('/check')} className="btn btn-primary">Go to Analyzer</button>
      </div>
    );
  }

  const { score: trustScore, status, reasons, recommendation } = result;

  const formattedReasons = reasons.map((r, i) => ({
    id: i,
    type: r.type || 'alert',
    title: r.title || 'Flag',
    desc: r.desc || r
  }));

  const getStatusColor = (status) => {
    switch(status) {
      case 'Safe': return 'var(--color-success)';
      case 'Suspicious': return 'var(--color-warning)';
      case 'Scam': return 'var(--color-danger)';
      default: return 'var(--color-primary)';
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'Safe': return 'var(--color-success-bg)';
      case 'Suspicious': return 'var(--color-warning-bg)';
      case 'Scam': return 'var(--color-danger-bg)';
      default: return '#f0f0f0';
    }
  };

  return (
    <div className="animate-fade-in container" style={{ padding: '4rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>AI Analysis Results</h1>
        <Link to="/check" className="btn btn-secondary">Analyze Another</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        
        {/* Left Column: Metric Ring & Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel text-center" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--color-surface)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Trust Score</h3>
            
            {/* Custom SVG Ring for Metric */}
            <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '1rem' }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                <path
                  style={{ stroke: 'var(--color-border)', strokeWidth: '3', fill: 'none' }}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  style={{ stroke: getStatusColor(status), strokeWidth: '3', fill: 'none', strokeDasharray: `${trustScore}, 100`, transition: 'stroke-dasharray 1.5s ease-out', strokeLinecap: 'round' }}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{trustScore}</span>
                <span className="text-muted text-sm">/ 100</span>
              </div>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: getStatusBg(status), color: getStatusColor(status), borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '1.1rem' }}>
              {status === 'Safe' ? <CheckCircle size={20} /> : status === 'Suspicious' ? <AlertTriangle size={20} /> : <XCircle size={20} />}
              {status.toUpperCase()}
            </div>
            
            <p className="text-muted text-sm" style={{ marginTop: '1rem' }}>Scores below 40 indicate high probability of a scam.</p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--color-surface)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Briefcase size={20} className="text-muted" /> Analysis Summary
            </h4>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
              {recommendation || (status === 'Scam' ? 'Avoid applying! Clear red flags detected.' : 'Proceed with caution and verify details.')}
            </p>
          </div>
        </div>

        {/* Right Column: Detailed Flags */}
        <div className="glass-panel" style={{ padding: '2rem', gridColumn: 'span 2', background: 'var(--color-surface)' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={24} className="text-primary" /> Detection Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {formattedReasons.length > 0 ? (
              formattedReasons.map((reason) => (
                <div key={reason.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: reason.type === 'danger' ? 'var(--color-danger-bg)' : reason.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)' }}>
                  <div style={{ marginTop: '0.25rem' }}>
                    {reason.type === 'danger' ? <AlertTriangle style={{ color: 'var(--color-danger)' }} /> : reason.type === 'success' ? <CheckCircle style={{ color: 'var(--color-success)' }} /> : <Info style={{ color: 'var(--color-warning)' }} />}
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '0.25rem', color: reason.type === 'danger' ? 'var(--color-danger)' : reason.type === 'success' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                      {reason.title}
                    </h4>
                    <p style={{ color: 'var(--color-text-main)', fontSize: '0.95rem' }}>{reason.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">No specific red flags were found in the text.</p>
            )}
          </div>
          
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="text-muted text-sm">Did our AI get this wrong?</p>
            <Link to="/report" className="text-primary" style={{ display: 'flex', alignItems: 'center', fontWeight: '500' }}>
              Report inaccuracy <ChevronRight size={16} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
