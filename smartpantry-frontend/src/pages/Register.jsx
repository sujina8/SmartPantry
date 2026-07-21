import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function EyeIcon({ visible }) {
  return visible ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [householdSize, setHouseholdSize] = useState('');
  const [enable2fa, setEnable2fa] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await register({
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword,
        household_size: householdSize || null,
        is_2fa_enabled: enable2fa,
      });
      navigate('/login');
    } catch (err) {
      setError('Could not create your account. Please check your details and try again.');
    }
  };

  return (
    <div className="sp-register">
      <nav className="sp-nav">
        <Link to="/" className="sp-nav-brand">
          <img src="/logo.png" alt="SmartPantry logo" className="sp-nav-logo" />
          SmartPantry
        </Link>
        <ul className="sp-nav-links">
          <li><Link to="/">Home</Link></li>
          <li><a href="/#about">About</a></li>
          <li><a href="/#how-it-works">How It Works</a></li>
          <li><a href="/#contact">Contact</a></li>
        </ul>
      </nav>

      <div className="sp-register-body">
        <div className="sp-register-intro">
          <div className="sp-freshness-bar"><span></span><span></span><span></span></div>
          <h1>Create your account</h1>
          <p>Sign up takes less than a minute.</p>
        </div>

        <div className="sp-register-card">
          <form onSubmit={handleSubmit}>
            {error && <p className="sp-register-error">{error}</p>}

            <div className="sp-form-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="sp-form-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="sp-form-field">
              <label htmlFor="password">Password</label>
              <div className="sp-password-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="sp-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            <div className="sp-form-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="sp-password-wrap">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="sp-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon visible={showConfirmPassword} />
                </button>
              </div>
            </div>

            <div className="sp-form-field">
              <label htmlFor="householdSize">Household Size (optional)</label>
              <input
                id="householdSize"
                type="number"
                min="1"
                value={householdSize}
                onChange={(e) => setHouseholdSize(e.target.value)}
              />
              <small>Helps us tailor meal plan suggestions later.</small>
            </div>

            <div className="sp-2fa-toggle">
              <span>
                Enable 2FA
                <small>Get a code by email each time you log in</small>
              </span>
              <button
                type="button"
                className={`sp-switch ${enable2fa ? 'on' : ''}`}
                aria-pressed={enable2fa}
                aria-label="Enable two-factor authentication"
                onClick={() => setEnable2fa(!enable2fa)}
              />
            </div>

            <div className="sp-register-actions">
              <Link to="/login" className="sp-btn sp-btn-secondary">Already have an account? Login</Link>
              <button type="submit" className="sp-btn sp-btn-primary">Register</button>
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