import { useState, useEffect } from 'react'
import API from '../services/api'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications/')
      setNotifications(res.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load notifications')
      setLoading(false)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/mark_read/`)
      fetchNotifications()
    } catch (err) {
      setError('Failed to mark as read')
    }
  }

  if (loading) return <p>Loading notifications...</p>

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Notifications</h2>
      </div>
      {error && <p className="error">{error}</p>}
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        notifications.map(notification => (
          <div key={notification.id}
            className={`notification-item ${!notification.is_read ? 'unread' : ''}`}>
            <div className="notification-content">
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
            </div>
            {!notification.is_read && (
              <button onClick={() => handleMarkRead(notification.id)}
                className="btn-read">
                Mark read
              </button>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default Notifications