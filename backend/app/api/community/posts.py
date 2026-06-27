from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.models.community_post import CommunityPost
from app.api.deps import get_current_user_id

router = APIRouter(prefix="/posts", tags=["community"])

VALID_TOPICS = [
    "Money", "Family", "School", "Grief",
    "Relationships", "Faith", "General",
]

CRISIS_KEYWORDS = [
    "kill myself", "end it", "suicide", "don't want to live",
    "not worth living", "want to die", "hurt myself",
    "end my life", "take my life", "better off dead",
]


class CreatePostRequest(BaseModel):
    content: str
    topic_tag: Optional[str] = None


class ReactRequest(BaseModel):
    reaction: str  # "feel_this" | "you_go_make_am" | "dey_with_you"


@router.get("/")
async def list_posts(
    topic: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
):
    """Get approved community posts, optionally filtered by topic."""
    query = CommunityPost.find(
        CommunityPost.is_approved == True,
        CommunityPost.expires_at > datetime.now(timezone.utc),
    )

    if topic and topic in VALID_TOPICS:
        query = query.find(CommunityPost.topic_tag == topic)

    posts = await query.sort(-CommunityPost.created_at).limit(50).to_list()

    return [
        {
            "id": str(p.id),
            "content": p.content,
            "topic_tag": p.topic_tag,
            "reactions": p.reactions,
            "created_at": p.created_at.isoformat(),
            "expires_at": p.expires_at.isoformat(),
        }
        for p in posts
    ]


@router.post("/")
async def create_post(
    req: CreatePostRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Create a community post. Crisis content is flagged, never shown publicly."""
    # Crisis check — redirect, never publish
    if any(kw in req.content.lower() for kw in CRISIS_KEYWORDS):
        return {
            "id": None,
            "approved": False,
            "crisis": True,
            "message": "It sounds like you're going through something serious. "
                       "You're not alone. Please reach out to MANI helpline: 08111909909",
        }

    # Auto-approve if no trigger words; future versions can use Groq moderation
    is_approved = True

    if req.topic_tag and req.topic_tag not in VALID_TOPICS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid topic. Must be one of: {', '.join(VALID_TOPICS)}",
        )

    post = CommunityPost(
        user_id=user_id,
        content=req.content,
        topic_tag=req.topic_tag,
        is_approved=is_approved,
    )
    await post.insert()

    return {
        "id": str(post.id),
        "content": post.content,
        "topic_tag": post.topic_tag,
        "approved": is_approved,
        "crisis": False,
        "reactions": post.reactions,
        "created_at": post.created_at.isoformat(),
        "expires_at": post.expires_at.isoformat(),
    }


@router.post("/{post_id}/react")
async def react_to_post(
    post_id: str,
    req: ReactRequest,
    user_id: str = Depends(get_current_user_id),
):
    """React to a community post."""
    valid_reactions = {"feel_this", "you_go_make_am", "dey_with_you"}
    if req.reaction not in valid_reactions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid reaction. Must be one of: {', '.join(valid_reactions)}",
        )

    post = await CommunityPost.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if not post.is_approved:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Post has expired")

    # Increment reaction count
    reactions = post.reactions or {}
    reactions[req.reaction] = reactions.get(req.reaction, 0) + 1
    post.reactions = reactions
    await post.save()

    return {
        "id": str(post.id),
        "reactions": post.reactions,
    }
