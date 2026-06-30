import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <h1>Welcome to SmartPantry!</h1>
      <p>Hello, {user?.full_name}!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Dashboard