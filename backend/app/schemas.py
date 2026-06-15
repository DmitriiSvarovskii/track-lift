from typing import Any, Literal

from pydantic import BaseModel, Field


class TelegramAuthRequest(BaseModel):
    id_token: str | None = Field(default=None, alias="idToken")
    demo_user: dict[str, Any] | None = Field(default=None, alias="demoUser")


class UserOut(BaseModel):
    id: str
    telegramId: str
    displayName: str
    username: str | None = None
    avatarUrl: str | None = None
    createdAt: str
    updatedAt: str


class AuthSessionOut(BaseModel):
    userId: str
    lastActivityAt: str
    expiresAt: str


class AuthResponse(BaseModel):
    user: UserOut
    session: AuthSessionOut


ExerciseType = Literal["strength", "cardio", "stretching", "other"]


class TrainingDataIn(BaseModel):
    exercises: list[dict[str, Any]]
    programs: list[dict[str, Any]]
    sessions: list[dict[str, Any]]


class TrainingDataOut(TrainingDataIn):
    pass
