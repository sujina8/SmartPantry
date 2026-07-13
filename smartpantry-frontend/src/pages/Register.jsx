import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../services/api'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone_number: '',
    household_size: 1,
    password: '',
    confirm_password: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match')
      return
    }
    try {
      await API.post('/auth/register/', formData)
      setSuccess('Registration successful! Please login.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError('Registration failed. Please try again.')
    }
  }

  return (
    <div className="sp-auth-page">
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
        <div className="sp-nav-actions">
          <Link to="/login" className="sp-btn sp-btn-secondary">Login</Link>
          <Link to="/register" className="sp-btn sp-btn-primary">Sign Up</Link>
        </div>
      </nav>
      <div className="auth-container">
        <h2>Create Account</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" name="full_name" placeholder="Full Name" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="text" name="phone_number" placeholder="Phone Number" onChange={handleChange} />
          <input type="number" name="household_size" placeholder="Household Size" onChange={handleChange} min="1" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <input type="password" name="confirm_password" placeholder="Confirm Password" onChange={handleChange} required />
          <button type="submit">Register</button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}

export default Register