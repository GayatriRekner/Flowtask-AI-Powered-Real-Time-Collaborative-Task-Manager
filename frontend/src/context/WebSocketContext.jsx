// context/WebSocketContext.jsx

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react"

const WebSocketContext = createContext(null)

export function WebSocketProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [connected, setConnected]         = useState(false)
  const socketRef       = useRef(null)
  const reconnectTimer  = useRef(null)

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    try {
      const res  = await fetch("https://flowtask-ai-powered-real-time.onrender.com/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unread_count    || 0)
    } catch (e) {
      console.log("[notifications] fetch failed", e)
    }
  }, [])

  const connect = useCallback(() => {
    const token = localStorage.getItem("token")

    // No token yet — user hasn't logged in
    if (!token) return

    // Already open — don't open a second socket
    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
       socketRef.current.readyState === WebSocket.CONNECTING)
    ) return

    // Close stale socket
    if (socketRef.current) {
      socketRef.current.onclose = null
      socketRef.current.close()
    }

    console.log("[WS] Connecting…")
    const ws = new WebSocket(`wss://flowtask-ai-powered-real-time.onrender.com/ws?token=${token}`)
    socketRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      console.log("[WS] Connected ✓")
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      fetchNotifications()
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "notification") {
          setNotifications(prev => [{
            id:         data.id,
            message:    data.message,
            link:       data.link || null,
            is_read:    false,
            created_at: data.created_at,
          }, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      } catch {
        // plain string — ignore
      }
    }

    ws.onclose = () => {
      setConnected(false)
      const token = localStorage.getItem("token")
      if (token) {
        console.log("[WS] Disconnected — reconnecting in 3s")
        reconnectTimer.current = setTimeout(connect, 3000)
      }
    }

    ws.onerror = (err) => {
      console.log("[WS] Error", err)
      ws.close()
    }
  }, [fetchNotifications])

  // On mount — connect immediately (handles page refresh while logged in)
  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      if (socketRef.current) {
        socketRef.current.onclose = null
        socketRef.current.close()
      }
    }
  }, [connect])

  // KEY FIX — listen for the custom event that Login.jsx fires
  // after storing the token, so we connect right after login
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === "token_set") {
        console.log("[WS] Token detected — connecting")
        connect()
      }
      if (e.detail === "token_removed") {
        if (socketRef.current) {
          socketRef.current.onclose = null
          socketRef.current.close()
        }
        setConnected(false)
        setNotifications([])
        setUnreadCount(0)
      }
    }
    window.addEventListener("auth_change", handler)
    return () => window.removeEventListener("auth_change", handler)
  }, [connect])

  const markOneRead = async (id) => {
    const token = localStorage.getItem("token")
    try {
      await fetch(`https://flowtask-ai-powered-real-time.onrender.com/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (e) { console.log(e) }
  }

  const markAllRead = async () => {
    const token = localStorage.getItem("token")
    try {
      await fetch("https://flowtask-ai-powered-real-time.onrender.com/notifications/read-all", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (e) { console.log(e) }
  }

  const send = (msg) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(msg)
    }
  }

  return (
    <WebSocketContext.Provider value={{
      notifications, unreadCount, connected,
      markOneRead, markAllRead, send,
    }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext)
  if (!ctx) throw new Error("useWebSocket must be used inside <WebSocketProvider>")
  return ctx
}
