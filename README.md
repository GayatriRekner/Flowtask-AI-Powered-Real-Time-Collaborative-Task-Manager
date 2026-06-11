# 🗂️ Flowtask — AI-Powered Real-Time Collaborative Task Manager

A full-stack, real-time collaborative task management application with AI-powered features built using FastAPI, React, and WebSockets.

---

## 🌐 Live Application

Experience FlowTask live:

🔗 https://flowtask-ai-powered-real-time-colla.vercel.app

---
## 📸 Screenshots

### Login
![Login](screenshots/login.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Board — Kanban with AI task generator
![Board](screenshots/board.png)

### Team — AI Workload Balancer
![Team](screenshots/team.png)

### Activity Feed
![Activity](screenshots/activity.png)

## 🚀 Features

### 📋 Task Management
- Create, update, delete tasks with title, description, priority, status, and due dates
- Drag and drop tasks between columns (Kanban-style)
- Inline status updates — Todo / In Progress / Done
- Due date indicators with overdue and due-soon highlighting
- Task assignment to workspace members

### 🤖 AI Features (powered by Groq + LLaMA 3.3 70B)
- **AI Task Description Generator** — Type a task title and AI auto-fills the description and suggests priority
- **AI Workload Balancer** — Analyzes team task distribution in real time, scores each member's load, and generates natural language reassignment suggestions when someone is overloaded

### 🔔 Real-Time Notifications
- WebSocket-powered live notifications
- Notified when assigned a task or a task is moved
- Unread count badge, mark one/all as read
- Notification storage in database
- Auto-reconnect on disconnect

### 👥 Workspace & Team Management
- Create and manage multiple workspaces
- Invite existing members by email
- Team page with per-member task progress and AI load scores
- AI rebalancing suggestions panel
- Role-based workspace membership (Owner / Member)

### 📊 Board Management
- Multiple boards per workspace
- Custom Kanban columns
- Board-level task overview

### 📝 Activity Tracking
- Live activity feed showing task creation, updates, and moves
- Timeline view with timestamps and user attribution

---
## 🎯 Key Highlights

- Real-time collaboration using WebSockets
- AI-powered task generation with LLaMA 3.3 70B
- AI workload balancing with explainable scoring
- Multi-workspace team management
- Role-based access control (Owner / Member)
- FastAPI + React full-stack architecture


## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| SQLAlchemy | ORM for database models |
| MySQL | Relational database |
| JWT (PyJWT) | Authentication |
| WebSockets | Real-time notifications |
| Groq API | AI features (LLaMA 3.3 70B) |
| Uvicorn | ASGI server |
| python-dotenv | Environment variable management |
| passlib + bcrypt | Password hashing |

### Frontend
| Technology | Purpose |
|---|---|
| React | UI framework |
| React Router | Client-side routing |
| @dnd-kit | Drag and drop |
| Axios | HTTP client |
| WebSocket API | Real-time updates |

---

## 📁 Project Structure

```
flowtask/
├── backend/
│   └── app/
│       ├── api/routes/
│       │   ├── auth.py
│       │   ├── workspace.py
│       │   ├── board.py
│       │   ├── column.py
│       │   ├── task.py
│       │   ├── member.py
│       │   ├── notifications.py
│       │   ├── activity.py
│       │   ├── workload.py           # AI Workload Balancer
│       │   └── ai.py                 # AI Task Generator
│       ├── models/
│       │   ├── user.py
│       │   ├── workspace.py
│       │   ├── workspace_member.py
│       │   ├── board.py
│       │   ├── column.py
│       │   ├── task.py
│       │   ├── notification.py
│       │   └── activity_log.py
│       ├── schemas/
│       │   ├── user_schema.py
│       │   ├── workspace_schema.py
│       │   ├── workspace_member_schema.py
│       │   ├── board_schema.py
│       │   ├── column_schema.py
│       │   ├── task_schema.py
│       │   └── member_schema.py
│       ├── core/
│       │   ├── database.py
│       │   ├── deps.py
│       │   └── security.py
│       ├── ws/
│       │   └── manager.py            # User-specific WebSocket manager
│       └── main.py
├── frontend/
│   └── src/
│       ├── api/
│       │   └── axios.js
│       ├── components/
│       │   └── NotificationBell.jsx
│       ├── context/
│       │   └── WebSocketContext.jsx
│       ├── layouts/
│       │   └── DashboardLayout.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Board.jsx
│       │   ├── Team.jsx
│       │   ├── MyTasks.jsx
│       │   ├── Activity.jsx
│       │   ├── Login.jsx
│       │   └── Register.jsx
│       ├── routes/
│       ├── services/
│       │   ├── workspaceService.js
│       │   ├── workloadService.js
│       │   └── authService.js
│       └── App.jsx
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL
- Groq API key — free at [console.groq.com](https://console.groq.com)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder:
```env
DATABASE_URL=mysql+pymysql://username:password@localhost/taskmanager
SECRET_KEY=your_secret_key_here
GROQ_API_KEY=your_groq_api_key_here
```

```bash
# Run the server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Database Setup

```sql
CREATE DATABASE taskmanager;
```

Tables are auto-created on first server start via SQLAlchemy's `create_all`.

If you added due dates, status, or activity details to an existing database run:
```sql
ALTER TABLE tasks ADD COLUMN status VARCHAR(50) DEFAULT 'TODO';
ALTER TABLE tasks ADD COLUMN due_date DATETIME NULL;
ALTER TABLE activity_logs ADD COLUMN details VARCHAR(500) NULL;
ALTER TABLE activity_logs ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
```

---

## 🤖 AI Features — How They Work

### AI Task Description Generator
When a user types a task title and clicks **✨ AI Fill Description & Priority**, the backend sends the title to the Groq API. The LLaMA 3.3 70B model generates a 2-3 sentence description and suggests an appropriate priority (HIGH / MEDIUM / LOW). The result auto-fills the form — saving time and encouraging better task documentation.

### AI Workload Balancer
Every time the Team page loads, the backend:
1. Fetches all active (non-done) tasks per member
2. Calculates a load score using a weighted formula:
   ```
   score = (complexity × 0.55) + (wip_count × 0.35) + (deadline_urgency × 0.10)
   ```
   - **Complexity** — based on task priority (HIGH=1.0, MEDIUM=0.5, LOW=0.2)
   - **WIP count** — number of active tasks normalized to 8
   - **Deadline urgency** — overdue tasks score 1.0, due tomorrow 0.9, due this week 0.3
3. Flags members with score ≥ 0.55 as overloaded
4. Finds the member with the lowest score as the best candidate for reassignment
5. Calls Groq to generate a natural language reason for the suggestion
6. Returns scores + suggestions to the frontend

The scoring logic is fully deterministic — Groq is only used to generate the human-readable explanation, making the feature reliable and explainable.

---

## 📡 Real-Time Architecture

WebSockets power live notifications using a user-specific connection manager (`ws/manager.py`):

```
User connects → token verified → user_id registered in manager
Task assigned/moved → notify_user() called → saves to DB + sends via WebSocket
Frontend WebSocketContext → receives message → updates notification bell instantly
```

Each user only receives their own notifications. The frontend auto-reconnects on disconnect with a 3-second retry.

---

## 📸 Pages

| Page | Description |
|---|---|
| Dashboard | All workspaces with member avatars and task counts |
| Board | Kanban board with drag-and-drop, AI task creation, inline status |
| Team | Member cards with AI load scores and rebalancing suggestions |
| My Tasks | Personal task list with status selector, due dates, priority filters |
| Activity | Timeline of all task actions with user attribution and timestamps |

---

## 🔐 Authentication

- JWT-based authentication
- Tokens stored in localStorage
- Protected routes on frontend and backend
- Passwords hashed with bcrypt before storage
- HTTP 401 returned on invalid credentials

---

## 📝 API Endpoints

### Auth
- `POST /register` — Register new user
- `POST /login` — Login and receive JWT token
- `GET /profile` — Get current user profile

### Workspace
- `GET /workspaces` — Get all workspaces for current user (owned + invited)
- `POST /workspace` — Create workspace
- `DELETE /workspace/{id}` — Delete workspace
- `POST /workspace/{id}/invite` — Invite member by email
- `GET /workspace/{id}/members` — Get workspace members
- `GET /workspace/{id}/tasks` — Get all tasks in workspace

### Boards & Columns
- `GET /boards/{workspace_id}` — Get boards
- `POST /board` — Create board
- `DELETE /boards/{id}` — Delete board
- `GET /columns/{board_id}` — Get columns
- `POST /column` — Create column
- `DELETE /column/{id}` — Delete column

### Tasks
- `POST /task` — Create task
- `GET /tasks/{board_id}` — Get tasks for a board
- `GET /my-tasks` — Get tasks assigned to current user
- `GET /tasks/count` — Get count of active (non-done) tasks
- `PUT /task/{id}` — Update task
- `PUT /task/{id}/move` — Move task to another column
- `DELETE /task/{id}` — Delete task

### AI
- `POST /api/ai/generate-task` — Generate task description and priority from title
- `GET /api/workload/{workspace_id}` — Get team workload scores and suggestions

### Notifications
- `GET /notifications` — Get notifications for current user
- `PATCH /notifications/{id}/read` — Mark one as read
- `PATCH /notifications/read-all` — Mark all as read

### Activity
- `GET /activities/{workspace_id}` — Get activity feed for a workspace

### WebSocket
- `WS /ws?token={jwt}` — Connect for real-time notifications

---

## 👩‍💻 Author

Built as a portfolio project to demonstrate full-stack development with real-time features and AI integration.
