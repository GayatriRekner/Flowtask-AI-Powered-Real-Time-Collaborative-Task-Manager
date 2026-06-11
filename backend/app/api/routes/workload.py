from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.task import Task
from app.models.workspace_member import WorkspaceMember
from app.models.user import User
from app.models.board import Board
from groq import Groq
import os
from datetime import datetime, timezone

router = APIRouter()

# Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))



def calculate_load_score(tasks: list) -> float:
    if not tasks:
        return 0.0

    now = datetime.now(timezone.utc)
    total_score = 0.0

    priority_weight = {
        "HIGH":   1.0,
        "MEDIUM": 0.6,
        "LOW":    0.3
    }

    for task in tasks:
        # skip completed tasks
        if task.status == "DONE":
            continue

        p = priority_weight.get(task.priority, 0.6)

        # urgency multiplier based on due date
        urgency = 1.0  # default — no due date, treat as normal
        if task.due_date:
            due = task.due_date
            if due.tzinfo is None:
                due = due.replace(tzinfo=timezone.utc)
            days_left = (due - now).days

            if days_left < 0:
                urgency = 2.0    # overdue — double the weight
            elif days_left <= 1:
                urgency = 1.7    # due today/tomorrow
            elif days_left <= 3:
                urgency = 1.4    # due very soon
            elif days_left <= 7:
                urgency = 1.2    # due this week
            else:
                urgency = 1.0    # not urgent

        # each task contributes: priority × urgency
        total_score += p * urgency

   
    MAX_CAPACITY = 8.0
    score = min(total_score / MAX_CAPACITY, 1.0)

    return round(score, 3)
def generate_reason(from_name, from_score, to_name, to_score) -> str:
    try:

        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"{from_name} has a workload score of {int(from_score*100)}% "
                        f"with many high priority tasks. {to_name} has a score of "
                        f"{int(to_score*100)}% and has available capacity. "
                        f"Write exactly one short sentence explaining why reassigning "
                        f"a task from {from_name} to {to_name} makes sense."
                    )
                }
            ],
            max_tokens=60
        )

        
        return response.choices[0].message.content.strip()

    except Exception as e:
        print("GROQ ERROR:", e)

        return (
            f"{from_name} is overloaded at {int(from_score*100)}%. "
            f"{to_name} has capacity at {int(to_score*100)}%."
        )


def get_suggestions(members_with_scores: list) -> list:
    suggestions = []
    overloaded = [m for m in members_with_scores if m["score"] >= 0.60]
    available  = [m for m in members_with_scores if m["score"] < 0.35]

    for member in overloaded:
        if available:
            best = min(available, key=lambda x: x["score"])
            reason = generate_reason(
                member["name"], member["score"],
                best["name"],   best["score"]
            )
            suggestions.append({
                "from_user_id": member["user_id"],
                "from_name":    member["name"],
                "to_user_id":   best["user_id"],
                "to_name":      best["name"],
                "from_score":   member["score"],
                "to_score":     best["score"],
                "reason":       reason
            })

    return suggestions


@router.get("/workload/{workspace_id}")
def get_workload(
    workspace_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    members = (
        db.query(WorkspaceMember, User)
        .join(User, User.id == WorkspaceMember.user_id)
        .filter(WorkspaceMember.workspace_id == workspace_id)
        .all()
    )

    board_ids = [
        b.id for b in db.query(Board)
        .filter(Board.workspace_id == workspace_id).all()
    ]

    result = []
    for member, user in members:
        tasks = (
            db.query(Task)
            .filter(
                Task.assigned_to == user.id,
                Task.board_id.in_(board_ids)
            )
            .all()
        )

        score = calculate_load_score(tasks)
        result.append({
            "user_id":    user.id,
            "name":       user.name,
            "score":      score,
            "task_count": len(tasks),
        })

    suggestions = get_suggestions(result)
    return {"members": result, "suggestions": suggestions}