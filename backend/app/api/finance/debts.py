from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.models.debt import Debt
from app.api.deps import get_current_user_id, get_or_404

router = APIRouter(prefix="/debts", tags=["finance"])


class CreateDebtRequest(BaseModel):
    label: str
    amount: float
    amount_paid: float = 0.0
    due_date: Optional[str] = None
    notes: Optional[str] = None


class UpdateDebtRequest(BaseModel):
    label: Optional[str] = None
    amount: Optional[float] = None
    amount_paid: Optional[float] = None
    due_date: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class PayDebtRequest(BaseModel):
    amount: float


@router.get("/")
async def list_debts(
    user_id: str = Depends(get_current_user_id),
    skip: int = 0,
    limit: int = 50,
):
    """Get debts for the current user with pagination."""
    limit = min(limit, 100)

    total = await Debt.find(Debt.user_id == user_id).count()

    debts = (
        await Debt.find(Debt.user_id == user_id)
        .sort(-Debt.created_at)
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    items = [
        {
            "id": str(d.id),
            "label": d.label,
            "amount": d.amount,
            "amount_paid": d.amount_paid,
            "due_date": d.due_date,
            "status": d.status,
            "notes": d.notes,
            "created_at": d.created_at.isoformat(),
        }
        for d in debts
    ]

    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_more": (skip + limit) < total,
    }


@router.post("/")
async def create_debt(
    req: CreateDebtRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Create a new debt entry."""
    valid_statuses = {"unpaid", "partial", "cleared"}
    # Determine initial status
    status = "unpaid"
    if req.amount_paid > 0 and req.amount_paid < req.amount:
        status = "partial"
    elif req.amount_paid >= req.amount and req.amount > 0:
        status = "cleared"

    debt = Debt(
        user_id=user_id,
        label=req.label,
        amount=req.amount,
        amount_paid=req.amount_paid,
        due_date=req.due_date,
        status=status,
        notes=req.notes,
    )
    await debt.insert()

    return {
        "id": str(debt.id),
        "label": debt.label,
        "amount": debt.amount,
        "amount_paid": debt.amount_paid,
        "due_date": debt.due_date,
        "status": debt.status,
        "notes": debt.notes,
        "created_at": debt.created_at.isoformat(),
    }


@router.patch("/{debt_id}")
async def update_debt(
    debt_id: str,
    req: UpdateDebtRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Update a debt entry."""
    debt = await Debt.get(debt_id)
    if not debt or debt.user_id != user_id:
        raise HTTPException(status_code=404, detail="Debt not found")

    update_data = req.model_dump(exclude_none=True)

    # Recalculate status if amount or amount_paid changed
    if "amount" in update_data or "amount_paid" in update_data:
        new_amount = update_data.get("amount", debt.amount)
        new_paid = update_data.get("amount_paid", debt.amount_paid)
        if new_paid >= new_amount and new_amount > 0:
            update_data["status"] = "cleared"
        elif new_paid > 0:
            update_data["status"] = "partial"
        else:
            update_data["status"] = "unpaid"

    for field, value in update_data.items():
        setattr(debt, field, value)

    await debt.save()

    return {
        "id": str(debt.id),
        "label": debt.label,
        "amount": debt.amount,
        "amount_paid": debt.amount_paid,
        "due_date": debt.due_date,
        "status": debt.status,
        "notes": debt.notes,
        "created_at": debt.created_at.isoformat(),
    }


@router.post("/{debt_id}/pay")
async def pay_debt(
    debt_id: str,
    req: PayDebtRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Atomically increment amount_paid using $inc.
    Avoids lost-update races from concurrent quick-pay clicks.
    """
    debt = await get_or_404(Debt, debt_id, "Debt not found")
    if debt.user_id != user_id:
        raise HTTPException(status_code=404, detail="Debt not found")

    # Atomic increment — no read-modify-write race
    collection = Debt.get_motor_collection()
    await collection.update_one(
        {"_id": debt.id},
        {"$inc": {"amount_paid": req.amount}},
    )

    # Fetch updated document
    debt = await Debt.get(debt_id)

    # Recalculate status
    if debt.amount_paid >= debt.amount:
        debt.status = "cleared"
    elif debt.amount_paid > 0:
        debt.status = "partial"
    else:
        debt.status = "unpaid"
    await debt.save()

    return {
        "id": str(debt.id),
        "label": debt.label,
        "amount": debt.amount,
        "amount_paid": debt.amount_paid,
        "due_date": debt.due_date,
        "status": debt.status,
        "notes": debt.notes,
        "created_at": debt.created_at.isoformat(),
    }


@router.delete("/{debt_id}")
async def delete_debt(
    debt_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Delete a debt entry."""
    debt = await get_or_404(Debt, debt_id, "Debt not found")
    if debt.user_id != user_id:
        raise HTTPException(status_code=404, detail="Debt not found")

    await debt.delete()
    return {"message": "Debt deleted"}
