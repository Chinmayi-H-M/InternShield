import React from 'react';
import { Mail } from 'lucide-react';

const Contact = () => {
  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', maxWidth: '600px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>Contact Us</h1>
      <p className="text-muted text-center" style={{ marginBottom: '3rem' }}>Have a question or need to report an issue? We're here to help.</p>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully!'); }}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input type="text" className="form-input" placeholder="Your name" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="your@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-textarea" rows="5" placeholder="How can we help?" required style={{ resize: 'vertical' }}></textarea>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Send Message</button>
        </form>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '3rem' }}>
        <a href="mailto:hmschinmayi06@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-main)', textDecoration: 'none' }}>
          <Mail size={20} className="text-primary" /> hmschinmayi06@gmail.com
        </a>
      </div>
    </div>
  );
};

export default Contact;
