import { Link } from 'react-router-dom';
import pantryPhoto from '../assets/1.jpg';
function FeatureIcon({ path }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#6f8f7f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  );
}

// Flat, single-color abstract shape — deliberately not a gradient,
// sits behind the hero text to add quiet depth without illustration clutter.
function HeroBlob() {
  return (
    <svg className="sp-hero-blob" width="640" height="420" viewBox="0 0 640 420" fill="none">
      <path
        d="M420 40C500 70 560 140 555 220C550 300 480 360 400 385C320 410 220 405 150 355C80 305 40 210 70 140C100 70 190 30 270 15C350 0 340 10 420 40Z"
        fill="#eef2ec"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="sp-home">
      <nav className="sp-nav">
        <Link to="/" className="sp-nav-brand">
          <svg className="sp-nav-logo" viewBox="0 0 34 34" fill="none">
            <rect width="34" height="34" rx="9" fill="#2d6a4f" />
            <path d="M10 22V14a7 7 0 0 1 14 0v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 22h18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
          SmartPantry
        </Link>
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
        <HeroBlob />
        <div className="sp-hero-content">
          <h1 className="sp-fade-1">
            Reduce food waste,<br /><em>save</em> more
          </h1>
          <p className="sp-hero-sub sp-fade-2">
            Track what's in your pantry, catch expiry dates before they catch you,
            and turn what you won't use into something that helps someone else.
          </p>
          <div className="sp-hero-quote sp-fade-3">
            <p>A well-kept pantry is a quiet kind of care — for your food, your time, and the people you feed.</p>
            <span>SmartPantry</span>
          </div>
          <div className="sp-hero-actions sp-fade-4">
            <Link to="/register" className="sp-btn sp-btn-primary">Get Started</Link>
            <a href="#how-it-works" className="sp-btn sp-btn-secondary">Learn More</a>
          </div>
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
            <span className="sp-step-num">01</span>
            <h3>Add your food</h3>
            <p>Start by listing what you have at home — capture item details and track quantities.</p>
          </div>
          <div className="sp-step">
            <span className="sp-step-num">02</span>
            <h3>Get alerts</h3>
            <p>Receive expiry reminders before food goes bad, so you stay on top of what needs to be used first.</p>
          </div>
          <div className="sp-step">
            <span className="sp-step-num">03</span>
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
            <img src={pantryPhoto} alt="A stocked home pantry" className="sp-about-photo" />
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