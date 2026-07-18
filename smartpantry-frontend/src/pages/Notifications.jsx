import { useState, useEffect } from 'react'
import API from '../services/api'
import useWebSocket from '../hooks/useWebSocket'
import Sidebar from '../components/Sidebar'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { lastMessage, isConnected } = useWebSocket('ws/notifications/')

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    if (!lastMessage) return
    setNotifications((prev) => {
      const alreadyExists = prev.some((n) => n.id === lastMessage.id)
      if (alreadyExists) return prev
      return [lastMessage, ...prev]
    })
  }, [lastMessage])

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications/')
      setNotifications(res.data)
    } catch {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/mark_read/`)
      fetchNotifications()
    } catch {
      setError('Failed to mark as read')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await Promise.all(
        notifications.filter((n) => !n.is_read).map((n) => API.patch(`/notifications/${n.id}/mark_read/`))
      )
      fetchNotifications()
    } catch {
      setError('Failed to mark all as read')
    }
  }

  const timeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
    const days = Math.floor(hours / 24)
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  if (loading) return <p style={{ padding: 48 }}>Loading notifications...</p>

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="sp-donations">
      <div className="sp-app-layout">
        <Sidebar active="notifications" />

        <main className="sp-donations-main">
          <div className="sp-page-head">
            <div className="sp-freshness-bar" style={{ margin: '0 auto 20px' }}><span></span><span></span><span></span></div>
            <div className="sp-notif-title-row">
              <h1>Notifications</h1>
              <span className={`ws-status ${isConnected ? 'ws-connected' : 'ws-disconnected'}`}>
                {isConnected ? 'Live' : 'Reconnecting...'}
              </span>
            </div>
            <p>Stay updated on what's happening in your pantry.</p>
            {unreadCount > 0 && (
              <button className="sp-btn sp-btn-primary" style={{ marginTop: 16 }} onClick={handleMarkAllRead}>
                Mark All as Read
              </button>
            )}
          </div>

          {error && <p className="error">{error}</p>}

          {notifications.length === 0 ? (
            <p className="sp-dash-empty">No notifications yet.</p>
          ) : (
            <div className="sp-notif-feed">
              {notifications.map((n) => (
                <div key={n.id} className={`sp-notif-row ${!n.is_read ? 'unread' : ''}`}>
                  <div className="sp-notif-dot" />
                  <div className="sp-notif-content">
                    <p className="sp-notif-title">{n.title}</p>
                    <p className="sp-notif-message">{n.message}</p>
                  </div>
                  <div className="sp-notif-meta">
                    <span className="sp-notif-time">{timeAgo(n.created_at)}</span>
                    {!n.is_read && (
                      <button className="sp-icon-btn" onClick={() => handleMarkRead(n.id)}>Mark read</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Notifications