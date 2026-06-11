import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useState,useEffect } from "react"
import NotificationBell from "../components/NotificationBell"

const NAV = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "My Tasks",
    path: "/tasks",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M9 11.5l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="3" width="18" height="18" rx="3" />
      </svg>
    ),
  },
{
    label: "Team",
    path: "/team",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <circle cx="9" cy="7" r="3" />
        <path d="M3 21v-1a6 6 0 0112 0v1" strokeLinecap="round" />
        <circle cx="18" cy="8" r="2.5" />
        <path d="M21 21v-1a4.5 4.5 0 00-3-4.24" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Activity",
    path: "/activity",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="9"/>
      </svg>
    ),
  },
]

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --white: #ffffff;
    --bg: #f9fafb;
    --sidebar-bg: #ffffff;
    --border: #e5e7eb;
    --border-light: #f3f4f6;
    --text-primary: #0f172a;
    --text-secondary: #64748b;
    --text-muted: #94a3b8;
    --accent: #2563eb;
    --accent-light: #eff6ff;
    --accent-hover: #1d4ed8;
    --accent-mid: #bfdbfe;
    --danger: #ef4444;
    --radius: 10px;
    --sidebar-width: 240px;
    --font: 'Geist', 'DM Sans', system-ui, sans-serif;
  }

  body { font-family: var(--font); background: var(--bg); }

  .layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
    background: var(--bg);
  }

  /* ── Sidebar ── */
  .sidebar {
    width: var(--sidebar-width);
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 0;
    flex-shrink: 0;
  }

  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 22px 20px 20px;
    border-bottom: 1px solid var(--border-light);
  }

  .brand-dot {
    width: 28px;
    height: 28px;
    background: var(--accent);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brand-dot span {
    color: white;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.5px;
  }

  .brand-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.3px;
  }

  .sidebar-section {
    padding: 20px 12px 8px;
    flex: 1;
  }

  .sidebar-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    padding: 0 8px;
    margin-bottom: 6px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 450;
    color: var(--text-secondary);
    cursor: pointer;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
    transition: background 0.12s, color 0.12s;
    margin-bottom: 1px;
  }

  .nav-item:hover {
    background: var(--bg);
    color: var(--text-primary);
  }

  .nav-item.active {
    background: var(--accent-light);
    color: var(--accent);
    font-weight: 500;
  }

  .nav-item.active svg {
    stroke: var(--accent);
  }

  .nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    flex-shrink: 0;
    opacity: 0.7;
  }

  .nav-item.active .nav-icon {
    opacity: 1;
  }

  .sidebar-footer {
    padding: 16px 12px;
    border-top: 1px solid var(--border-light);
  }

  .user-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.12s;
  }

  .user-row:hover { background: var(--bg); }

  .avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    letter-spacing: 0.3px;
  }

  .user-info { flex: 1; min-width: 0; }
  .user-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
  .user-role { font-size: 11px; color: var(--text-muted); margin-top: 1px; }

  .logout-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 5px;
    transition: color 0.12s;
  }
  .logout-btn:hover { color: var(--danger); }

  /* ── Main ── */
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .topbar {
    height: 56px;
    background: var(--white);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    flex-shrink: 0;
  }

  .topbar-left {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .breadcrumb-sep { color: var(--border); font-size: 16px; }
  .breadcrumb-root { font-size: 13px; color: var(--text-muted); font-weight: 400; }
  .breadcrumb-current { font-size: 13px; color: var(--text-primary); font-weight: 500; }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .topbar-icon-btn {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    transition: background 0.12s, border-color 0.12s;
  }
  .topbar-icon-btn:hover { background: var(--bg); border-color: var(--accent-mid); color: var(--accent); }

  .new-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 14px;
    height: 34px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.12s;
    font-family: var(--font);
  }
  .new-btn:hover { background: var(--accent-hover); }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: 32px 32px;
  }

  .content::-webkit-scrollbar { width: 4px; }
  .content::-webkit-scrollbar-track { background: transparent; }
  .content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
`

export default function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [userName, setUserName] = useState("User")
  const [userInitial, setUserInitial] = useState("U")

useEffect(() => {
  const token = localStorage.getItem("token")
  if (!token) return

  fetch(`https://flowtask-ai-powered-real-time.onrender.com/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      console.log("Profile data:", data)
      const name = data.user?.name || data.user?.email || "User"
      setUserName(name)
      setUserInitial(name[0].toUpperCase())
    })
    .catch(err => console.log(err))
}, [])

  const handleLogout = () => {
  localStorage.removeItem("token")

  window.dispatchEvent(
    new CustomEvent("auth_change", {
      detail: "token_removed",
    })
  )

  navigate("/")
}

  const currentPage = NAV.find(n => location.pathname.startsWith(n.path))?.label || "Dashboard"

  return (
    <>
      <style>{styles}</style>
      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-dot"><span>F</span></div>
            <span className="brand-name">Flowtask</span>
          </div>

          <div className="sidebar-section">
            <p className="sidebar-label">Workspace</p>
            {NAV.map(item => (
              <button
                key={item.path}
                className={`nav-item${location.pathname.startsWith(item.path) ? " active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="sidebar-footer">
  <div className="user-row">
    <div className="avatar">{userInitial}</div>
    <div className="user-info">
      <div className="user-name">{userName}</div>
      <div className="user-role">Member</div>
    </div>
    <button className="logout-btn" onClick={handleLogout} title="Log out">
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M17 16l4-4m0 0l-4-4m4 4H7" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 12a9 9 0 0014.7 6.9" strokeLinecap="round"/>
      </svg>
    </button>
  </div>
</div>
        </aside>

        {/* Main */}
        <div className="main">
          <header className="topbar">
            <div className="topbar-left">
              <span className="breadcrumb-root">Flowtask</span>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">{currentPage}</span>
                </div>
                <div className="topbar-right">
  <NotificationBell />
</div>
          </header>

          <main className="content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
