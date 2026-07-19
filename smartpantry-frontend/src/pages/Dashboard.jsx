import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import API from '../services/api'

function isExpiringSoon(item) {
  const today = new Date().toISOString().split('T')[0]
  const soon = new Date()
  soon.setDate(soon.getDate() + 3)
  const soonStr = soon.toISOString().split('T')[0]
  return item.expiry_date >= today && item.expiry_date <= soonStr
}

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [inventory, setInventory] = useState([])
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    Promise.all([
      API.get('/inventory/').catch(() => ({ data: [] })),
      API.get('/donations/').catch(() => ({ data: [] })),
    ])
      .then(([invRes, donRes]) => {
        setInventory(invRes.data)
        setDonations(donRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const expiringItems = inventory.filter(isExpiringSoon)
  const activeDonations = donations.filter((d) => d.status !== 'claimed')

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

      <div className="sp-dashboard">
        <div className="sp-page-head">
          <div className="sp-freshness-bar" style={{ margin: '0 auto 20px' }}><span></span><span></span><span></span></div>
          <h1>Welcome back, {user?.full_name || 'there'}!</h1>
        </div>

        {loading ? (
          <p>Loading your dashboard...</p>
        ) : (
          <>
            <section className="sp-dash-section">
              <h2 className="sp-dash-heading">Today at a glance</h2>
              <div className="sp-stat-cards">
                <div className="sp-stat-card">
                  <p className="sp-stat-label">Items Expiring Soon</p>
                  <p className="sp-stat-value">{expiringItems.length}</p>
                </div>
                <div className="sp-stat-card">
                  <p className="sp-stat-label">Active Donations</p>
                  <p className="sp-stat-value">{activeDonations.length}</p>
                </div>
                <div className="sp-stat-card">
                  <p className="sp-stat-label">Total Items Tracked</p>
                  <p className="sp-stat-value">{inventory.length}</p>
                </div>
              </div>
            </section>

            <div className="sp-dash-panels">
              <section className="sp-dash-panel">
                <h2 className="sp-dash-heading">Items expiring soon</h2>
                {expiringItems.length === 0 ? (
                  <p className="sp-dash-empty">Nothing expiring in the next few days.</p>
                ) : (
                  <ul className="sp-dash-list">
                    {expiringItems.slice(0, 5).map((item) => (
                      <li key={item.id} className="sp-dash-list-row">
                        <div>
                          <p className="sp-dash-item-name">{item.name}</p>
                          <p className="sp-dash-item-sub">Expires {item.expiry_date}</p>
                        </div>
                        <span className="sp-badge sp-badge-amber">Soon</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/inventory" className="sp-btn sp-btn-secondary sp-dash-link">View inventory</Link>
              </section>

              <section className="sp-dash-panel">
                <h2 className="sp-dash-heading">Recent donations</h2>
                {donations.length === 0 ? (
                  <p className="sp-dash-empty">No donations yet.</p>
                ) : (
                  <ul className="sp-dash-list">
                    {donations.slice(0, 5).map((d) => (
                      <li key={d.id} className="sp-dash-list-row">
                        <div>
                          <p className="sp-dash-item-name">{d.food_item?.name || d.name}</p>
                          <p className="sp-dash-item-sub">{d.status === 'claimed' ? 'Claimed' : 'Available'}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/donations" className="sp-btn sp-btn-secondary sp-dash-link">View donations</Link>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard