import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from fastapi import Cookie, Depends, HTTPException, Response, status
from jwt import PyJWKClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import Settings, get_settings
from .db import get_db
from .models import AuthSession, User

COOKIE_NAME = "track_lift_session"
SESSION_TTL = timedelta(days=14)
TELEGRAM_ISSUER = "https://oauth.telegram.org"
TELEGRAM_JWKS_URL = "https://oauth.telegram.org/.well-known/jwks.json"


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def hash_token(token: str, secret: str) -> str:
    return hmac.new(secret.encode("utf-8"), token.encode("utf-8"), hashlib.sha256).hexdigest()


def create_raw_session_token() -> str:
    return secrets.token_urlsafe(48)


def set_session_cookie(response: Response, token: str, settings: Settings) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=int(SESSION_TTL.total_seconds()),
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/",
    )


def clear_session_cookie(response: Response, settings: Settings) -> None:
    response.delete_cookie(key=COOKIE_NAME, path="/", secure=settings.cookie_secure, samesite="lax")


def create_session(db: Session, user_id: str, response: Response, settings: Settings) -> AuthSession:
    token = create_raw_session_token()
    now = utc_now()
    session = AuthSession(
        user_id=user_id,
        token_hash=hash_token(token, settings.session_secret),
        last_activity_at=now,
        expires_at=now + SESSION_TTL,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    set_session_cookie(response, token, settings)
    return session


def touch_session(db: Session, session: AuthSession) -> AuthSession:
    now = utc_now()
    session.last_activity_at = now
    session.expires_at = now + SESSION_TTL
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def verify_telegram_id_token(id_token: str, settings: Settings) -> dict[str, Any]:
    try:
        jwk_client = PyJWKClient(TELEGRAM_JWKS_URL)
        signing_key = jwk_client.get_signing_key_from_jwt(id_token)
        return jwt.decode(
            id_token,
            signing_key.key,
            algorithms=["RS256", "ES256", "EdDSA"],
            audience=settings.telegram_client_id,
            issuer=TELEGRAM_ISSUER,
            options={"require": ["exp", "iat", "iss", "aud", "sub"]},
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Telegram token") from exc


def get_current_session(
    track_lift_session: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> AuthSession:
    if not track_lift_session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    token_hash = hash_token(track_lift_session, settings.session_secret)
    session = db.scalar(select(AuthSession).where(AuthSession.token_hash == token_hash))

    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session not found")

    if session.expires_at <= utc_now():
        db.delete(session)
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")

    return touch_session(db, session)


def get_current_user(
    session: AuthSession = Depends(get_current_session),
    db: Session = Depends(get_db),
) -> User:
    user = db.get(User, session.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
