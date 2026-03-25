import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  return (
    <div className="page-wrapper">
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">
            <span>✨</span> Powered by GPT-4o Vision
          </div>
          <h1>
            Turn Physical Menus into<br />
            <span className="gradient-text">Digital Catalogs</span> in Seconds
          </h1>
          <p>
            Upload a photo of any menu. Our AI extracts every item, auto-categorizes dishes,
            flags missing Veg/Non-Veg data, and generates a clean catalog — ready for your food delivery platform.
          </p>
          <div className="hero-cta-group">
            <Link href="/upload" className="btn btn-primary">
              🚀 Digitise My Menu
            </Link>
            <Link href="#how-it-works" className="btn btn-secondary">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 0 60px' }}>
        <div className="container">
          <div className="stats-row">
            <div className="stat">
              <div className="stat-num">10s</div>
              <div className="stat-label">Average Extraction Time</div>
            </div>
            <div className="stat">
              <div className="stat-num">95%</div>
              <div className="stat-label">Item Detection Accuracy</div>
            </div>
            <div className="stat">
              <div className="stat-num">6</div>
              <div className="stat-label">Auto Categories</div>
            </div>
            <div className="stat">
              <div className="stat-num">0</div>
              <div className="stat-label">Manual Data Entry</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="how-it-works">
        <div className="container">
          <div className="section-label">How It Works</div>
          <h2 className="section-title">From blurry photo to digital catalog — <span className="gradient-text">instantly</span></h2>
          <div className="features-grid">
            <div className="feature-card animate-fadeIn">
              <div className="feature-icon">📸</div>
              <h3>Upload Any Menu Photo</h3>
              <p>Drag and drop JPG, PNG, or WebP photos. Works with blurry, crumpled, or low-light menu photos taken on any phone.</p>
            </div>
            <div className="feature-card animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="feature-icon">🧠</div>
              <h3>AI Extraction & Parsing</h3>
              <p>GPT-4o Vision reads every line of text — item names, prices, descriptions — and returns structured JSON data automatically.</p>
            </div>
            <div className="feature-card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon">🗂️</div>
              <h3>Smart Auto-Categorization</h3>
              <p>Items are automatically sorted into Starters, Mains, Desserts, Beverages, and Sides — no manual sorting needed.</p>
            </div>
            <div className="feature-card animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <div className="feature-icon">🚩</div>
              <h3>Missing Data Flags</h3>
              <p>Any item missing Veg/Non-Veg classification, price, or description gets flagged clearly so you can fill in the gaps.</p>
            </div>
            <div className="feature-card animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <div className="feature-icon">📋</div>
              <h3>Clean Digital Catalog</h3>
              <p>Browse your menu in a beautiful, searchable catalog view — ready to export to JSON or integrate with delivery platforms.</p>
            </div>
            <div className="feature-card animate-fadeIn" style={{ animationDelay: '0.5s' }}>
              <div className="feature-icon">⚡</div>
              <h3>Onboard in Minutes</h3>
              <p>What used to take days of manual data entry now happens in under a minute. Get restaurants live on your platform faster.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '0 0 100px' }}>
        <div className="container">
          <div className="glow-card" style={{ padding: '60px 40px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(0,201,167,0.08), rgba(123,47,247,0.08))' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>
              Ready to digitise your first menu?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
              No account needed. Just upload a photo and watch the magic happen.
            </p>
            <Link href="/upload" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>
              Get Started for Free →
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>© 2025 MenuAI · Built for food delivery platforms</p>
        </div>
      </footer>
    </div>
  );
}
