import uuid
from datetime import timedelta
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr

from app.models.user import User
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.core.config import get_settings
from app.services.email_service import send_welcome_email

router = APIRouter(prefix="/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str


@router.post("/signup")
async def signup(req: SignupRequest):
    """Create a new email account."""
    existing = await User.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        is_anonymous=False,
    )
    await user.insert()

    token = create_access_token({"sub": str(user.id)})

    # Send welcome email (best-effort)
    await send_welcome_email(req.email)

    return {
        "token": token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "is_anonymous": False,
            "created_at": user.created_at.isoformat(),
        },
    }


@router.post("/login")
async def login(req: LoginRequest):
    """Log in with email and password."""
    user = await User.find_one({"email": req.email})
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})

    return {
        "token": token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "is_anonymous": False,
            "created_at": user.created_at.isoformat(),
        },
    }


@router.post("/anonymous")
async def anonymous_signup():
    """Create an anonymous session."""
    anonymous_id = str(uuid.uuid4())

    user = User(
        is_anonymous=True,
        session_token=anonymous_id,
    )
    await user.insert()

    token = create_access_token({"sub": str(user.id), "anonymous_id": anonymous_id})

    return {
        "token": token,
        "anonymous_id": anonymous_id,
        "user": {
            "id": str(user.id),
            "is_anonymous": True,
            "created_at": user.created_at.isoformat(),
        },
    }


@router.post("/refresh")
async def refresh_token(token_data: dict = Depends(lambda: None)):
    """Refresh an existing token. (Placeholder)"""
    # TODO: Implement refresh with proper dependency injection
    return {"message": "Token refresh endpoint"}


@router.post("/logout")
async def logout():
    """Log out (invalidate token)."""
    # Stateless JWT — client-side token removal
    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    """Send password reset email."""
    user = await User.find_one({"email": req.email})
    if not user:
        # Don't reveal if email exists or not
        return {"message": "If the email exists, a reset link has been sent."}

    reset_token = create_access_token(
        {"sub": str(user.id), "purpose": "reset"},
        expires_delta=timedelta(hours=1),
    )

    reset_link = f"/auth/reset-password?token={reset_token}"
    await send_password_reset(req.email, reset_link)

    return {"message": "If the email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    """Reset password using token."""
    payload = decode_access_token(req.token)
    if not payload or payload.get("purpose") != "reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = await User.get(payload["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(req.password)
    await user.save()

    return {"message": "Password reset successfully"}
