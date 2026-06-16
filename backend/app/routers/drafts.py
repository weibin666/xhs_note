from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db import get_session
from ..db_models import Draft
from ..schemas.models import DraftCreate

router = APIRouter(prefix="/api/drafts", tags=["drafts"])


@router.get("", response_model=List[Draft])
def list_drafts(topic_id: Optional[int] = None, session: Session = Depends(get_session)):
    stmt = select(Draft).order_by(Draft.created_at.desc())
    if topic_id is not None:
        stmt = stmt.where(Draft.topic_id == topic_id)
    return session.exec(stmt).all()


@router.get("/{draft_id}", response_model=Draft)
def get_draft(draft_id: int, session: Session = Depends(get_session)):
    draft = session.get(Draft, draft_id)
    if not draft:
        raise HTTPException(404, "草稿不存在")
    return draft


@router.post("", response_model=Draft)
def create_draft(data: DraftCreate, session: Session = Depends(get_session)):
    version = 1
    # 若指定 parent_id,则版本号在父草稿基础上 +1
    if data.parent_id is not None:
        parent = session.get(Draft, data.parent_id)
        if not parent:
            raise HTTPException(404, "父草稿不存在")
        version = parent.version + 1
    draft = Draft(**data.model_dump(), version=version)
    session.add(draft)
    session.commit()
    session.refresh(draft)
    return draft


@router.delete("/{draft_id}")
def delete_draft(draft_id: int, session: Session = Depends(get_session)):
    draft = session.get(Draft, draft_id)
    if not draft:
        raise HTTPException(404, "草稿不存在")
    session.delete(draft)
    session.commit()
    return {"ok": True}
