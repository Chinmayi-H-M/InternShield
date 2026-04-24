import React from 'react';

const Blog = () => {
  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', maxWidth: '1000px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>InternShield Blog</h1>
      <p className="text-muted text-center" style={{ marginBottom: '3rem' }}>Latest insights on internship safety and career advice.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <span className="text-primary text-sm font-bold" style={{ display: 'block', marginBottom: '0.5rem' }}>SAFETY TIPS</span>
          <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>5 Red Flags in Job Descriptions</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Learn how to spot the most common warning signs before you apply to that "too good to be true" internship.</p>
          <a href="https://consumer.ftc.gov/articles/job-scams" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'inline-block', textDecoration: 'none' }}>Read Article</a>
        </div>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <span className="text-primary text-sm font-bold" style={{ display: 'block', marginBottom: '0.5rem' }}>INDUSTRY NEWS</span>
          <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>The Rise of Telegram Job Scams</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Why scammers are moving to messaging apps to target fresh graduates and how to protect yourself.</p>
          <a href="https://www.cnbc.com/2023/10/12/job-scams-are-on-the-rise-how-to-spot-them.html" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'inline-block', textDecoration: 'none' }}>Read Article</a>
        </div>
      </div>
    </div>
  );
};

export default Blog;
