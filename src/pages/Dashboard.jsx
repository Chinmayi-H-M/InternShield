import { Link } from 'react-router-dom';
import { Activity, XCircle, CheckCircle, AlertTriangle, ChevronRight, Briefcase } from 'lucide-react';

const Dashboard = () => {
  // Mock Result Data - In a real app this would come from the AI backend state
  const mockResult = {
    trustScore: 35,
    status: 'Scam', // Safe, Suspicious, Scam
    company: 'Nexus Global Solutions (Unverified)',
    title: 'Data Entry Analyst Intern',
    reasons: [
      { id: 1, type: 'danger', title: 'Payment Request', desc: 'The posting asks for a $200 onboarding fee for a "company laptop".' },
      { id: 2, type: 'danger', title: 'No Verifiable Domain', desc: 'The emails provided use @gmail.com instead of a corporate domain.' },
      { id: 3, type: 'alert', title: 'Unprofessional Language', desc: 'High usage of excessive exclamation marks and urgent pushing.' },
      { id: 4, type: 'alert', title: 'Vague Responsibilities', desc: 'Job duties are undefined and promise unusually high compensation for an intern.' },
    ]
  };

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
                  style={{ stroke: getStatusColor(mockResult.status), strokeWidth: '3', fill: 'none', strokeDasharray: `${mockResult.trustScore}, 100`, transition: 'stroke-dasharray 1.5s ease-out', strokeLinecap: 'round' }}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{mockResult.trustScore}</span>
                <span className="text-muted text-sm">/ 100</span>
              </div>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: getStatusBg(mockResult.status), color: getStatusColor(mockResult.status), borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '1.1rem' }}>
              {mockResult.status === 'Safe' ? <CheckCircle size={20} /> : mockResult.status === 'Suspicious' ? <AlertTriangle size={20} /> : <XCircle size={20} />}
              {mockResult.status.toUpperCase()}
            </div>
            
            <p className="text-muted text-sm" style={{ marginTop: '1rem' }}>Scores below 40 indicate high probability of a scam.</p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--color-surface)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Briefcase size={20} className="text-muted" /> Company Overview
            </h4>
            <div style={{ marginBottom: '0.5rem' }}>
              <span className="text-muted text-sm d-block">Found Listing</span>
              <p className="font-medium text-lg">{mockResult.title}</p>
            </div>
            <div>
              <span className="text-muted text-sm d-block">Organization</span>
              <p className="font-medium">{mockResult.company}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Flags */}
        <div className="glass-panel" style={{ padding: '2rem', gridColumn: 'span 2', background: 'var(--color-surface)' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={24} className="text-primary" /> Detection Reasons
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mockResult.reasons.map((reason) => (
              <div key={reason.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: reason.type === 'danger' ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)' }}>
                <div style={{ marginTop: '0.25rem' }}>
                  {reason.type === 'danger' ? <AlertTriangle style={{ color: 'var(--color-danger)' }} /> : <AlertTriangle style={{ color: 'var(--color-warning)' }} />}
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.25rem', color: reason.type === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                    {reason.title}
                  </h4>
                  <p style={{ color: 'var(--color-text-main)', fontSize: '0.95rem' }}>{reason.desc}</p>
                </div>
              </div>
            ))}
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
