import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to SmartPantry</h1>
      <p>Reduce food waste, save money, help your community.</p>
      <div className="home-buttons">
        <Link to="/login" className="btn-primary">Login</Link>
        <Link to="/register" className="btn-secondary">Sign Up</Link>
      </div>
    </div>
  )
}

export default Home