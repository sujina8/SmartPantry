import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div>
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
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/inventory">Inventory</Link></li>
          <li><Link to="/donations">Donations</Link></li>
          <li><Link to="/notifications">Notifications</Link></li>
        </ul>
        <div className="sp-nav-actions">
          <button onClick={handleLogout} className="sp-btn sp-btn-secondary">Logout</button>
        </div>
      </nav>
      <h1>Welcome to SmartPantry!</h1>
      <p>Hello, {user?.full_name}!</p>
    </div>
  )
}

export default Dashboard