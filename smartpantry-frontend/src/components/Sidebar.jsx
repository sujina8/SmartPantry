import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', key: 'dashboard' },
  { to: '/inventory', label: 'My Inventory', key: 'inventory' },
  { to: '/donations', label: 'Donations', key: 'donations' },
  { to: '/notifications', label: 'Notifications', key: 'notifications' },
  { to: '/settings', label: 'Settings', key: 'settings' }, // <-- Add this
];

export default function Sidebar({ active }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sp-sidebar">
      <div className="sp-sidebar-links">
        {LINKS.map((link) => (
          <Link
            key={link.key}
            to={link.to}
            className={`sp-sidebar-link ${active === link.key ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="sp-sidebar-footer">
        <div className="sp-sidebar-user">
          <div className="sp-sidebar-avatar">{(user?.name || user?.email || '?').charAt(0).toUpperCase()}</div>
          <span className="sp-sidebar-email">{user?.name || user?.email}</span>
        </div>
        <button className="sp-sidebar-logout" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}