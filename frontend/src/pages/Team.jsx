import { useEffect, useState } from "react";
import {
  getWorkspaceMembers,
  getWorkspaceTasks,
  inviteMember,
} from "../services/workspaceService";
import { getWorkload } from "../services/workloadService";

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
    --success: #10b981;
    --success-light: #ecfdf5;
    --warn: #f59e0b;
    --warn-light: #fffbeb;
    --danger: #ef4444;
    --danger-light: #fef2f2;
    --font: 'Geist', 'DM Sans', system-ui, sans-serif;
    --radius: 12px;
  }

  .team-wrap { font-family: var(--font); }

  /* ── Page header ── */
  .team-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; margin-bottom: 24px;
  }
  .team-title {
    font-size: 22px; font-weight: 600;
    color: var(--text-primary); letter-spacing: -0.5px;
  }
  .team-subtitle {
    font-size: 13px; color: var(--text-muted);
    margin-top: 4px; font-weight: 400;
  }
  .member-count-pill {
    display: flex; align-items: center; gap: 7px;
    font-size: 12.5px; font-weight: 500; color: var(--text-secondary);
    background: var(--white); border: 1px solid var(--border);
    border-radius: 20px; padding: 6px 14px;
  }
  .member-count-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--success);
  }

  /* ── Stats row ── */
  .stats-row {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 14px; margin-bottom: 28px;
  }
  .stat-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 18px 20px;
    display: flex; align-items: center; gap: 14px;
  }
  .stat-icon {
    width: 38px; height: 38px; border-radius: 9px;
    background: var(--accent-light); color: var(--accent);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .stat-label {
    font-size: 11.5px; font-weight: 500; text-transform: uppercase;
    letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 3px;
  }
  .stat-value {
    font-size: 22px; font-weight: 600;
    color: var(--text-primary); letter-spacing: -0.5px; line-height: 1;
  }

  /* ── Section heading ── */
  .section-heading {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 14px;
  }
  .section-title {
    font-size: 13px; font-weight: 600;
    color: var(--text-primary); letter-spacing: -0.1px;
  }
  .section-count {
    font-size: 12px; color: var(--text-muted);
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 20px; padding: 2px 10px;
  }

  /* ── Team grid ── */
  .team-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
  }

  /* ── Member card ── */
  .member-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 22px 20px;
    transition: border-color .15s, box-shadow .15s, transform .15s;
    position: relative; overflow: hidden;
    animation: fadeUp .25s ease both;
  }
  .member-card::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 2px;
    background: var(--accent); opacity: 0; transition: opacity .15s;
  }
  .member-card:hover {
    border-color: var(--accent-mid);
    box-shadow: 0 4px 20px rgba(37,99,235,.08);
    transform: translateY(-1px);
  }
  .member-card:hover::before { opacity: 1; }

  ${[0, 1, 2, 3, 4, 5].map((i) => `.member-card:nth-child(${i + 1}) { animation-delay: ${i * 0.05}s; }`).join("\n")}

  .member-card-top {
    display: flex; align-items: flex-start;
    justify-content: space-between; margin-bottom: 16px;
  }

  /* Avatar */
  .member-avatar {
    width: 44px; height: 44px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 600; color: white; flex-shrink: 0;
    letter-spacing: 0.3px;
  }

  .online-badge {
    font-size: 10.5px; font-weight: 600;
    padding: 3px 9px; border-radius: 20px;
    background: var(--success-light); color: var(--success);
    letter-spacing: 0.03em;
  }

  .member-name {
    font-size: 15px; font-weight: 600;
    color: var(--text-primary); letter-spacing: -0.2px;
    margin-bottom: 3px;
  }
  .member-role {
    font-size: 12px; color: var(--text-muted); font-weight: 400;
  }

  /* Task progress */
  .task-progress-section { margin-top: 16px; }

  .task-progress-header {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 8px;
  }
  .task-progress-label {
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--text-muted);
  }
  .task-progress-count {
    font-size: 13px; font-weight: 600; color: var(--text-primary);
  }

  .progress-bar-track {
    height: 4px; background: var(--border-light);
    border-radius: 99px; overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%; border-radius: 99px;
    background: var(--accent);
    transition: width .6s cubic-bezier(.4,0,.2,1);
  }

  .member-divider {
    height: 1px; background: var(--border-light); margin: 16px 0;
  }

  /* Task pills */
  .task-pills {
    display: flex; flex-wrap: wrap; gap: 6px;
  }
  .task-pill {
    font-size: 11.5px; font-weight: 500;
    padding: 3px 10px; border-radius: 20px;
    border: 1px solid var(--border); color: var(--text-secondary);
    background: var(--bg); white-space: nowrap;
    max-width: 150px; overflow: hidden; text-overflow: ellipsis;
  }
  .task-pill-more {
    font-size: 11.5px; font-weight: 500;
    padding: 3px 10px; border-radius: 20px;
    background: var(--accent-light); color: var(--accent);
    border: 1px solid var(--accent-mid);
  }
  .no-tasks-text {
    font-size: 12px; color: var(--text-muted); font-style: italic;
  }

  /* ── Empty state ── */
  .empty-state {
    grid-column: 1 / -1;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 64px 20px; text-align: center;
  }
  .empty-icon {
    width: 48px; height: 48px; border-radius: 12px;
    background: var(--accent-light); color: var(--accent);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
  }
  .empty-title { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
  .empty-desc  { font-size: 13px; color: var(--text-muted); max-width: 220px; line-height: 1.6; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const AVATAR_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#dc2626",
  "#0891b2",
  "#db2777",
  "#65a30d",
];

function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const PRIORITY_STYLES = {
  HIGH: { bg: "#fef2f2", color: "#ef4444" },
  MEDIUM: { bg: "#fffbeb", color: "#f59e0b" },
  LOW: { bg: "#ecfdf5", color: "#10b981" },
};

export default function Team() {
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [workload, setWorkload] = useState({ members: [], suggestions: [] });

  const handleInvite = async () => {
    if (!email.trim()) {
      alert("Enter an email");
      return;
    }

    try {
      const workspaceId = localStorage.getItem("currentWorkspaceId");

      await inviteMember(workspaceId, email);

      alert("Member invited!");

      fetchData();

      setEmail("");
    } catch (error) {
      console.log(error);

      alert("Invite failed");
    }
  };
  const fetchData = async () => {
    try {
      const workspaceId = localStorage.getItem("currentWorkspaceId");

      const usersData = await getWorkspaceMembers(workspaceId);
      const tasksData = await getWorkspaceTasks(workspaceId);
      setUsers(usersData.members);
      setTasks(tasksData.tasks);

      const wlData = await getWorkload(workspaceId);
      setWorkload(wlData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalTasks = tasks.length;
  const maxTasks = Math.max(
    ...users.map((u) => tasks.filter((t) => t.assigned_to === u.id).length),
    1,
  );

  return (
    <div className="team-wrap">
      <style>{styles}</style>

      {/* Header */}
      <div className="team-header">
        <div>
          <h1 className="team-title">Team</h1>
          <p className="team-subtitle">
            View members, roles, and assigned tasks across your workspace.
          </p>
        </div>
        <div className="member-count-pill">
          <div className="member-count-dot" />
          {users.length} member{users.length !== 1 ? "s" : ""}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:0,
  background:"var(--white)", border:"1px solid var(--border)",
  borderRadius:10, overflow:"hidden",
  transition:"border-color 0.15s, box-shadow 0.15s",
}}
  onFocusCapture={e => e.currentTarget.style.borderColor="var(--accent-mid)"}
  onBlurCapture={e => e.currentTarget.style.borderColor="var(--border)"}
>
  <input
    type="email"
    placeholder="Invite by email…"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && handleInvite()}
    style={{
      border:"none", outline:"none", padding:"9px 14px",
      fontSize:13, fontFamily:"var(--font)", color:"var(--text-primary)",
      background:"transparent", width:210,
    }}
  />
  <button onClick={handleInvite} style={{
    height:38, padding:"0 18px",
    background:"var(--accent)", color:"#fff",
    border:"none", fontSize:13, fontWeight:500,
    fontFamily:"var(--font)", cursor:"pointer",
    transition:"background 0.12s", whiteSpace:"nowrap",
  }}
    onMouseEnter={e => e.currentTarget.style.background="var(--accent-hover)"}
    onMouseLeave={e => e.currentTarget.style.background="var(--accent)"}
  >
    + Invite
  </button>
</div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <circle cx="9" cy="7" r="3" />
              <path d="M3 21v-1a6 6 0 0112 0v1" strokeLinecap="round" />
              <circle cx="18" cy="8" r="2.5" />
              <path d="M21 21v-1a4.5 4.5 0 00-3-4.24" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="stat-label">Members</div>
            <div className="stat-value">{users.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 11.5l2.5 2.5L16 9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="3" y="3" width="18" height="18" rx="3" />
            </svg>
          </div>
          <div>
            <div className="stat-label">Total Tasks</div>
            <div className="stat-value">{totalTasks}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                d="M12 7v5l3 3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="stat-label">Avg / Member</div>
            <div className="stat-value">
              {users.length > 0 ? (totalTasks / users.length).toFixed(1) : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="section-heading">
        <span className="section-title">All Members</span>
        <span className="section-count">{users.length} total</span>
      </div>

      <div className="team-grid">
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <circle cx="9" cy="7" r="3" />
                <path d="M3 21v-1a6 6 0 0112 0v1" strokeLinecap="round" />
                <path d="M16 11h6M19 8v6" strokeLinecap="round" />
              </svg>
            </div>
            <p className="empty-title">No team members yet</p>
            <p className="empty-desc">
              Invite members to your workspace to see them here.
            </p>
          </div>
        ) : (
          users.map((user, i) => {
            const userTasks = tasks.filter((t) => t.assigned_to === user.id);
            const taskCount = userTasks.length;
            const progress = maxTasks > 0 ? (taskCount / maxTasks) * 100 : 0;
            const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const visibleTasks = userTasks.slice(0, 3);
            const extraCount = taskCount - visibleTasks.length;

            return (
              <div key={user.id} className="member-card">
                {/* Top row */}
                <div className="member-card-top">
                  <div
                    className="member-avatar"
                    style={{ background: avatarColor }}
                  >
                    {getInitials(user.name)}
                  </div>
                  <span className="online-badge">Active</span>
                </div>

                {/* Name + role */}
                <div className="member-name">{user.name}</div>
                <div className="member-role">{user.role}</div>

                {/* Task progress */}
                <div className="task-progress-section">
                  <div className="task-progress-header">
                    <span className="task-progress-label">Tasks assigned</span>
                    <span className="task-progress-count">{taskCount}</span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                {/* AI Workload Score */}
                {(() => {
                  const wl = workload.members.find(
                    (m) => m.user_id === user.id,
                  );
                  if (!wl) return null;
                  const pct = Math.round(wl.score * 100);
                  const color =
                    pct >= 75
                      ? "var(--danger)"
                      : pct >= 50
                        ? "var(--warn)"
                        : "var(--success)";
                  const label =
                    pct >= 75
                      ? "Overloaded"
                      : pct >= 50
                        ? "At risk"
                        : "Healthy";
                  return (
                    <div style={{ marginTop: 12 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 5,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "var(--text-muted)",
                          }}
                        >
                          AI Load Score
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color,
                            background: color + "18",
                            padding: "2px 8px",
                            borderRadius: 20,
                          }}
                        >
                          {label} · {pct}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 4,
                          background: "var(--border-light)",
                          borderRadius: 99,
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: color,
                            borderRadius: 99,
                            transition: "width .6s",
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Task pills */}
                {taskCount > 0 && (
                  <>
                    <div className="member-divider" />
                    <div className="task-pills">
                      {visibleTasks.map((task) => {
                        const ps =
                          PRIORITY_STYLES[task.priority] ||
                          PRIORITY_STYLES.MEDIUM;
                        return (
                          <span
                            key={task.id}
                            className="task-pill"
                            style={{
                              background: ps.bg,
                              color: ps.color,
                              borderColor: "transparent",
                            }}
                            title={task.title}
                          >
                            {task.title}
                          </span>
                        );
                      })}
                      {extraCount > 0 && (
                        <span className="task-pill-more">
                          +{extraCount} more
                        </span>
                      )}
                    </div>
                  </>
                )}

                {taskCount === 0 && (
                  <>
                    <div className="member-divider" />
                    <span className="no-tasks-text">No tasks assigned</span>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
      {/* AI Suggestions */}
      {workload.suggestions.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div className="section-heading">
            <span className="section-title">⚡ AI Rebalancing Suggestions</span>
            <span className="section-count">
              {workload.suggestions.length} suggestion
              {workload.suggestions.length !== 1 ? "s" : ""}
            </span>
          </div>
          {workload.suggestions.map((s, i) => (
            <div
              key={i}
              style={{
                background: "var(--warn-light)",
                border: "1px solid #fcd34d",
                borderRadius: "var(--radius)",
                padding: "14px 18px",
                marginBottom: 10,
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 18 }}>⚠️</span>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: 4,
                  }}
                >
                  Move a task from{" "}
                  <span style={{ color: "var(--danger)" }}>{s.from_name}</span>{" "}
                  → <span style={{ color: "var(--success)" }}>{s.to_name}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {s.reason}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
