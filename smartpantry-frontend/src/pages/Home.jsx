import { Link } from 'react-router-dom';
import './styles/Home.css';

// Simple line-art pantry shelf illustration — no stock imagery, ties to the
// app's actual subject matter instead of a generic hero graphic.
function PantryIllustration() {
  return (
    <svg width="280" height="220" viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="10" width="240" height="200" rx="8" stroke="#2d6a4f" strokeWidth="2.5" />
      <line x1="20" y1="76" x2="260" y2="76" stroke="#2d6a4f" strokeWidth="2.5" />
      <line x1="20" y1="142" x2="260" y2="142" stroke="#2d6a4f" strokeWidth="2.5" />
      {/* jar */}
      <rect x="40" y="34" width="34" height="34" rx="4" stroke="#2d6a4f" strokeWidth="2" />
      <rect x="48" y="26" width="18" height="10" rx="2" fill="#2d6a4f" />
      {/* can */}
      <rect x="92" y="30" width="30" height="38" rx="3" stroke="#c9a227" strokeWidth="2" />
      <ellipse cx="107" cy="30" rx="15" ry="4" stroke="#c9a227" strokeWidth="2" />
      {/* bottle */}
      <path d="M150 30 h14 v10 l6 8 v20 h-26 v-20 l6 -8 z" stroke="#2d6a4f" strokeWidth="2" />
      {/* leafy veg */}
      <path d="M200 66 q-4 -20 10 -30 q10 12 0 30 z" stroke="#2d6a4f" strokeWidth="2" />
      <path d="M214 66 q4 -16 -6 -26 q-8 10 0 26 z" stroke="#2d6a4f" strokeWidth="2" />

      {/* middle shelf: fruit basket */}
      <path d="M40 128 h50 l-6 -20 h-38 z" stroke="#c9a227" strokeWidth="2" />
      <circle cx="55" cy="118" r="7" stroke="#c9a227" strokeWidth="2" />
      <circle cx="68" cy="120" r="6" stroke="#c9a227" strokeWidth="2" />
      {/* bread */}
      <path d="M100 132 q0 -22 22 -22 q22 0 22 22 z" stroke="#2d6a4f" strokeWidth="2" />
      <path d="M108 132 q2 -12 0 -18 M120 132 q2 -14 0 -20 M132 132 q2 -12 0 -18" stroke="#2d6a4f" strokeWidth="1.5" />
      {/* box (donation-ready) */}
      <rect x="170" y="108" width="40" height="24" stroke="#b5543a" strokeWidth="2" />
      <line x1="170" y1="118" x2="210" y2="118" stroke="#b5543a" strokeWidth="2" />
      <line x1="190" y1="108" x2="190" y2="118" stroke="#b5543a" strokeWidth="2" />

      {/* bottom shelf: milk + eggs */}
      <rect x="40" y="166" width="24" height="34" rx="3" stroke="#2d6a4f" strokeWidth="2" />
      <path d="M40 172 l12 -10 12 10" stroke="#2d6a4f" strokeWidth="2" />
      <rect x="86" y="176" width="46" height="24" rx="6" stroke="#2d6a4f" strokeWidth="2" />
      <circle cx="99" cy="188" r="6" stroke="#2d6a4f" strokeWidth="1.5" />
      <circle cx="112" cy="188" r="6" stroke="#2d6a4f" strokeWidth="1.5" />
      <circle cx="125" cy="188" r="6" stroke="#2d6a4f" strokeWidth="1.5" />
    </svg>
  );
}

function FeatureIcon({ path }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  );
}

export default function Home() {
  return (
    <div className="sp-home">
      <nav className="sp-nav">
        <div className="sp-nav-brand">
          <svg className="sp-nav-logo" viewBox="0 0 34 34" fill="none">
            <rect width="34" height="34" rx="8" fill="#2d6a4f" />
            <path d="M10 22V14a7 7 0 0 1 14 0v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 22h18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
          SmartPantry
        </div>
        <ul className="sp-nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div className="sp-nav-actions">
          <Link to="/login" className="sp-btn sp-btn-secondary">Login</Link>
          <Link to="/register" className="sp-btn sp-btn-primary">Sign Up</Link>
        </div>
      </nav>

      <header className="sp-hero" id="home">
        <div>
          <div className="sp-hero-eyebrow">Food waste, solved at home</div>
          <h1>Reduce food waste, save more</h1>
          <p>
            Track what's in your pantry, catch expiry dates before they catch you,
            donate what you won't use, and plan meals around what's already there.
          </p>
          <div className="sp-hero-actions">
            <Link to="/register" className="sp-btn sp-btn-primary">Get Started</Link>
            <a href="#how-it-works" className="sp-btn sp-btn-secondary">Learn More</a>
          </div>
        </div>
        <div className="sp-hero-visual">
          <PantryIllustration />
        </div>
      </header>

      <section className="sp-section">
        <div className="sp-section-head">
          <div className="sp-freshness-bar"><span></span><span></span><span></span></div>
          <h2>Why SmartPantry?</h2>
          <p>Manage food smarter and waste less with simple tools designed for everyday use.</p>
        </div>
        <div className="sp-features">
          <div className="sp-feature-card">
            <div className="sp-feature-icon">
              <FeatureIcon path={<><rect x="5" y="7" width="14" height="13" rx="1"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></>} />
            </div>
            <h3>Track inventory</h3>
            <p>Add and manage your food items with quantity, category, and storage location.</p>
          </div>
          <div className="sp-feature-card">
            <div className="sp-feature-icon">
              <FeatureIcon path={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></>} />
            </div>
            <h3>Get expiry alerts</h3>
            <p>Never let food go to waste again — get notified before items go bad.</p>
          </div>
          <div className="sp-feature-card">
            <div className="sp-feature-icon">
              <FeatureIcon path={<><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/></>} />
            </div>
            <h3>Donate food</h3>
            <p>Share surplus food with your community before it expires.</p>
          </div>
        </div>
      </section>

      <section className="sp-section" id="how-it-works">
        <div className="sp-section-head">
          <div className="sp-freshness-bar"><span></span><span></span><span></span></div>
          <h2>How it works</h2>
          <p>A simple flow from adding food to reducing waste.</p>
        </div>
        <div className="sp-steps">
          <div className="sp-step">
            <h3>Add your food</h3>
            <p>Start by listing what you have at home — capture item details and track quantities.</p>
          </div>
          <div className="sp-step">
            <h3>Get alerts</h3>
            <p>Receive expiry reminders before food goes bad, so you stay on top of what needs to be used first.</p>
          </div>
          <div className="sp-step">
            <h3>Donate or plan</h3>
            <p>Donate surplus or plan meals around it to reduce waste with smart next actions.</p>
          </div>
        </div>
      </section>

      <section className="sp-section" id="about">
        <div className="sp-about">
          <div className="sp-about-text">
            <div className="sp-freshness-bar"><span></span><span></span><span></span></div>
            <h2>About SmartPantry</h2>
            <p>
              Our mission is to help households reduce food waste by making inventory
              tracking, expiry awareness, donation, and meal planning effortless —
              one pantry at a time.
            </p>
          </div>
          <div className="sp-about-visual">
            <PantryIllustration />
          </div>
        </div>
      </section>

      <section className="sp-section" id="contact">
        <div className="sp-contact">
          <div className="sp-contact-copy">
            <div className="sp-freshness-bar"><span></span><span></span><span></span></div>
            <h2>Contact us</h2>
            <p>Have questions? We'd love to hear from you.</p>
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="sp-form-field">
              <label htmlFor="name">Name</label>
              <input id="name" type="text" placeholder="Your name" />
            </div>
            <div className="sp-form-field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="sp-form-field">
              <label htmlFor="message">Message</label>
              <textarea id="message" placeholder="How can we help?" />
            </div>
            <button type="submit" className="sp-btn sp-btn-primary">Send Message</button>
          </form>
        </div>
      </section>

      <footer className="sp-footer">
        <span>© 2026 SmartPantry. All rights reserved.</span>
        <ul className="sp-footer-links">
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Terms</a></li>
        </ul>
      </footer>
    </div>
  );
}