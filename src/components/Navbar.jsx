import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Check Internship', path: '/check' },
    { name: 'Report Scam', path: '/report' }
  ];

  return (
    <nav style={{ padding: '1rem 0', position: 'sticky', top: 0, zIndex: 50, background: 'var(--glass-bg)', backdropFilter: 'blur(var(--glass-blur))', borderBottom: '1px solid var(--glass-border)' }}>
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <ShieldCheck style={{ width: '32px', height: '32px', color: 'var(--color-primary)' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-text-main)' }}>
            Intern<span className="gradient-text">Shield</span>
          </span>
        </Link>
        
        {/* Desktop Menu */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="nav-desktop">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              style={{
                fontWeight: 500,
                color: location.pathname === link.path ? 'var(--color-primary)' : 'var(--color-text-main)',
                transition: 'color 0.2s ease',
              }}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/check" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
            Verify Now
          </Link>
        </div>

        {/* Mobile menu toggle implementation omitted for brevity, adding a simplistic fallback */}
        <button className="nav-mobile-btn" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
