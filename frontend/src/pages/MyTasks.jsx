import { useEffect, useState } from "react";
import { getMyTasks, updateTask, deleteTask } from "../services/workspaceService";

/* ─── Priority badge ───────────────────────────────────────────── */
function PriorityBadge({ priority }) {
  const map = {
    HIGH:   { bg: "#FEE2E2", text: "#DC2626", dot: "#DC2626" },
    MEDIUM: { bg: "#FEF9C3", text: "#B45309", dot: "#F59E0B" },
    LOW:    { bg: "#DCFCE7", text: "#15803D", dot: "#22C55E" },
  };
  const c = map[priority?.toUpperCase()] || map.MEDIUM;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: c.bg, color: c.text,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
      padding: "4px 10px", borderRadius: 20, textTransform: "uppercase",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {priority}
    </span>
  );
}

/* ─── Empty state ───────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={{
      background: "#fff", borderRadius: 20,
      border: "1px solid #E8ECF0",
      padding: "72px 32px", textAlign: "center",
    }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>No tasks yet</h3>
      <p style={{ color: "#9CA3AF", marginTop: 6, fontSize: 14 }}>
        Tasks assigned to you will appear here.
      </p>
    </div>
  );
}

/* ─── Skeleton loader ───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{
      background: "#fff", borderRadius: 16,
      border: "1px solid #E8ECF0", padding: "22px 24px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ height: 16, width: "40%", background: "#F1F5F9", borderRadius: 8 }} />
        <div style={{ height: 22, width: 70, background: "#F1F5F9", borderRadius: 20 }} />
      </div>
      <div style={{ height: 12, width: "80%", background: "#F8FAFC", borderRadius: 8, marginBottom: 8 }} />
      <div style={{ height: 12, width: "60%", background: "#F8FAFC", borderRadius: 8 }} />
    </div>
  );
}

const STATUS_CONFIG = {
  TODO:        { label: "📋 Todo",        bg: "#F1F5F9", color: "#475569" },
  IN_PROGRESS: { label: "🔄 In Progress", bg: "#EFF6FF", color: "#2563EB" },
  DONE:        { label: "✅ Done",         bg: "#F0FDF4", color: "#16A34A" },
}

/* ─── Main Component ────────────────────────────────────────────── */
export default function MyTasks() {
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("ALL");
  const [statusMenuOpen, setStatusMenuOpen] = useState(null);

  const fetchTasks = async () => {
    try {
      const data = await getMyTasks();
      setTasks(data.tasks);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTask(task.id, {
        title:       task.title,
        description: task.description,
        priority:    task.priority,
        assigned_to: task.assigned_to,
        status:      newStatus,
        due_date:    task.due_date || null,
      });
      setStatusMenuOpen(null);
      fetchTasks();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      fetchTasks();
    } catch (error) {
      console.log(error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return {
      label,
      isOverdue: diffDays < 0,
      isDueSoon: diffDays >= 0 && diffDays <= 2,
    };
  };

  const filters = ["ALL", "HIGH", "MEDIUM", "LOW"];

  const filtered = filter === "ALL"
    ? tasks
    : tasks.filter(t => t.priority?.toUpperCase() === filter);

  const counts = {
    ALL:    tasks.length,
    HIGH:   tasks.filter(t => t.priority?.toUpperCase() === "HIGH").length,
    MEDIUM: tasks.filter(t => t.priority?.toUpperCase() === "MEDIUM").length,
    LOW:    tasks.filter(t => t.priority?.toUpperCase() === "LOW").length,
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: "100vh", background: "#F8FAFC" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 36px" }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px" }}>
            My Tasks
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6B7280" }}>
            {loading ? "Loading…" : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} assigned to you`}
          </p>
        </div>

        {/* ── Filter pills ── */}
        {!loading && tasks.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {filters.map(p => {
              const active = filter === p;
              return (
                <button
                  key={p}
                  onClick={() => setFilter(p)}
                  style={{
                    border: active ? "none" : "1.5px solid #E5E7EB",
                    background: active ? "linear-gradient(135deg, #0EA5E9, #38BDF8)" : "#fff",
                    color: active ? "#fff" : "#374151",
                    borderRadius: 20, padding: "7px 16px",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                    boxShadow: active ? "0 2px 8px rgba(14,165,233,0.25)" : "none",
                    transition: "all 0.15s",
                    display: "inline-flex", alignItems: "center", gap: 6,
                  }}
                >
                  {p === "ALL" ? "All" : p.charAt(0) + p.slice(1).toLowerCase()}
                  <span style={{
                    background: active ? "rgba(255,255,255,0.25)" : "#F1F5F9",
                    color: active ? "#fff" : "#6B7280",
                    borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "1px 7px",
                  }}>
                    {counts[p]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Task list ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {loading ? (
            [1, 2, 3].map(i => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((task) => {
              const statusCfg = STATUS_CONFIG[task.status?.toUpperCase()] || STATUS_CONFIG.TODO;
              const dateInfo  = formatDate(task.due_date);
              const isDone    = task.status?.toUpperCase() === "DONE";

              return (
                <div
                  key={task.id}
                  style={{
                    background: isDone ? "#FAFAFA" : "#fff",
                    borderRadius: 16,
                    border: `1px solid ${isDone ? "#E2E8F0" : "#E8ECF0"}`,
                    padding: "20px 24px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    transition: "box-shadow 0.15s, border-color 0.15s",
                    opacity: isDone ? 0.75 : 1,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(14,165,233,0.10)";
                    e.currentTarget.style.borderColor = "#BAE6FD";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                    e.currentTarget.style.borderColor = isDone ? "#E2E8F0" : "#E8ECF0";
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                    <h2 style={{
                      margin: 0, fontSize: 15, fontWeight: 700,
                      color: "#111827", lineHeight: 1.4, flex: 1,
                      textDecoration: isDone ? "line-through" : "none",
                      opacity: isDone ? 0.5 : 1,
                    }}>
                      {task.title}
                    </h2>
                    <PriorityBadge priority={task.priority || "MEDIUM"} />
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p style={{ margin: "0 0 14px", fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>
                      {task.description}
                    </p>
                  )}

                  {/* Status + due date row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>

                    {/* Inline status selector */}
                    <div style={{ position: "relative" }}>
                      <span
                        onClick={() => setStatusMenuOpen(statusMenuOpen === task.id ? null : task.id)}
                        style={{
                          fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
                          background: statusCfg.bg, color: statusCfg.color,
                          cursor: "pointer", userSelect: "none",
                          border: `1px solid ${statusCfg.color}22`,
                        }}
                      >
                        {statusCfg.label} ▾
                      </span>

                      {statusMenuOpen === task.id && (
                        <div style={{
                          position: "absolute", top: "110%", left: 0, zIndex: 100,
                          background: "#fff", border: "1px solid #E8ECF0",
                          borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                          overflow: "hidden", minWidth: 145,
                        }}>
                          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <div
                              key={key}
                              onClick={() => handleStatusChange(task, key)}
                              style={{
                                padding: "8px 14px", fontSize: 12, fontWeight: 500,
                                color: cfg.color, cursor: "pointer",
                                background: task.status?.toUpperCase() === key ? cfg.bg : "#fff",
                                transition: "background 0.1s",
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = cfg.bg}
                              onMouseLeave={e => e.currentTarget.style.background = task.status?.toUpperCase() === key ? cfg.bg : "#fff"}
                            >
                              {cfg.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Due date badge */}
                    {dateInfo && (
                      <span style={{
                        fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 20,
                        background: dateInfo.isOverdue ? "#FEF2F2" : dateInfo.isDueSoon ? "#FFFBEB" : "#F8FAFC",
                        color: dateInfo.isOverdue ? "#EF4444" : dateInfo.isDueSoon ? "#F59E0B" : "#64748B",
                        border: `1px solid ${dateInfo.isOverdue ? "#FCA5A5" : dateInfo.isDueSoon ? "#FCD34D" : "#E2E8F0"}`,
                      }}>
                        📅 {dateInfo.isOverdue ? "Overdue · " : ""}{dateInfo.label}
                      </span>
                    )}

                    {/* Delete button — only when done */}
                    {isDone && (
                      <button
                        onClick={() => handleDelete(task.id)}
                        style={{
                          marginLeft: "auto",
                          background: "none", border: "1px solid #FCA5A5",
                          color: "#EF4444", borderRadius: 8,
                          padding: "4px 12px", fontSize: 11, fontWeight: 600,
                          cursor: "pointer", transition: "all 0.15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#FEF2F2"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                      >
                        🗑 Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}