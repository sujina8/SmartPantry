import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
  )
}

export default Register