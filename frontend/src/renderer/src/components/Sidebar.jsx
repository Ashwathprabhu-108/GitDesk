import './Sidebar.css'

export default function Sidebar({ user, activeView, onNavigate, onLogout }) {
  const navItems = [
    {
      id: 'repos',
      label: 'Repositories',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
    {
      id: 'create',
      label: 'Create Repo',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      )
    },
    {
      id: 'push',
      label: 'Push Project',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"/>
          <polyline points="5 12 12 5 19 12"/>
        </svg>
      )
    }
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="#1A1D21"/>
            <path d="M16 20L24 14L32 20V28L24 34L16 28V20Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M24 14V34" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="sidebar-brand">GitDesk</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`sidebar-nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span className="sidebar-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="sidebar-avatar"
              width="28"
              height="28"
            />
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.name || user.login}</span>
              <span className="sidebar-user-handle">@{user.login}</span>
            </div>
            <button
              id="logout-button"
              className="btn btn-ghost btn-icon sidebar-logout"
              onClick={onLogout}
              title="Sign out"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
