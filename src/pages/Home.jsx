import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Target, AlertTriangle, CheckCircle } from 'lucide-react';

const Home = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section style={{ padding: '6rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container lg:grid-cols-2 lg:gap-8" style={{ display: 'grid', gap: '4rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-text-main)', lineHeight: 1.1 }}>
              Detect Fake Internships <br />
              <span className="gradient-text">Before You Apply</span>
            </h1>
            <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '600px' }}>
              AI-powered platform that checks internship authenticity, trust score, and scam risk instantly. Don't let scammers steal your data or money.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Link to="/check" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
                Check Internship
              </Link>
              <a href="#how-it-works" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
                Learn More
              </a>
            </div>
          </div>
          
          <div className="animate-float" style={{ position: 'relative' }}>
            <div className="glass-panel" style={{ padding: '1rem', borderRadius: 'var(--radius-2xl)', background: 'var(--glass-bg)' }}>
              <div style={{ width: '100%', aspectRatio: '16/10', borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)' }}>
                <Shield size={140} color="white" strokeWidth={1} className="animate-float" />
              </div>
              <div 
                className="glass-panel" 
                style={{ position: 'absolute', bottom: '-2rem', left: '-2rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <div style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '0.75rem', borderRadius: '50%' }}>
                  <CheckCircle />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1.25rem' }}>99.8%</p>
                  <p className="text-muted text-sm" style={{ margin: 0 }}>Accuracy Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '5rem 0', background: 'var(--color-surface)' }}>
        <div className="container text-center" style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>How <span className="gradient-text">InternShield</span> Works</h2>
          <p className="text-muted" style={{ fontSize: '1.125rem' }}>Our advanced AI models analyze hundreds of data points to verify opportunities.</p>
        </div>
        
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Target className="gradient-text" />, title: 'Paste & Analyze', desc: 'Simply paste the job link, description, or upload a screenshot.' },
            { icon: <Shield className="gradient-text" />, title: 'AI Verification', desc: 'We cross-check domains, contact info, language patterns, and known scams.' },
            { icon: <AlertTriangle className="gradient-text" />, title: 'Get Trust Score', desc: 'Receive a clear 0-100 score highlighting any suspicious red flags.' },
          ].map((feature, i) => (
            <div key={i} className="glass-panel text-center" style={{ padding: '2.5rem 1.5rem', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                {React.cloneElement(feature.icon, { size: 32 })}
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{feature.title}</h3>
              <p className="text-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Placeholder */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container text-center" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Frequently Asked Questions</h2>
          <div className="flex flex-col gap-4 text-left">
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Is InternShield free to use?</h4>
              <p className="text-muted text-sm">Yes! Core features for students checking internships are 100% free forever.</p>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>What makes an internship "Fake"?</h4>
              <p className="text-muted text-sm">Common red flags include asking for payment/equipment fees, unstructured descriptions, non-existent domains, or generic free email addresses (e.g., @gmail.com) pretending to be enterprise companies.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
