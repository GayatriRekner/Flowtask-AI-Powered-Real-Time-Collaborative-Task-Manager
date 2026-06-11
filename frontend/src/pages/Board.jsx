import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  getBoards, createBoard, getColumns, createColumn, deleteColumn,
  getTasks, createTask, moveTask, deleteTask, deleteBoard,
  updateTask, getWorkspaceMembers, generateTaskAI,
} from "../services/workspaceService";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

/* ─── Priority badge ── */
function PriorityBadge({ priority }) {
  const map = {
    HIGH:   { bg: "#FEE2E2", text: "#DC2626", dot: "#DC2626" },
    MEDIUM: { bg: "#FEF9C3", text: "#B45309", dot: "#F59E0B" },
    LOW:    { bg: "#DCFCE7", text: "#15803D", dot: "#22C55E" },
  };
  const c = map[priority] || map.MEDIUM;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5,
      background:c.bg, color:c.text, fontSize:11, fontWeight:600,
      letterSpacing:"0.04em", padding:"3px 9px", borderRadius:20 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:c.dot, flexShrink:0 }} />
      {priority}
    </span>
  );
}

/* ─── Avatar ── */
function Avatar({ label, size = 26 }) {
  const colors = ["#3B82F6","#8B5CF6","#EC4899","#10B981","#F59E0B","#06B6D4"];
  const idx = (label?.charCodeAt(0) || 0) % colors.length;
  return (
    <span style={{ width:size, height:size, borderRadius:"50%", background:colors[idx],
      color:"#fff", fontSize:size*0.42, fontWeight:700, display:"inline-flex",
      alignItems:"center", justifyContent:"center", flexShrink:0, border:"2px solid #fff" }}>
      {label?.[0]?.toUpperCase() || "?"}
    </span>
  );
}

const STATUS_CONFIG = {
  TODO:        { label:"📋 Todo",        bg:"#F1F5F9", color:"#475569" },
  IN_PROGRESS: { label:"🔄 In Progress", bg:"#EFF6FF", color:"#2563EB" },
  DONE:        { label:"✅ Done",         bg:"#F0FDF4", color:"#16A34A" },
};

/* ─── Task Card ── */
function DraggableTask({ task, members, onClick, onDelete, onStatusChange }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `task-${task.id}` });
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const style = transform ? {
    transform: `translate(${transform.x}px, ${transform.y}px)`,
    zIndex:999, opacity:0.96, boxShadow:"0 20px 60px rgba(0,0,0,0.18)",
  } : undefined;

  const assignee = members?.find(m => m.id === task.assigned_to);
  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
  const isDone = task.status === "DONE";

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const diffDays = Math.ceil((d - new Date()) / (1000*60*60*24));
    return {
      label: d.toLocaleDateString("en-IN", { day:"numeric", month:"short" }),
      isOverdue: diffDays < 0,
      isDueSoon: diffDays >= 0 && diffDays <= 2,
    };
  };
  const dateInfo = formatDate(task.due_date);

  return (
    <div ref={setNodeRef} style={{
      background:"#fff", borderRadius:12, padding:"14px 16px",
      border:"1px solid #E8ECF0",
      boxShadow: isDragging ? undefined : "0 1px 3px rgba(0,0,0,0.06)",
      transition:"box-shadow 0.15s, border-color 0.15s", ...style,
      opacity: isDone ? 0.7 : 1,
    }}
      onMouseEnter={e => { if(!isDragging) e.currentTarget.style.boxShadow="0 4px 16px rgba(14,165,233,0.10)"; e.currentTarget.style.borderColor="#BAE6FD"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor="#E8ECF0"; }}
    >
      {/* Title + drag handle */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:8 }}>
        <p onClick={onClick} style={{
          margin:0, fontWeight:600, fontSize:14, color:"#111827",
          cursor:"pointer", lineHeight:1.4, flex:1,
          textDecoration: isDone ? "line-through" : "none",
          opacity: isDone ? 0.6 : 1,
        }}>
          {task.title}
        </p>
        <button {...listeners} {...attributes} style={{
          background:"none", border:"none", cursor:"grab", color:"#C4CAD4",
          padding:2, borderRadius:4, flexShrink:0, fontSize:14,
        }} title="Drag">⠿</button>
      </div>

      {/* Status + due date */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10, flexWrap:"wrap" }}>
        <div style={{ position:"relative" }}>
          <span onClick={() => setShowStatusMenu(!showStatusMenu)} style={{
            fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:20,
            background:statusCfg.bg, color:statusCfg.color,
            cursor:"pointer", userSelect:"none",
            border:`1px solid ${statusCfg.color}22`,
          }}>
            {statusCfg.label} ▾
          </span>
          {showStatusMenu && (
            <div style={{
              position:"absolute", top:"110%", left:0, zIndex:100,
              background:"#fff", border:"1px solid #E8ECF0",
              borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.12)",
              overflow:"hidden", minWidth:140,
            }}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <div key={key}
                  onClick={() => { onStatusChange(task.id, key); setShowStatusMenu(false); }}
                  style={{
                    padding:"8px 14px", fontSize:12, fontWeight:500,
                    color:cfg.color, cursor:"pointer",
                    background: task.status === key ? cfg.bg : "#fff",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = cfg.bg}
                  onMouseLeave={e => e.currentTarget.style.background = task.status === key ? cfg.bg : "#fff"}
                >
                  {cfg.label}
                </div>
              ))}
            </div>
          )}
        </div>
        {dateInfo && (
          <span style={{
            fontSize:11, fontWeight:500, padding:"3px 8px", borderRadius:20,
            background: dateInfo.isOverdue ? "#FEF2F2" : dateInfo.isDueSoon ? "#FFFBEB" : "#F8FAFC",
            color: dateInfo.isOverdue ? "#EF4444" : dateInfo.isDueSoon ? "#F59E0B" : "#94A3B8",
            border:`1px solid ${dateInfo.isOverdue ? "#FCA5A5" : dateInfo.isDueSoon ? "#FCD34D" : "#E2E8F0"}`,
          }}>
            📅 {dateInfo.isOverdue ? "Overdue · " : ""}{dateInfo.label}
          </span>
        )}
      </div>

      {/* Priority + assignee + delete */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:6 }}>
        <PriorityBadge priority={task.priority || "MEDIUM"} />
        <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:"auto" }}>
          <Avatar label={assignee?.name || "?"} size={22} />
          <span style={{ fontSize:12, color:"#6B7280" }}>{assignee?.name || "Unassigned"}</span>
          <button onClick={onDelete} style={{
            background:"none", border:"1px solid #FCA5A5", color:"#EF4444",
            borderRadius:6, padding:"3px 8px", fontSize:11, fontWeight:600, cursor:"pointer",
          }}
            onMouseEnter={e => e.currentTarget.style.background="#FEF2F2"}
            onMouseLeave={e => e.currentTarget.style.background="none"}
          >Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Droppable Column ── */
function DroppableColumn({ column, taskCount, onDelete, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${column.id}` });
  return (
    <div ref={setNodeRef} style={{
      minWidth:290, maxWidth:320, flex:"0 0 auto",
      background: isOver ? "#F0F9FF" : "#F8FAFC",
      border: isOver ? "1.5px dashed #38BDF8" : "1.5px solid #E8ECF0",
      borderRadius:16, padding:"18px 14px",
      display:"flex", flexDirection:"column", gap:0,
      transition:"border-color 0.15s, background 0.15s",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <h3 style={{ margin:0, fontWeight:700, fontSize:13, color:"#374151", letterSpacing:"0.02em" }}>
            {column.name}
          </h3>
          <span style={{
            background:"#E0F2FE", color:"#0284C7", fontSize:11,
            fontWeight:700, borderRadius:20, padding:"2px 8px",
          }}>{taskCount}</span>
        </div>
        <button onClick={onDelete} style={{
          background:"none", border:"none", color:"#C4CAD4", cursor:"pointer",
          fontSize:18, padding:0, display:"flex", alignItems:"center",
          transition:"color 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.color="#EF4444"}
          onMouseLeave={e => e.currentTarget.style.color="#C4CAD4"}
        >×</button>
      </div>
      {children}
    </div>
  );
}

/* ─── Label ── */
function Label({ children }) {
  return (
    <label style={{
      display:"block", fontSize:11, fontWeight:600, color:"#6B7280",
      marginBottom:5, letterSpacing:"0.06em", textTransform:"uppercase",
    }}>{children}</label>
  );
}

/* ─── Main Board ── */
export default function Board() {
  const { id } = useParams();
  useEffect(() => { localStorage.setItem("currentWorkspaceId", id); }, [id]);

  const [boards, setBoards]         = useState([]);
  const [columns, setColumns]       = useState({});
  const [tasks, setTasks]           = useState({});
  const [name, setName]             = useState("");
  const [columnName, setColumnName] = useState("");
  const [taskInputs, setTaskInputs] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [editTask, setEditTask]     = useState(null);
  const [addingColumn, setAddingColumn] = useState(null);
  const [members, setMembers]       = useState([]);
  const [aiLoading, setAiLoading]   = useState({});

  const fetchMembers = async () => {
    try {
      const data = await getWorkspaceMembers(localStorage.getItem("currentWorkspaceId"));
      setMembers(data.members);
    } catch(e) { console.log(e); }
  };

  const fetchBoards = async () => {
    try {
      const data = await getBoards(id);
      setBoards(data.boards);
      data.boards.forEach(b => { fetchColumns(b.id); fetchTasks(b.id); });
    } catch(e) { console.log(e); }
  };

  useEffect(() => { fetchBoards(); fetchMembers(); }, []);
  useEffect(() => { setEditTask(selectedTask ? { ...selectedTask } : null); }, [selectedTask]);

  const fetchColumns = async (boardId) => {
    try {
      const data = await getColumns(boardId);
      setColumns(prev => ({ ...prev, [boardId]: data.columns }));
    } catch(e) { console.log(e); }
  };

  const fetchTasks = async (boardId) => {
    try {
      const data = await getTasks(boardId);
      setTasks(prev => ({ ...prev, [boardId]: data.tasks }));
    } catch(e) { console.log(e); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await createBoard({ name, workspace_id: id }); setName(""); fetchBoards(); }
    catch(e) { console.log(e); }
  };

  const handleCreateColumn = async (boardId) => {
    try {
      await createColumn({ name: columnName, board_id: boardId });
      setColumnName(""); setAddingColumn(null); fetchColumns(boardId);
    } catch(e) { console.log(e); }
  };

  const handleDeleteColumn = async (boardId, columnId) => {
    if (!window.confirm("Delete this column and all its tasks?")) return;
    try { await deleteColumn(columnId); fetchColumns(boardId); }
    catch(e) { console.log(e); }
  };

  const handleCreateTask = async (boardId, columnId) => {
    try {
      await createTask({
        title:       taskInputs[columnId]?.title || "",
        description: taskInputs[columnId]?.description || "",
        priority:    taskInputs[columnId]?.priority || "MEDIUM",
        status:      "TODO",
        due_date:    taskInputs[columnId]?.due_date || null,
        board_id:    boardId,
        column_id:   columnId,
        assigned_to: taskInputs[columnId]?.assigned_to || null,
      });
      setTaskInputs({ ...taskInputs, [columnId]: { title:"", description:"", priority:"MEDIUM" } });
      fetchTasks(boardId);
    } catch(e) { console.log(e); }
  };

  const handleStatusChange = async (taskId, newStatus, boardId) => {
    try {
      const task = Object.values(tasks).flat().find(t => t.id === taskId);
      await updateTask(taskId, {
        title: task.title, description: task.description,
        priority: task.priority, assigned_to: task.assigned_to,
        status: newStatus, due_date: task.due_date || null,
      });
      fetchTasks(boardId);
    } catch(e) { console.log(e); }
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over) return;
    try {
      await moveTask(active.id.split("-")[1], over.id.split("-")[1]);
      boards.forEach(b => fetchTasks(b.id));
    } catch(e) { console.log(e); }
  };

  const handleAIGenerate = async (columnId) => {
    const title = taskInputs[columnId]?.title;
    if (!title?.trim()) { alert("Type a task title first"); return; }
    setAiLoading(prev => ({ ...prev, [columnId]: true }));
    try {
      const result = await generateTaskAI(title);
      setTaskInputs(prev => ({
        ...prev,
        [columnId]: { ...prev[columnId], description: result.description, priority: result.priority },
      }));
    } catch(e) { console.log(e); }
    finally { setAiLoading(prev => ({ ...prev, [columnId]: false })); }
  };

  const inputStyle = {
    border:"1.5px solid #E5E7EB", borderRadius:8, padding:"9px 12px",
    fontSize:13, color:"#111827", outline:"none", background:"#fff",
    width:"100%", boxSizing:"border-box", transition:"border-color 0.15s",
    fontFamily:"inherit",
  };

  const primaryBtn = {
    background:"linear-gradient(135deg, #0EA5E9, #38BDF8)", color:"#fff",
    border:"none", borderRadius:8, padding:"10px 20px", fontWeight:700,
    fontSize:13, cursor:"pointer", whiteSpace:"nowrap",
    boxShadow:"0 2px 8px rgba(14,165,233,0.25)", transition:"opacity 0.15s",
    fontFamily:"inherit",
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", minHeight:"100vh", background:"#F8FAFC" }}>
        <div style={{ maxWidth:1400, margin:"0 auto", padding:"32px 36px" }}>

          {/* Page header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32 }}>
            <div>
              <h1 style={{ margin:0, fontSize:24, fontWeight:800, color:"#0F172A", letterSpacing:"-0.5px" }}>Boards</h1>
              <p style={{ margin:"4px 0 0", fontSize:14, color:"#6B7280" }}>Manage your project boards and tasks</p>
            </div>
            <form onSubmit={handleCreate} style={{ display:"flex", gap:10 }}>
              <input type="text" placeholder="New board name…"
                style={{ ...inputStyle, width:220 }} value={name}
                onChange={e => setName(e.target.value)}
                onFocus={e => e.target.style.borderColor="#38BDF8"}
                onBlur={e => e.target.style.borderColor="#E5E7EB"}
              />
              <button type="submit" style={primaryBtn}>+ Create Board</button>
            </form>
          </div>

          {/* Boards */}
          <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
            {boards.map(board => {
              const boardColumns = columns[board.id] || [];
              const boardTasks   = tasks[board.id]   || [];
              return (
                <div key={board.id} style={{
                  background:"#fff", borderRadius:20,
                  border:"1px solid #E8ECF0", boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
                  overflow:"hidden",
                }}>
                  {/* Board header */}
                  <div style={{
                    padding:"18px 24px", borderBottom:"1px solid #F0F4F8",
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    background:"#FAFBFC",
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{
                        width:36, height:36, borderRadius:10,
                        background:"linear-gradient(135deg, #0EA5E9, #38BDF8)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        color:"#fff", fontWeight:800, fontSize:15,
                      }}>
                        {board.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:"#111827" }}>{board.name}</h2>
                        <span style={{ fontSize:12, color:"#9CA3AF" }}>
                          {boardColumns.length} column{boardColumns.length !== 1 ? "s" : ""} · {boardTasks.length} task{boardTasks.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      {addingColumn === board.id ? (
                        <div style={{ display:"flex", gap:8 }}>
                          <input autoFocus type="text" placeholder="Column name"
                            style={{ ...inputStyle, width:160 }} value={columnName}
                            onChange={e => setColumnName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleCreateColumn(board.id)}
                            onFocus={e => e.target.style.borderColor="#38BDF8"}
                            onBlur={e => e.target.style.borderColor="#E5E7EB"}
                          />
                          <button onClick={() => handleCreateColumn(board.id)} style={{ ...primaryBtn, padding:"9px 16px" }}>Add</button>
                          <button onClick={() => setAddingColumn(null)} style={{
                            background:"none", border:"1.5px solid #E5E7EB", borderRadius:8,
                            padding:"9px 14px", fontSize:13, cursor:"pointer", color:"#6B7280", fontFamily:"inherit",
                          }}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setAddingColumn(board.id)} style={{
                          background:"none", border:"1.5px solid #E5E7EB", borderRadius:8,
                          padding:"8px 16px", fontSize:13, fontWeight:600, color:"#374151",
                          cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit",
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor="#38BDF8"; e.currentTarget.style.color="#0EA5E9"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor="#E5E7EB"; e.currentTarget.style.color="#374151"; }}
                        >+ Add Column</button>
                      )}
                      <button onClick={async () => { try { await deleteBoard(board.id); fetchBoards(); } catch(e){} }} style={{
                        background:"none", border:"1.5px solid #FCA5A5", borderRadius:8,
                        padding:"8px 14px", fontSize:13, fontWeight:600, color:"#EF4444",
                        cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit",
                      }}
                        onMouseEnter={e => e.currentTarget.style.background="#FEF2F2"}
                        onMouseLeave={e => e.currentTarget.style.background="none"}
                      >Delete Board</button>
                    </div>
                  </div>

                  {/* Columns */}
                  <div style={{ padding:"20px 24px", overflowX:"auto" }}>
                    <div style={{ display:"flex", gap:14, minWidth:"max-content" }}>
                      {boardColumns.map(column => {
                        const colTasks = boardTasks.filter(t => t.column_id === column.id);
                        return (
                          <DroppableColumn key={column.id} column={column}
                            taskCount={colTasks.length}
                            onDelete={() => handleDeleteColumn(board.id, column.id)}
                          >
                            {/* Tasks */}
                            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                              {colTasks.map(task => (
                                <DraggableTask key={task.id} task={task} members={members}
                                  onClick={() => setSelectedTask(task)}
                                  onStatusChange={(taskId, newStatus) => handleStatusChange(taskId, newStatus, board.id)}
                                  onDelete={async () => { try { await deleteTask(task.id); fetchTasks(board.id); } catch(e){} }}
                                />
                              ))}
                            </div>

                            {/* Add task form */}
                            <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:7 }}>
                              <input type="text" placeholder="Task title…"
                                style={{ ...inputStyle, fontSize:13 }}
                                value={taskInputs[column.id]?.title || ""}
                                onChange={e => setTaskInputs({ ...taskInputs, [column.id]: { ...taskInputs[column.id], title: e.target.value } })}
                                onFocus={e => e.target.style.borderColor="#38BDF8"}
                                onBlur={e => e.target.style.borderColor="#E5E7EB"}
                              />

                              {/* AI button */}
                              <button onClick={() => handleAIGenerate(column.id)}
                                disabled={aiLoading[column.id]}
                                style={{
                                  background: aiLoading[column.id] ? "#F1F5F9" : "linear-gradient(135deg, #7C3AED, #A78BFA)",
                                  color: aiLoading[column.id] ? "#94A3B8" : "#fff",
                                  border:"none", borderRadius:8, padding:"8px 14px", fontSize:12,
                                  fontWeight:600, cursor: aiLoading[column.id] ? "not-allowed" : "pointer",
                                  width:"100%", display:"flex", alignItems:"center", justifyContent:"center",
                                  gap:6, fontFamily:"inherit",
                                }}
                              >
                                {aiLoading[column.id] ? "⏳ Generating…" : "✨ AI Fill Description & Priority"}
                              </button>

                              <textarea placeholder="Description (optional)" rows={2}
                                style={{ ...inputStyle, fontSize:13, resize:"none", lineHeight:1.5 }}
                                value={taskInputs[column.id]?.description || ""}
                                onChange={e => setTaskInputs({ ...taskInputs, [column.id]: { ...taskInputs[column.id], description: e.target.value } })}
                                onFocus={e => e.target.style.borderColor="#38BDF8"}
                                onBlur={e => e.target.style.borderColor="#E5E7EB"}
                              />

                              <div style={{ display:"flex", gap:7 }}>
                                <select style={{ ...inputStyle, fontSize:12, color:"#374151", flex:1 }}
                                  value={taskInputs[column.id]?.priority || "MEDIUM"}
                                  onChange={e => setTaskInputs({ ...taskInputs, [column.id]: { ...taskInputs[column.id], priority: e.target.value } })}
                                >
                                  <option value="LOW">🟢 Low</option>
                                  <option value="MEDIUM">🟡 Medium</option>
                                  <option value="HIGH">🔴 High</option>
                                </select>
                                <select style={{ ...inputStyle, fontSize:12, color:"#374151", flex:1 }}
                                  value={taskInputs[column.id]?.assigned_to || ""}
                                  onChange={e => setTaskInputs({ ...taskInputs, [column.id]: { ...taskInputs[column.id], assigned_to: Number(e.target.value) } })}
                                >
                                  <option value="">Assignee</option>
                                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                              </div>

                              <input type="date" style={{ ...inputStyle, fontSize:12, color:"#374151" }}
                                value={taskInputs[column.id]?.due_date || ""}
                                onChange={e => setTaskInputs({ ...taskInputs, [column.id]: { ...taskInputs[column.id], due_date: e.target.value } })}
                              />

                              <button onClick={() => handleCreateTask(column.board_id, column.id)}
                                style={{ ...primaryBtn, width:"100%", textAlign:"center", padding:"10px" }}
                              >+ Add Task</button>
                            </div>
                          </DroppableColumn>
                        );
                      })}

                      {boardColumns.length === 0 && (
                        <div style={{ padding:"48px 32px", textAlign:"center", color:"#9CA3AF", fontSize:14 }}>
                          <div style={{ fontSize:36, marginBottom:10 }}>📋</div>
                          No columns yet. Add one to get started.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {boards.length === 0 && (
              <div style={{ background:"#fff", borderRadius:20, border:"1px solid #E8ECF0", padding:"64px 32px", textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🗂️</div>
                <h3 style={{ margin:0, color:"#111827", fontWeight:700 }}>No boards yet</h3>
                <p style={{ color:"#6B7280", marginTop:6 }}>Create your first board to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Edit Task Modal ── */}
      {selectedTask && (
        <div onClick={e => e.target === e.currentTarget && setSelectedTask(null)} style={{
          position:"fixed", inset:0, background:"rgba(15,23,42,0.5)",
          backdropFilter:"blur(6px)", display:"flex", alignItems:"center",
          justifyContent:"center", zIndex:50, padding:20,
        }}>
          <div style={{
            background:"#fff", width:"100%", maxWidth:540,
            borderRadius:20, boxShadow:"0 32px 80px rgba(0,0,0,0.2)",
            overflow:"hidden", fontFamily:"'DM Sans','Segoe UI',sans-serif",
          }}>
            {/* Modal header */}
            <div style={{
              padding:"20px 24px", borderBottom:"1px solid #F0F4F8",
              display:"flex", alignItems:"center", justifyContent:"space-between",
              background:"#FAFBFC",
            }}>
              <div>
                <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:"#111827" }}>Edit Task</h2>
                <span style={{ fontSize:12, color:"#9CA3AF" }}>Task #{selectedTask.id}</span>
              </div>
              <button onClick={() => setSelectedTask(null)} style={{
                background:"#F1F5F9", border:"none", borderRadius:8,
                width:32, height:32, fontSize:18, cursor:"pointer",
                color:"#64748B", display:"flex", alignItems:"center", justifyContent:"center",
              }}>×</button>
            </div>

            {/* Modal body */}
            <div style={{ padding:"22px 24px", display:"flex", flexDirection:"column", gap:16 }}>

              {/* Title */}
              <div>
                <Label>Title</Label>
                <input type="text" value={editTask?.title || ""}
                  onChange={e => setEditTask({ ...editTask, title: e.target.value })}
                  style={{ ...inputStyle, fontSize:14, fontWeight:500 }}
                  onFocus={e => e.target.style.borderColor="#38BDF8"}
                  onBlur={e => e.target.style.borderColor="#E5E7EB"}
                />
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <textarea rows={3} value={editTask?.description || ""}
                  onChange={e => setEditTask({ ...editTask, description: e.target.value })}
                  style={{ ...inputStyle, fontSize:13, resize:"vertical", lineHeight:1.6 }}
                  onFocus={e => e.target.style.borderColor="#38BDF8"}
                  onBlur={e => e.target.style.borderColor="#E5E7EB"}
                />
              </div>

              {/* Priority + Status side by side */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <Label>Priority</Label>
                  <select value={editTask?.priority || "MEDIUM"}
                    onChange={e => setEditTask({ ...editTask, priority: e.target.value })}
                    style={{ ...inputStyle, fontSize:13 }}
                  >
                    <option value="LOW">🟢 Low</option>
                    <option value="MEDIUM">🟡 Medium</option>
                    <option value="HIGH">🔴 High</option>
                  </select>
                </div>
                <div>
                  <Label>Status</Label>
                  <select value={editTask?.status || "TODO"}
                    onChange={e => setEditTask({ ...editTask, status: e.target.value })}
                    style={{ ...inputStyle, fontSize:13 }}
                  >
                    <option value="TODO">📋 Todo</option>
                    <option value="IN_PROGRESS">🔄 In Progress</option>
                    <option value="DONE">✅ Done</option>
                  </select>
                </div>
              </div>

              {/* Assignee + Due date side by side */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <Label>Assignee</Label>
                  <select value={editTask?.assigned_to || ""}
                    onChange={e => setEditTask({ ...editTask, assigned_to: Number(e.target.value) || null })}
                    style={{ ...inputStyle, fontSize:13 }}
                  >
                    <option value="">Unassigned</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <input type="date"
                    value={editTask?.due_date ? editTask.due_date.split("T")[0] : ""}
                    onChange={e => setEditTask({ ...editTask, due_date: e.target.value || null })}
                    style={{ ...inputStyle, fontSize:13 }}
                    onFocus={e => e.target.style.borderColor="#38BDF8"}
                    onBlur={e => e.target.style.borderColor="#E5E7EB"}
                  />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{
              padding:"14px 24px", borderTop:"1px solid #F0F4F8",
              display:"flex", gap:10, justifyContent:"flex-end", background:"#FAFBFC",
            }}>
              <button onClick={() => setSelectedTask(null)} style={{
                background:"none", border:"1.5px solid #E5E7EB", borderRadius:8,
                padding:"9px 20px", fontSize:13, fontWeight:600, color:"#6B7280",
                cursor:"pointer", fontFamily:"inherit",
              }}>Cancel</button>
              <button onClick={async () => {
                try {
                  await updateTask(editTask.id, {
                    title:       editTask.title,
                    description: editTask.description,
                    priority:    editTask.priority,
                    status:      editTask.status || "TODO",
                    assigned_to: editTask.assigned_to || null,
                    due_date:    editTask.due_date || null,
                  });
                  boards.forEach(b => fetchTasks(b.id));
                  setSelectedTask(null);
                } catch(e) { console.log(e); }
              }} style={primaryBtn}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
}
