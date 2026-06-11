from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, WebSocket
from app.core.database import engine, Base
from app.models.user import User
from app.models.workspace import Workspace
from app.models.board import Board
from app.models.task import Task
from app.models.column import BoardColumn
from app.models.workspace_member import WorkspaceMember
from app.models.activity_log import ActivityLog
from app.models.notification import Notification
from app.api.routes.auth import router as auth_router
from app.api.routes.workspace import router as workspace_router
from app.api.routes.notifications import router as notif_router
from app.api.routes.board import router as board_router
from app.api.routes.task import router as task_router
from app.api.routes.column import router as column_router
from app.api.routes.member import router as member_router
from app.api.routes.activity import router as activity_router
from app.api.routes import workload
from app.ws.manager import manager
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import ai



Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://flowtask-ai-powered-real-time-colla.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(workspace_router)
app.include_router(notif_router)
app.include_router(board_router)
app.include_router(task_router)
app.include_router(column_router)
app.include_router(member_router)
app.include_router(activity_router)
app.include_router(workload.router, prefix="/api", tags=["workload"])
app.include_router(ai.router, prefix="/api", tags=["ai"])

@app.get("/")
def home():
    return {"message": "Server Running"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print("🔥 WEBSOCKET HIT")
    await manager.connect(websocket)
    await websocket.send_text("HELLO FROM SERVER")
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"Message: {data}")
    except:
        manager.disconnect(websocket)