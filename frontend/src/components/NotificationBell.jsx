// components/NotificationBell.jsx

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useWebSocket } from "../context/WebSocketContext"

const styles = `
  .bell-wrap { position: relative; }

  /* ── Trigger button ── */
  .bell-btn {
    width: 34px; height: 34px; border-radius: 8px;
    border: 1px solid #e5e7eb; background: transparent;
    cursor: pointer; display: flex; align-items: center;
    justify-content: center; color: #64748b;
    transition: background .12s, border-color .12s, color .12s;
    position: relative;
  }
  .bell-btn:hover {
    background: #f9fafb;
    border-color: #bfdbfe;
    color: #2563eb;
  }
  .bell-btn.has-unread { color: #2563eb; border-color: #bfdbfe; }

  /* Badge */
  .bell-badge {
    position: absolute; top: -5px; right: -5px;
    min-width: 17px; height: 17px; padding: 0 4px;
    background: #ef4444; color: white;
    border-radius: 99px; border: 2px solid white;
    font-size: 9.5px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Geist', system-ui, sans-serif;
    animation: popIn .2s cubic-bezier(.34,1.56,.64,1) both;
  }
  @keyframes popIn {
    from { transform: scale(0); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }

  /* ── Dropdown panel ── */
  .notif-panel {
    position: absolute; top: calc(100% + 10px); right: 0;
    width: 340px; background: #ffffff;
    border: 1px solid #e5e7eb; border-radius: 14px;
    box-shadow: 0 16px 48px rgba(15,23,42,.14);
    z-index: 200;
    animation: dropDown .15s ease both;
    overflow: hidden;
  }
  @keyframes dropDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .notif-header {
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 14px 16px 12px;
    border-bottom: 1px solid #f3f4f6;
  }
  .notif-header-left { display: flex; align-items: center; gap: 8px; }
  .notif-title {
    font-size: 13.5px; font-weight: 600;
    color: #0f172a; letter-spacing: -0.2px;
    font-family: 'Geist', system-ui, sans-serif;
  }
  .notif-unread-pill {
    font-size: 10.5px; font-weight: 600;
    padding: 2px 8px; border-radius: 20px;
    background: #eff6ff; color: #2563eb;
  }
  .mark-all-btn {
    font-size: 12px; font-weight: 500;
    color: #2563eb; background: transparent;
    border: none; cursor: pointer; padding: 4px 6px;
    border-radius: 6px; font-family: 'Geist', system-ui, sans-serif;
    transition: background .12s;
  }
  .mark-all-btn:hover { background: #eff6ff; }

  /* ── List ── */
  .notif-list {
    max-height: 360px; overflow-y: auto;
  }
  .notif-list::-webkit-scrollbar { width: 3px; }
  .notif-list::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

  .notif-item {
    display: flex; align-items: flex-start; gap: 11px;
    padding: 12px 16px; cursor: pointer;
    border-bottom: 1px solid #f9fafb;
    transition: background .1s;
    position: relative;
  }
  .notif-item:last-child { border-bottom: none; }
  .notif-item:hover { background: #f9fafb; }
  .notif-item.unread { background: #f8fbff; }
  .notif-item.unread:hover { background: #eff6ff; }

  .notif-dot-wrap {
    padding-top: 3px; flex-shrink: 0;
  }
  .notif-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #2563eb;
  }
  .notif-dot.read { background: transparent; border: 1.5px solid #e5e7eb; }

  .notif-body { flex: 1; min-width: 0; }
  .notif-msg {
    font-size: 12.5px; line-height: 1.5;
    color: #0f172a; font-weight: 450;
    font-family: 'Geist', system-ui, sans-serif;
  }
  .notif-item.unread .notif-msg { font-weight: 500; }
  .notif-time {
    font-size: 11px; color: #94a3b8; margin-top: 3px;
    font-family: 'Geist', system-ui, sans-serif;
  }

  /* ── Empty state ── */
  .notif-empty {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 40px 20px; text-align: center;
  }
  .notif-empty-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: #eff6ff; color: #2563eb;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 10px;
  }
  .notif-empty-title {
    font-size: 13px; font-weight: 600; color: #0f172a;
    font-family: 'Geist', system-ui, sans-serif; margin-bottom: 4px;
  }
  .notif-empty-desc {
    font-size: 12px; color: #94a3b8;
    font-family: 'Geist', system-ui, sans-serif; line-height: 1.5;
  }

  /* ── Connected dot ── */
  .ws-dot {
    width: 6px; height: 6px; border-radius: 50%;
    display: inline-block; margin-left: 4px;
    vertical-align: middle;
  }
  .ws-dot.online  { background: #10b981; }
  .ws-dot.offline { background: #94a3b8; }
`

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60)  return "just now"
  const m = Math.floor(s / 60)
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function NotificationBell() {
  const { notifications, unreadCount, connected, markOneRead, markAllRead } = useWebSocket()
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const navigate = useNavigate()

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleItemClick = async (notif) => {
    if (!notif.is_read) await markOneRead(notif.id)
    if (notif.link) navigate(notif.link)
    setOpen(false)
  }

  return (
    <>
      <style>{styles}</style>
      <div className="bell-wrap" ref={panelRef}>

        {/* Bell trigger */}
        <button
          className={`bell-btn${unreadCount > 0 ? " has-unread" : ""}`}
          onClick={() => setOpen(o => !o)}
          title="Notifications"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round"/>
          </svg>
          {unreadCount > 0 && (
            <span className="bell-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="notif-panel">
            <div className="notif-header">
              <div className="notif-header-left">
                <span className="notif-title">Notifications</span>
                {unreadCount > 0 && (
                  <span className="notif-unread-pill">{unreadCount} new</span>
                )}
                <span className={`ws-dot ${connected ? "online" : "offline"}`} title={connected ? "Live" : "Reconnecting…"} />
              </div>
              {unreadCount > 0 && (
                <button className="mark-all-btn" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
            </div>

            <div className="notif-list">
              {notifications.length === 0 ? (
                <div className="notif-empty">
                  <div className="notif-empty-icon">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="notif-empty-title">All caught up</p>
                  <p className="notif-empty-desc">You have no notifications yet. They'll show up here.</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`notif-item${notif.is_read ? "" : " unread"}`}
                    onClick={() => handleItemClick(notif)}
                  >
                    <div className="notif-dot-wrap">
                      <div className={`notif-dot${notif.is_read ? " read" : ""}`} />
                    </div>
                    <div className="notif-body">
                      <p className="notif-msg">{notif.message}</p>
                      <p className="notif-time">{timeAgo(notif.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
