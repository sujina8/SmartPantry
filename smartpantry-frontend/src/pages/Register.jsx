import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [householdSize, setHouseholdSize] = useState('');
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
        household_size: householdSize || null,
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
          <svg className="sp-nav-logo" viewBox="0 0 34 34" fill="none">
            <rect width="34" height="34" rx="9" fill="#2d6a4f" />
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
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="sp-form-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
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