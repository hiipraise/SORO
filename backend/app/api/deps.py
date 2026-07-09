from beanie import Document
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import ValidationError

from app.core.security import decode_access_token

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
    Extract the current user ID from the JWT token or anonymous header.
    Returns user ID string.
    """
    if credentials:
        payload = decode_access_token(credentials.credentials)
        if payload and "sub" in payload:
            return payload["sub"]

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )
