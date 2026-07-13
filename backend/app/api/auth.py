import re
import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr, field_validator

from app.models.user import User
from app.api.deps import get_current_user_id, get_or_404
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.core.config import get_settings
from app.core.rate_limit import limiter, auth_limiter
from app.services.email_service import send_welcome_email, send_password_reset

from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

bearer_scheme = HTTPBearer(auto_error=False)

router = APIRouter(prefix="/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/signup")
@auth_limiter.limit("5/minute")
async def signup(req: SignupRequest, request: Request):
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

    token = create_access_token({"sub": str(user.id)}, purpose="access")

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
@auth_limiter.limit("5/minute")
async def login(req: LoginRequest, request: Request):
    """Log in with email and password."""
    user = await User.find_one({"email": req.email})
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)}, purpose="access")

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
@limiter.limit("10/minute")
async def anonymous_signup(request: Request):
    """Create an anonymous session."""
    anonymous_id = str(uuid.uuid4())

    user = User(
        is_anonymous=True,
        session_token=anonymous_id,
    )
    await user.insert()

    token = create_access_token({"sub": str(user.id), "anonymous_id": anonymous_id}, purpose="access")

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
@limiter.limit("10/minute")
async def refresh_token(
    request: Request,
    user_id: str = Depends(get_current_user_id),
):
    """Issue a new JWT for an authenticated user (stateless refresh)."""
    user = await get_or_404(User, user_id, "User not found")
    token = create_access_token({"sub": str(user.id)}, purpose="access")
    return {
        "token": token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "is_anonymous": user.is_anonymous,
            "created_at": user.created_at.isoformat(),
        },
    }


class ClaimAccountRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


@router.post("/claim-account")
@limiter.limit("3/minute")
async def claim_account(
    req: ClaimAccountRequest,
    request: Request,
    user_id: str = Depends(get_current_user_id),
):
    """
    Convert an anonymous user into a full email+password account.
    All existing data (check-ins, journal, debts, goals) stays attached
    to the same user document — nothing is lost.
    """
    user = await get_or_404(User, user_id, "User not found")

    if not user.is_anonymous:
        raise HTTPException(status_code=400, detail="Account already has email")

    # Check no other user has this email
    existing = await User.find_one({"email": req.email})
    if existing and str(existing.id) != user_id:
        raise HTTPException(status_code=409, detail="Email already registered")

    # Convert the SAME user document — same _id, all data preserved
    user.email = req.email
    user.password_hash = hash_password(req.password)
    user.is_anonymous = False
    user.updated_at = datetime.now(timezone.utc)
    await user.save()

    # Issue fresh token
    token = create_access_token({"sub": str(user.id)}, purpose="access")

    # Send welcome email (best-effort)
    first_name = re.split(r"[._]", req.email.split("@")[0])[0].capitalize()
    await send_welcome_email(req.email, first_name)

    return {
        "token": token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "is_anonymous": False,
            "created_at": user.created_at.isoformat(),
        },
    }


@router.post("/change-password")
@limiter.limit("5/minute")
async def change_password(
    req: ChangePasswordRequest,
    request: Request,
    user_id: str = Depends(get_current_user_id),
):
    """Change password for authenticated user."""
    user = await get_or_404(User, user_id, "User not found")

    if not user.password_hash:
        raise HTTPException(status_code=400, detail="No password set for this account")

    if not verify_password(req.current_password, user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    user.password_hash = hash_password(req.new_password)
    await user.save()

    return {"message": "Password changed successfully"}


@router.post("/logout")
@limiter.limit("10/minute")
async def logout(
    request: Request,
    user_id: str = Depends(get_current_user_id),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Log out — revoke the current JWT so it can't be used again."""
    from app.models.revoked_token import RevokedToken

    payload = decode_access_token(credentials.credentials)
    jti = payload.get("jti") if payload else None
    exp = payload.get("exp") if payload else None

    if jti:
        revoked = RevokedToken(
            id=jti,
            exp=datetime.fromtimestamp(exp, tz=timezone.utc) if exp else datetime.now(timezone.utc) + timedelta(hours=1),
        )
        try:
            await revoked.insert()
        except Exception:
            pass  # Already revoked or duplicate — fine

    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
@auth_limiter.limit("3/minute")
async def forgot_password(req: ForgotPasswordRequest, request: Request):
    """Send password reset email."""
    user = await User.find_one({"email": req.email})
    if not user:
        # Don't reveal if email exists or not
        return {"message": "If the email exists, a reset link has been sent."}

    reset_token = create_access_token(
        {"sub": str(user.id)},  # purpose="access" is default, but we override to "reset"
        expires_delta=timedelta(hours=1),
        purpose="reset",
    )

    reset_link = f"/auth/reset-password?token={reset_token}"
    await send_password_reset(req.email, reset_link)

    return {"message": "If the email exists, a reset link has been sent."}


@router.post("/reset-password")
@limiter.limit("5/minute")
async def reset_password(req: ResetPasswordRequest, request: Request):
    """Reset password using token."""
    payload = decode_access_token(req.token)
    if not payload or payload.get("purpose") != "reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = await get_or_404(User, payload["sub"], "User not found")

    user.password_hash = hash_password(req.password)
    await user.save()

    return {"message": "Password reset successfully"}
