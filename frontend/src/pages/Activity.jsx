import { useEffect, useState } from "react"
import { getActivities } from "../services/workspaceService"

const ACTION_CONFIG = {
  "Task Created": { icon: "✅", color: "#10b981", bg: "#ecfdf5" },
  "Task Updated": { icon: "✏️", color: "#2563eb", bg: "#eff6ff" },
  "Task Moved":   { icon: "🔄", color: "#f59e0b", bg: "#fffbeb" },
}

function timeAgo(dateStr) {
  if (!dateStr) return ""
  const diff = Math.floor((new Date() - new Date(dateStr)) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

export default function Activity() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    const workspaceId = localStorage.getItem("currentWorkspaceId")
    if (!workspaceId) return
    getActivities(workspaceId)
      .then(data => setActivities(data.activities || []))
      .catch(console.log)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", minHeight:"100vh", background:"#F8FAFC" }}>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"32px 36px" }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ margin:0, fontSize:24, fontWeight:800, color:"#0F172A", letterSpacing:"-0.5px" }}>
            Activity
          </h1>
          <p style={{ margin:"4px 0 0", fontSize:14, color:"#6B7280" }}>
            Recent actions across this workspace
          </p>
        </div>

        {/* Timeline */}
        {loading ? (
          <div style={{ color:"#9CA3AF", fontSize:14 }}>Loading…</div>
        ) : activities.length === 0 ? (
          <div style={{
            background:"#fff", borderRadius:16, border:"1px solid #E8ECF0",
            padding:"64px 32px", textAlign:"center",
          }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
            <p style={{ margin:0, fontWeight:600, color:"#111827" }}>No activity yet</p>
            <p style={{ color:"#9CA3AF", marginTop:6, fontSize:13 }}>
              Actions like creating or moving tasks will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {activities.map((log, i) => {
              const cfg = ACTION_CONFIG[log.action] || { icon:"📌", color:"#6B7280", bg:"#F1F5F9" }
              return (
                <div key={log.id} style={{ display:"flex", gap:14, position:"relative" }}>
                  {/* Timeline line */}
                  {i < activities.length - 1 && (
                    <div style={{
                      position:"absolute", left:19, top:40,
                      width:2, height:"calc(100% - 12px)",
                      background:"#F1F5F9",
                    }} />
                  )}

                  {/* Icon */}
                  <div style={{
                    width:40, height:40, borderRadius:"50%", flexShrink:0,
                    background:cfg.bg, display:"flex", alignItems:"center",
                    justifyContent:"center", fontSize:16, zIndex:1,
                    border:`1px solid ${cfg.color}22`,
                  }}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div style={{
                    background:"#fff", borderRadius:12, border:"1px solid #E8ECF0",
                    padding:"12px 16px", flex:1, marginBottom:10,
                  }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{
                        fontSize:11, fontWeight:600, padding:"2px 8px",
                        borderRadius:20, background:cfg.bg, color:cfg.color,
                      }}>
                        {log.action}
                      </span>
                      <span style={{ fontSize:11, color:"#9CA3AF" }}>
                        {timeAgo(log.created_at)}
                      </span>
                    </div>
                    <p style={{ margin:0, fontSize:13, color:"#374151", fontWeight:500 }}>
                      <span style={{ color:"#111827", fontWeight:600 }}>{log.user_name}</span>
                      {" · "}
                      <span style={{ color:"#6B7280" }}>{log.task_title}</span>
                    </p>
                    {log.details && (
                      <p style={{ margin:"4px 0 0", fontSize:12, color:"#9CA3AF" }}>
                        {log.details}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}