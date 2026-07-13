from beanie import Document
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import ValidationError

from app.core.security import decode_access_token
from app.models.revoked_token import RevokedToken

bearer_scheme = HTTPBearer(auto_error=False)


async def get_or_404(model: type[Document], id: str, detail: str = "Not found") -> Document:
    """
    Fetch a document by ID, returning a 404 if missing or if the ID is malformed.
    Prevents 500 errors from invalid ObjectId strings.
    """
    try:
        doc = await model.get(id)
    except (ValidationError, Exception):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
    return doc


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    """
    Extract the current user ID from the JWT token.

    Rejects tokens that:
    - Are malformed or expired
    - Don't have purpose="access" (so password-reset tokens can't be used as auth)
    - Have been revoked (e.g. via logout)
    """
    if credentials:
        payload = decode_access_token(credentials.credentials)
        if payload and "sub" in payload:
            # P0.1: Only accept tokens with purpose="access"
            if payload.get("purpose") != "access":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token purpose",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            # P0.4: Check if token has been revoked
            jti = payload.get("jti")
            if jti:
                revoked = await RevokedToken.get(jti)
                if revoked:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Token has been revoked",
                        headers={"WWW-Authenticate": "Bearer"},
                    )

            return payload["sub"]

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )
