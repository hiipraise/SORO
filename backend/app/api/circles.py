from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field

from app.models.circle import PeerCircle, CircleMember
from app.models.circle_message import CircleMessage
from app.api.deps import get_current_user_id, get_or_404
from app.core.rate_limit import limiter

router = APIRouter(prefix="/circles", tags=["circles"])

VALID_TOPICS = [
    "Student debt", "Lost a parent", "First job",
    "Faith & doubt", "From zero", "General",
]

ANONYMOUS_PREFIX = "Voice"


class CreateCircleRequest(BaseModel):
    name: str
    topic: Optional[str] = None
    max_members: int = 20


class SendMessageRequest(BaseModel):
    content: str = Field(..., max_length=500)


def get_anonymous_name(members: list[dict]) -> str:
    """Generate the next anonymous display name for a circle member."""
    existing_numbers = set()
    for m in members:
        name = m.get("display_name", "")
        if name.startswith(ANONYMOUS_PREFIX):
            try:
                num = int(name.replace(ANONYMOUS_PREFIX, "").strip())
                existing_numbers.add(num)
            except ValueError:
                continue

    next_num = 1
    while next_num in existing_numbers:
        next_num += 1

    return f"{ANONYMOUS_PREFIX} {next_num}"


@router.get("/")
async def list_circles(
    topic: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
):
    """Get all circles, optionally filtered by topic."""
    query = PeerCircle.find_all().sort(-PeerCircle.created_at)

    if topic:
        if topic not in VALID_TOPICS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid topic. Must be one of: {', '.join(VALID_TOPICS)}",
            )
        query = PeerCircle.find(PeerCircle.topic == topic).sort(-PeerCircle.created_at)

    circles = await query.to_list()

    return [
        {
            "id": str(c.id),
            "name": c.name,
            "topic": c.topic,
            "member_count": c.member_count,
            "max_members": c.max_members,
            "is_full": c.is_full,
            "has_joined": any(m["user_id"] == user_id for m in c.members),
            "members": [
                {
                    "display_name": m["display_name"],
                    "joined_at": m["joined_at"].isoformat() if isinstance(m["joined_at"], datetime) else m["joined_at"],
                }
                for m in c.members
            ],
            "created_at": c.created_at.isoformat(),
        }
        for c in circles
    ]


@router.get("/{circle_id}")
async def get_circle(
    circle_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get a single circle with details."""
    circle = await get_or_404(PeerCircle, circle_id, "Circle not found")

    return {
        "id": str(circle.id),
        "name": circle.name,
        "topic": circle.topic,
        "member_count": circle.member_count,
        "max_members": circle.max_members,
        "is_full": circle.is_full,
        "has_joined": any(m["user_id"] == user_id for m in circle.members),
        "members": [
            {
                "display_name": m["display_name"],
                "joined_at": m["joined_at"].isoformat() if isinstance(m["joined_at"], datetime) else m["joined_at"],
            }
            for m in circle.members
        ],
        "created_at": circle.created_at.isoformat(),
    }


@router.post("/")
@limiter.limit("3/minute")
async def create_circle(
    req: CreateCircleRequest,
    request: Request,
    user_id: str = Depends(get_current_user_id),
):
    """Create a new circle. Creator joins automatically."""
    if req.topic and req.topic not in VALID_TOPICS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid topic. Must be one of: {', '.join(VALID_TOPICS)}",
        )

    display_name = ANONYMOUS_PREFIX + " 1"
    member = CircleMember(
        user_id=user_id,
        display_name=display_name,
    )

    circle = PeerCircle(
        name=req.name,
        topic=req.topic,
        max_members=min(req.max_members, 20),
        members=[member.model_dump()],
    )
    await circle.insert()

    return {
        "id": str(circle.id),
        "name": circle.name,
        "topic": circle.topic,
        "member_count": circle.member_count,
        "max_members": circle.max_members,
        "is_full": circle.is_full,
        "has_joined": True,
        "display_name": display_name,
        "members": [
            {
                "display_name": m["display_name"],
                "joined_at": m["joined_at"].isoformat() if isinstance(m["joined_at"], datetime) else m["joined_at"],
            }
            for m in circle.members
        ],
        "created_at": circle.created_at.isoformat(),
    }


@router.post("/{circle_id}/join")
@limiter.limit("5/minute")
async def join_circle(
    circle_id: str,
    request: Request,
    user_id: str = Depends(get_current_user_id),
):
    """Join a circle. Gets an anonymous display name."""
    circle = await get_or_404(PeerCircle, circle_id, "Circle not found")

    # Check if already a member
    if any(m["user_id"] == user_id for m in circle.members):
        raise HTTPException(status_code=400, detail="Already a member of this circle")

    if circle.is_full:
        raise HTTPException(status_code=400, detail="Circle is full")

    display_name = get_anonymous_name(circle.members)
    member = CircleMember(
        user_id=user_id,
        display_name=display_name,
    )

    circle.members.append(member.model_dump())
    await circle.save()

    return {
        "message": f"Joined circle as {display_name}",
        "display_name": display_name,
        "member_count": circle.member_count,
    }


@router.post("/{circle_id}/leave")
@limiter.limit("5/minute")
async def leave_circle(
    circle_id: str,
    request: Request,
    user_id: str = Depends(get_current_user_id),
):
    """Leave a circle."""
    circle = await get_or_404(PeerCircle, circle_id, "Circle not found")

    # Check membership
    member_index = next(
        (i for i, m in enumerate(circle.members) if m["user_id"] == user_id),
        None,
    )
    if member_index is None:
        raise HTTPException(status_code=400, detail="Not a member of this circle")

    circle.members.pop(member_index)
    await circle.save()

    return {
        "message": "Left circle",
        "member_count": circle.member_count,
    }


@router.get("/{circle_id}/messages")
async def list_messages(
    circle_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get messages in a circle (must be a member)."""
    circle = await get_or_404(PeerCircle, circle_id, "Circle not found")

    if not any(m["user_id"] == user_id for m in circle.members):
        raise HTTPException(status_code=403, detail="You must be a member to view messages")

    messages = (
        await CircleMessage.find(CircleMessage.circle_id == circle_id)
        .sort(CircleMessage.created_at)
        .to_list()
    )

    return [
        {
            "id": str(msg.id),
            "display_name": msg.display_name,
            "content": msg.content,
            "created_at": msg.created_at.isoformat(),
        }
        for msg in messages
    ]


@router.post("/{circle_id}/messages")
@limiter.limit("10/minute")
async def send_message(
    circle_id: str,
    req: SendMessageRequest,
    request: Request,
    user_id: str = Depends(get_current_user_id),
):
    """Send a message in a circle (must be a member)."""
    circle = await get_or_404(PeerCircle, circle_id, "Circle not found")

    # Find member's display name
    member = next(
        (m for m in circle.members if m["user_id"] == user_id),
        None,
    )
    if not member:
        raise HTTPException(status_code=403, detail="You must be a member to send messages")

    if not req.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    message = CircleMessage(
        circle_id=circle_id,
        user_id=user_id,
        display_name=member["display_name"],
        content=req.content.strip(),
    )
    await message.insert()

    return {
        "id": str(message.id),
        "display_name": message.display_name,
        "content": message.content,
        "created_at": message.created_at.isoformat(),
    }
