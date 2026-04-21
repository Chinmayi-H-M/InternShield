import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', paddingTop: '3rem', paddingBottom: '3rem' }}>
      <div className="container grid flex-wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
        <div>
          <Link to="/" className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
            <ShieldCheck style={{ width: '28px', height: '28px', color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Intern<span className="gradient-text">Shield</span></span>
          </Link>
          <p className="text-muted text-sm">Protecting students from fake internships and job scams through AI-powered detection.</p>
        </div>
        
        <div>
          <h4 style={{ marginBottom: '1rem' }}>Quick Links</h4>
          <div className="flex flex-col gap-2">
            <Link to="/" className="text-muted text-sm" style={{ transition: 'color 0.2s' }}>Home</Link>
            <Link to="/check" className="text-muted text-sm" style={{ transition: 'color 0.2s' }}>Check Internship</Link>
            <Link to="/report" className="text-muted text-sm" style={{ transition: 'color 0.2s' }}>Report Scam</Link>
          </div>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem' }}>Resources</h4>
          <div className="flex flex-col gap-2">
            <a href="#" className="text-muted text-sm">FAQ</a>
            <a href="#" className="text-muted text-sm">Blog</a>
            <a href="#" className="text-muted text-sm">Contact Us</a>
          </div>
        </div>
      </div>
      <div className="container" style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="text-muted text-sm">© 2026 InternShield. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
