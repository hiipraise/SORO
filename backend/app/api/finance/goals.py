from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.models.goal import Goal
from app.api.deps import get_current_user_id, get_or_404
from app.services.email_service import send_goal_celebration
from app.models.user import User

router = APIRouter(prefix="/goals", tags=["finance"])


class CreateGoalRequest(BaseModel):
    title: str
    target_amount: float
    current_amount: float = 0.0
    deadline: Optional[str] = None
    priority: str = "eventually"


class UpdateGoalRequest(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    deadline: Optional[str] = None
    priority: Optional[str] = None


class ProgressGoalRequest(BaseModel):
    amount: float


@router.get("/")
async def list_goals(
    user_id: str = Depends(get_current_user_id),
    skip: int = 0,
    limit: int = 50,
):
    """Get goals for the current user with pagination."""
    limit = min(limit, 100)

    total = await Goal.find(Goal.user_id == user_id).count()

    goals = (
        await Goal.find(Goal.user_id == user_id)
        .sort(-Goal.created_at)
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    items = [
        {
            "id": str(g.id),
            "title": g.title,
            "target_amount": g.target_amount,
            "current_amount": g.current_amount,
            "deadline": g.deadline,
            "priority": g.priority,
            "status": g.status,
            "progress": round((g.current_amount / g.target_amount) * 100, 1) if g.target_amount > 0 else 0,
            "created_at": g.created_at.isoformat(),
        }
        for g in goals
    ]

    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_more": (skip + limit) < total,
    }


@router.post("/")
async def create_goal(
    req: CreateGoalRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Create a new micro-goal."""
    valid_priorities = {"urgent", "soon", "eventually"}
    if req.priority not in valid_priorities:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid priority. Must be one of: {', '.join(valid_priorities)}",
        )

    goal = Goal(
        user_id=user_id,
        title=req.title,
        target_amount=req.target_amount,
        current_amount=req.current_amount,
        deadline=req.deadline,
        priority=req.priority,
    )
    await goal.insert()

    return {
        "id": str(goal.id),
        "title": goal.title,
        "target_amount": goal.target_amount,
        "current_amount": goal.current_amount,
        "deadline": goal.deadline,
        "priority": goal.priority,
        "status": goal.status,
        "progress": 0,
        "created_at": goal.created_at.isoformat(),
    }


@router.post("/{goal_id}/progress")
async def progress_goal(
    goal_id: str,
    req: ProgressGoalRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Atomically increment current_amount using $inc.
    Avoids lost-update races from concurrent quick-progress clicks.
    """
    goal = await get_or_404(Goal, goal_id, "Goal not found")
    if goal.user_id != user_id:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Atomic increment
    collection = Goal.get_motor_collection()
    await collection.update_one(
        {"_id": goal.id},
        {"$inc": {"current_amount": req.amount}},
    )

    # Fetch updated document
    goal = await Goal.get(goal_id)

    # Check for completion
    if goal.current_amount >= goal.target_amount and goal.target_amount > 0:
        goal.status = "completed"
        user = await User.get(user_id)
        if user and user.email:
            await send_goal_celebration(user.email, goal.title)

    await goal.save()

    return {
        "id": str(goal.id),
        "title": goal.title,
        "target_amount": goal.target_amount,
        "current_amount": goal.current_amount,
        "deadline": goal.deadline,
        "priority": goal.priority,
        "status": goal.status,
        "progress": round((goal.current_amount / goal.target_amount) * 100, 1) if goal.target_amount > 0 else 0,
        "created_at": goal.created_at.isoformat(),
    }


@router.patch("/{goal_id}")
async def update_goal(
    goal_id: str,
    req: UpdateGoalRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Update a micro-goal. If current_amount reaches target, mark as completed."""
    goal = await get_or_404(Goal, goal_id, "Goal not found")
    if goal.user_id != user_id:
        raise HTTPException(status_code=404, detail="Goal not found")

    update_data = req.model_dump(exclude_none=True)

    for field, value in update_data.items():
        setattr(goal, field, value)

    # Check for completion
    if goal.current_amount >= goal.target_amount and goal.target_amount > 0:
        goal.status = "completed"

        # Send celebration email if user has email
        user = await User.get(user_id)
        if user and user.email:
            await send_goal_celebration(user.email, goal.title)

    await goal.save()

    return {
        "id": str(goal.id),
        "title": goal.title,
        "target_amount": goal.target_amount,
        "current_amount": goal.current_amount,
        "deadline": goal.deadline,
        "priority": goal.priority,
        "status": goal.status,
        "progress": round((goal.current_amount / goal.target_amount) * 100, 1) if goal.target_amount > 0 else 0,
        "created_at": goal.created_at.isoformat(),
    }
