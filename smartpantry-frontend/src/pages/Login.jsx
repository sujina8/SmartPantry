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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();

  // Two-step flow: 'credentials' -> (if 2FA enabled) 'otp' -> logged in
  const [step, setStep] = useState('credentials');
  const [otp, setOtp] = useState('');
  const [otpEmail, setOtpEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login(email, password);
      if (result?.requires2fa) {
        setOtpEmail(result.email);
        setStep('otp');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await verifyOtp(otpEmail, otp);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid or expired code. Please try logging in again.');
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
          <h1>{step === 'otp' ? 'Check your email' : 'Welcome back'}</h1>
          <p>
            {step === 'otp'
              ? `We sent a 6-digit code to ${otpEmail}. Enter it below to finish logging in.`
              : "Log in to check what's expiring, browse donations, and keep your meal plan on track."}
          </p>
        </div>

        <div className="sp-login-card">
          {step === 'credentials' ? (
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
                <div className="sp-password-wrap">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
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

              {error && <p style={{ color: '#b5543a', fontSize: '14px', marginTop: '-8px', marginBottom: '16px' }}>{error}</p>}

              <div className="sp-login-actions">
                <Link to="/register" className="sp-btn sp-btn-secondary">Don't have an account? Sign Up</Link>
                <button type="submit" className="sp-btn sp-btn-primary">Login</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="sp-form-field">
                <label htmlFor="otp">6-digit code</label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  autoFocus
                  required
                />
              </div>

              {error && <p style={{ color: '#b5543a', fontSize: '14px', marginTop: '-8px', marginBottom: '16px' }}>{error}</p>}

              <div className="sp-login-actions">
                <button type="button" className="sp-btn sp-btn-secondary" onClick={() => setStep('credentials')}>Back</button>
                <button type="submit" className="sp-btn sp-btn-primary">Verify & Login</button>
              </div>
            </form>
          )}
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