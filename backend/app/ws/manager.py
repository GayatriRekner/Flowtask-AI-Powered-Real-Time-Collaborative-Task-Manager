import json
from typing import Dict
from fastapi import WebSocket
 
 
class ConnectionManager:
    def __init__(self):
        # user_id (int) -> list of active WebSocket connections
        # (one user can have multiple tabs open)
        self.active: Dict[int, list[WebSocket]] = {}
 
    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active:
            self.active[user_id] = []
        self.active[user_id].append(websocket)
        print("ACTIVE CONNECTIONS:", self.active)
 
    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active:
            self.active[user_id] = [
                ws for ws in self.active[user_id] if ws is not websocket
            ]
            if not self.active[user_id]:
                del self.active[user_id]
 
    async def send_to_user(self, user_id: int, payload: dict):
        """Send a JSON payload to all connections of a specific user."""
        print("SENDING TO USER:", user_id)
        print("ACTIVE USERS:", self.active.keys())
        sockets = self.active.get(user_id, [])
        print("FOUND SOCKETS:", len(sockets))
        dead = []
        for ws in sockets:
            try:
                await ws.send_text(json.dumps(payload))
            except Exception:
                dead.append(ws)
        # clean up dead sockets
        for ws in dead:
            self.disconnect(ws, user_id)
 
    async def broadcast(self, payload: dict):
        """Broadcast to every connected user."""
        for user_id in list(self.active.keys()):
            await self.send_to_user(user_id, payload)
 
 
# singleton — import this everywhere
manager = ConnectionManager()