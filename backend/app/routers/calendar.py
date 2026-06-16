from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db import get_session
from ..db_models import ScheduleItem
from ..schemas.models import ScheduleCreate, ScheduleUpdate

router = APIRouter(prefix="/api/schedule", tags=["schedule"])


@router.get("", response_model=List[ScheduleItem])
def list_schedule(
    start: Optional[date] = None,
    end: Optional[date] = None,
    session: Session = Depends(get_session),
):
    stmt = select(ScheduleItem).order_by(ScheduleItem.scheduled_date)
    if start:
        stmt = stmt.where(ScheduleItem.scheduled_date >= start)
    if end:
        stmt = stmt.where(ScheduleItem.scheduled_date <= end)
    return session.exec(stmt).all()


@router.get("/reminders", response_model=List[ScheduleItem])
def reminders(session: Session = Depends(get_session)):
    """今天及以前未发布的待办(到期/逾期提醒)。"""
    today = date.today()
    stmt = (
        select(ScheduleItem)
        .where(ScheduleItem.status == "planned")
        .where(ScheduleItem.scheduled_date <= today)
        .order_by(ScheduleItem.scheduled_date)
    )
    return session.exec(stmt).all()


@router.post("", response_model=ScheduleItem)
def create_item(data: ScheduleCreate, session: Session = Depends(get_session)):
    item = ScheduleItem(**data.model_dump())
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.patch("/{item_id}", response_model=ScheduleItem)
def update_item(item_id: int, data: ScheduleUpdate, session: Session = Depends(get_session)):
    item = session.get(ScheduleItem, item_id)
    if not item:
        raise HTTPException(404, "排期不存在")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(ScheduleItem, item_id)
    if not item:
        raise HTTPException(404, "排期不存在")
    session.delete(item)
    session.commit()
    return {"ok": True}
