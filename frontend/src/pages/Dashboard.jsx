import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getWorkspaces, createWorkspace,deleteWorkspace,getTaskCount,getWorkspaceMembers} from "../services/workspaceService"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

  :root {
    --white: #ffffff;
    --bg: #f9fafb;
    --border: #e5e7eb;
    --border-light: #f3f4f6;
    --text-primary: #0f172a;
    --text-secondary: #64748b;
    --text-muted: #94a3b8;
    --accent: #2563eb;
    --accent-light: #eff6ff;
    --accent-hover: #1d4ed8;
    --accent-mid: #bfdbfe;
    --radius: 12px;
    --font: 'Geist', 'DM Sans', system-ui, sans-serif;
  }

  .db-wrap { font-family: var(--font); }

  /* ── Page header ── */
  .db-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 28px;
  }

  .db-title {
    font-size: 22px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.5px;
    line-height: 1;
  }

  .db-subtitle {
    font-size: 13.5px;
    color: var(--text-muted);
    margin-top: 5px;
    font-weight: 400;
  }

  /* ── Create form ── */
  .create-form {
    display: flex;
    align-items: center;
    gap: 0;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    width: 320px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .create-form:focus-within {
    border-color: var(--accent-mid);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }

  .create-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 10px 14px;
    font-size: 13.5px;
    font-family: var(--font);
    color: var(--text-primary);
    background: transparent;
  }

  .create-input::placeholder { color: var(--text-muted); }

  .create-submit {
    height: 38px;
    padding: 0 16px;
    background: var(--accent);
    color: white;
    border: none;
    font-size: 13px;
    font-weight: 500;
    font-family: var(--font);
    cursor: pointer;
    transition: background 0.12s;
    white-space: nowrap;
  }

  .create-submit:hover { background: var(--accent-hover); }

  /* ── Stats row ── */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    margin-bottom: 28px;
  }

  .stat-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .stat-icon {
    width: 38px;
    height: 38px;
    border-radius: 9px;
    background: var(--accent-light);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--accent);
  }

  .stat-label {
    font-size: 11.5px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    margin-bottom: 3px;
  }

  .stat-value {
    font-size: 22px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1;
    letter-spacing: -0.5px;
  }

  /* ── Section heading ── */
  .section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.1px;
  }

  .section-count {
    font-size: 12px;
    color: var(--text-muted);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2px 10px;
  }

  /* ── Workspace grid ── */
  .ws-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .ws-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
    position: relative;
    overflow: hidden;
  }

  .ws-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: var(--accent);
    opacity: 0;
    transition: opacity 0.15s;
  }

  .ws-card:hover {
    border-color: var(--accent-mid);
    box-shadow: 0 4px 20px rgba(37, 99, 235, 0.08);
    transform: translateY(-1px);
  }

  .ws-card:hover::before { opacity: 1; }

  .ws-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .ws-mono {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: var(--accent-light);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: -0.3px;
    flex-shrink: 0;
  }

  .ws-arrow {
    color: var(--text-muted);
    transition: color 0.12s, transform 0.12s;
  }

  .ws-card:hover .ws-arrow {
    color: var(--accent);
    transform: translate(2px, -2px);
  }

  .ws-name {
    font-size: 14.5px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.2px;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ws-meta {
    font-size: 12px;
    color: var(--text-muted);
  }

  .ws-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--border-light);
  }

  .ws-pill {
    font-size: 11px;
    font-weight: 500;
    padding: 3px 9px;
    border-radius: 20px;
    background: var(--accent-light);
    color: var(--accent);
    letter-spacing: 0.02em;
  }

  .ws-members {
    display: flex;
  }

  .ws-member-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--white);
    margin-left: -5px;
    font-size: 9px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  /* ── Empty state ── */
  .empty-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }

  .empty-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--accent-light);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
    color: var(--accent);
  }

  .empty-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 6px;
  }

  .empty-desc {
    font-size: 13px;
    color: var(--text-muted);
    max-width: 240px;
    line-height: 1.6;
  }

  /* ── Fade-in animation ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .ws-card { animation: fadeUp 0.25s ease both; }
  ${[0,1,2,3,4,5].map(i => `.ws-card:nth-child(${i+1}) { animation-delay: ${i * 0.04}s; }`).join('\n')}
`

const AVATAR_COLORS = ["#2563eb","#7c3aed","#059669","#d97706","#dc2626","#0891b2"]

function getInitials(name) {
  return name
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState([])
  const [name, setName] = useState("")
  const navigate = useNavigate()
  const [taskCount, setTaskCount] =
    useState(0)
  const [workspaceMembers, setWorkspaceMembers] =
  useState({})
  const fetchWorkspaceMembers = async(
  workspaceId
) => {

  try {

    const data =
      await getWorkspaceMembers(
        workspaceId
      )

    setWorkspaceMembers(prev => ({
      ...prev,
      [workspaceId]: data.members
    }))

  } catch(error) {

    console.log(error)

  }
}
    const fetchTaskCount = async() => {

    try {

        const data =
            await getTaskCount()

        setTaskCount(data.count)

    } catch(error) {

        console.log(error)
    }
}

  const fetchWorkspaces = async () => {
    try {
      const data = await getWorkspaces()

setWorkspaces(data.workspaces)

for (const workspace of data.workspaces) {

  fetchWorkspaceMembers(
    workspace.id
  )

}
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchWorkspaces()
    fetchTaskCount()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await createWorkspace({ name })
      setName("")
      fetchWorkspaces()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="db-wrap">
      <style>{styles}</style>

      {/* Header */}
      <div className="db-header">
        <div>
          <h1 className="db-title">Workspaces</h1>
          <p className="db-subtitle">Select a workspace to view its boards and tasks.</p>
        </div>
        <form className="create-form" onSubmit={handleCreate}>
          <input
            className="create-input"
            type="text"
            placeholder="New workspace name…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="create-submit" type="submit">Create</button>
        </form>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5"/>
            </svg>
          </div>
          <div>
            <div className="stat-label">Workspaces</div>
            <div className="stat-value">{workspaces.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M9 11.5l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="3" width="18" height="18" rx="3"/>
            </svg>
          </div>
          <div>
            <div className="stat-label">Active Tasks</div>
            <div className="stat-value">{taskCount}</div>
          </div>
        </div>

      </div>

      {/* Workspace grid */}
      <div className="section-heading">
        <span className="section-title">All Workspaces</span>
        <span className="section-count">{workspaces.length} total</span>
      </div>

      <div className="ws-grid">
        {workspaces.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                <path d="M14 17h6M17 14v6" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="empty-title">No workspaces yet</p>
            <p className="empty-desc">Create your first workspace to start organizing tasks and boards.</p>
          </div>
        ) : (
          workspaces.map((ws, i) => (
            <div
              key={ws.id}
              className="ws-card"
              onClick={() => navigate(`/workspace/${ws.id}`)}
            >
              <div className="ws-card-top">
                <div className="ws-mono">{getInitials(ws.name)}</div>
                <svg className="ws-arrow" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="ws-name">{ws.name}</div>
              <div className="ws-meta">Updated recently</div>
              <button
  onClick={async (e) => {
    e.stopPropagation();
    try {
      await deleteWorkspace(ws.id);
      fetchWorkspaces();
      fetchTaskCount();
    } catch (error) {
      console.log(error);
    }
  }}
  style={{
    marginTop: "14px",
    background: "transparent",
    color: "var(--text-muted)",
    border: "1px solid var(--border)",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    fontFamily: "var(--font)",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.15s ease",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.color = "#dc2626"; // Red text
    e.currentTarget.style.borderColor = "#fca5a5"; // Red border
    e.currentTarget.style.background = "#fef2f2"; // Light red background
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.color = "var(--text-muted)";
    e.currentTarget.style.borderColor = "var(--border)";
    e.currentTarget.style.background = "transparent";
  }}
>
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  Delete
</button>
              <div className="ws-footer">
  <span className="ws-pill">Active</span>

  <div className="ws-members">

    {(workspaceMembers[ws.id] || [])
      .slice(0, 3)
      .map((member, j) => (

        <div
          key={member.id}
          className="ws-member-dot"
          style={{
            background:
              AVATAR_COLORS[
                j %
                AVATAR_COLORS.length
              ]
          }}
        >
          {member.name?.[0]?.toUpperCase()}
        </div>

      ))}

    {(workspaceMembers[ws.id]?.length || 0) > 3 && (

      <div
        className="ws-member-dot"
        style={{
          background: "#64748b"
        }}
      >
        +
        {workspaceMembers[ws.id].length - 3}
      </div>

    )}

  </div>
</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
