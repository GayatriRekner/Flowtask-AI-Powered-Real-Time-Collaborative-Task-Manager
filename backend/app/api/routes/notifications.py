from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.api.routes.workspace import get_db
from app.models.user import User
from app.models.notification import Notification
from app.ws.manager import manager
from app.core.deps import get_current_user
from app.core.security import SECRET_KEY, ALGORITHM
from app.core.security import verify_token

router = APIRouter()


async def get_current_user_from_token(
    token: str,
    db: Session
):

    payload = verify_token(token)

    if payload is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = db.query(User).filter(
        User.id == payload["user_id"]
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user
@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    db: Session = Depends(get_db),
):

    try:
        token = websocket.query_params.get("token")
        print("TOKEN:", token)

        user = await get_current_user_from_token(
            token,
            db
        )

        print("USER:", user.id)

    except Exception as e:
        print("WEBSOCKET ERROR:", repr(e))

        await websocket.close(code=1008)
        return

    await manager.connect(
        websocket,
        user.id
    )

    try:

        while True:

            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(
            websocket,
            user.id
        )


@router.get("/notifications")
def get_notifications(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    notifications = db.query(Notification).filter(
        Notification.user_id == current_user["user_id"]
    ).order_by(
        Notification.created_at.desc()
    ).limit(50).all()

    return {

        "notifications": [

            {
                "id": n.id,
                "message": n.message,
                "link": n.link,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat(),
            }

            for n in notifications
        ],

        "unread_count": sum(
            1 for n in notifications
            if not n.is_read
        )
    }


@router.patch("/notifications/{notification_id}/read")
def mark_one_read(
    notification_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user["user_id"]
    ).first()

    if notif:

        notif.is_read = True

        db.commit()

    return {
        "ok": True
    }


@router.patch("/notifications/read-all")
def mark_all_read(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    notifications = db.query(Notification).filter(
        Notification.user_id == current_user["user_id"],
        Notification.is_read == False
    ).all()

    for notif in notifications:

        notif.is_read = True

    db.commit()

    return {
        "ok": True
    }


async def notify_user(
    db: Session,
    user_id: int,
    message: str,
    link: str | None = None,
):

    notif = Notification(
        user_id=user_id,
        message=message,
        link=link
    )

    db.add(notif)

    db.commit()

    db.refresh(notif)

    await manager.send_to_user(
        user_id,
        {
            "type": "notification",
            "id": notif.id,
            "message": notif.message,
            "link": notif.link,
            "created_at":
                notif.created_at.isoformat(),
        }
    )