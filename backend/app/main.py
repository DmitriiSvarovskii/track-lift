from datetime import datetime
from typing import Any

from fastapi import Cookie, Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .auth import (
    COOKIE_NAME,
    clear_session_cookie,
    create_session,
    get_current_session,
    get_current_user,
    hash_token,
    verify_telegram_id_token,
)
from .config import Settings, get_settings
from .db import get_db, init_db
from .models import AuthSession, TrainingData, User
from .schemas import AuthResponse, TelegramAuthRequest, TrainingDataIn, TrainingDataOut
from .training_seed import create_initial_training_data

app = FastAPI(title="Track Lift API")

settings = get_settings()
if settings.cors_origin_list:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.on_event("startup")
def on_startup() -> None:
    init_db()


def iso(value: datetime) -> str:
    return value.isoformat()


def user_out(user: User) -> dict[str, Any]:
    return {
        "id": user.id,
        "telegramId": user.telegram_id,
        "displayName": user.display_name,
        "username": user.username,
        "avatarUrl": user.avatar_url,
        "createdAt": iso(user.created_at),
        "updatedAt": iso(user.updated_at),
    }


def session_out(session: AuthSession) -> dict[str, str]:
    return {
        "userId": session.user_id,
        "lastActivityAt": iso(session.last_activity_at),
        "expiresAt": iso(session.expires_at),
    }


def get_or_create_training_data(db: Session, user_id: str) -> TrainingData:
    training_data = db.get(TrainingData, user_id)
    if training_data:
        return training_data

    training_data = TrainingData(user_id=user_id, data=create_initial_training_data())
    db.add(training_data)
    db.commit()
    db.refresh(training_data)
    return training_data


def upsert_user_from_claims(db: Session, claims: dict[str, Any]) -> User:
    telegram_id = str(claims["sub"])
    user = db.scalar(select(User).where(User.telegram_id == telegram_id))
    display_name = claims.get("name") or claims.get("given_name") or claims.get("preferred_username") or "Telegram user"

    if not user:
        user = User(telegram_id=telegram_id, display_name=display_name)

    user.display_name = display_name
    user.username = claims.get("preferred_username") or claims.get("username")
    user.avatar_url = claims.get("picture") or claims.get("photo_url")
    db.add(user)
    db.commit()
    db.refresh(user)
    get_or_create_training_data(db, user.id)
    return user


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/auth/telegram", response_model=AuthResponse)
def telegram_auth(
    payload: TelegramAuthRequest,
    response: Response,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    if payload.id_token:
        claims = verify_telegram_id_token(payload.id_token, settings)
    elif settings.insecure_demo_login and payload.demo_user:
        claims = {
            "sub": str(payload.demo_user.get("id") or "demo-telegram-user"),
            "name": payload.demo_user.get("name") or "Demo Athlete",
            "preferred_username": payload.demo_user.get("username"),
            "picture": payload.demo_user.get("picture"),
        }
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Telegram id_token is required")

    user = upsert_user_from_claims(db, claims)
    session = create_session(db, user.id, response, settings)
    return {"user": user_out(user), "session": session_out(session)}


@app.get("/api/auth/me", response_model=AuthResponse)
def me(
    user: User = Depends(get_current_user),
    session: AuthSession = Depends(get_current_session),
) -> dict[str, Any]:
    return {"user": user_out(user), "session": session_out(session)}


@app.post("/api/auth/touch", response_model=AuthResponse)
def touch(
    user: User = Depends(get_current_user),
    session: AuthSession = Depends(get_current_session),
) -> dict[str, Any]:
    return {"user": user_out(user), "session": session_out(session)}


@app.post("/api/auth/logout")
def logout(
    response: Response,
    track_lift_session: str | None = Cookie(default=None, alias=COOKIE_NAME),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict[str, str]:
    if track_lift_session:
        token_hash = hash_token(track_lift_session, settings.session_secret)
        session = db.scalar(select(AuthSession).where(AuthSession.token_hash == token_hash))
        if session:
            db.delete(session)
            db.commit()

    clear_session_cookie(response, settings)
    return {"status": "ok"}


@app.get("/api/training", response_model=TrainingDataOut)
def get_training(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    return get_or_create_training_data(db, user.id).data


@app.put("/api/training", response_model=TrainingDataOut)
def save_training(
    payload: TrainingDataIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    training_data = get_or_create_training_data(db, user.id)
    training_data.data = payload.model_dump()
    db.add(training_data)
    db.commit()
    db.refresh(training_data)
    return training_data.data
