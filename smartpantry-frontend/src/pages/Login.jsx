import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [use2fa, setUse2fa] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="sp-login">
      <nav className="sp-nav">
        <Link to="/" className="sp-nav-brand">
          <svg className="sp-nav-logo" viewBox="0 0 34 34" fill="none">
            <rect width="34" height="34" rx="8" fill="#2d6a4f" />
            <path d="M10 22V14a7 7 0 0 1 14 0v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 22h18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
          SmartPantry
        </Link>
        <ul className="sp-nav-links">
          <li><Link to="/">Home</Link></li>
          <li><a href="/#about">About</a></li>
          <li><a href="/#how-it-works">How It Works</a></li>
          <li><a href="/#contact">Contact</a></li>
        </ul>
      </nav>

      <div className="sp-login-body">
        <div className="sp-login-intro">
          <div className="sp-freshness-bar"><span></span><span></span><span></span></div>
          <h1>Welcome back</h1>
          <p>Log in to check what's expiring, browse donations, and keep your meal plan on track.</p>
        </div>

        <div className="sp-login-card">
          <form onSubmit={handleSubmit}>
            <div className="sp-form-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="sp-form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="sp-2fa-toggle">
              <span>
                Enable 2FA
                <small>Get a code by email each time you log in</small>
              </span>
              <button
                type="button"
                className={`sp-switch ${use2fa ? 'on' : ''}`}
                aria-pressed={use2fa}
                aria-label="Enable two-factor authentication"
                onClick={() => setUse2fa(!use2fa)}
              />
            </div>

            {error && <p style={{ color: '#b5543a', fontSize: '14px', marginTop: '-8px', marginBottom: '16px' }}>{error}</p>}

            <div className="sp-login-actions">
              <Link to="/register" className="sp-btn sp-btn-secondary">Don't have an account? Sign Up</Link>
              <button type="submit" className="sp-btn sp-btn-primary">Login</button>
            </div>
          </form>
        </div>
      </div>

      <footer className="sp-footer">
        <span>© SmartPantry</span>
        <ul className="sp-footer-links">
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Terms</a></li>
        </ul>
      </footer>
    </div>
  );
}