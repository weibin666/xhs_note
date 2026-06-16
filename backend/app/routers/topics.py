from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db import get_session
from ..db_models import Topic
from ..schemas.models import TopicCreate, TopicUpdate

router = APIRouter(prefix="/api/topics", tags=["topics"])


@router.get("", response_model=List[Topic])
def list_topics(status: Optional[str] = None, session: Session = Depends(get_session)):
    stmt = select(Topic).order_by(Topic.created_at.desc())
    if status:
        stmt = stmt.where(Topic.status == status)
    return session.exec(stmt).all()


@router.post("", response_model=Topic)
def create_topic(data: TopicCreate, session: Session = Depends(get_session)):
    topic = Topic(**data.model_dump())
    session.add(topic)
    session.commit()
    session.refresh(topic)
    return topic


@router.patch("/{topic_id}", response_model=Topic)
def update_topic(topic_id: int, data: TopicUpdate, session: Session = Depends(get_session)):
    topic = session.get(Topic, topic_id)
    if not topic:
        raise HTTPException(404, "选题不存在")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(topic, k, v)
    session.add(topic)
    session.commit()
    session.refresh(topic)
    return topic


@router.delete("/{topic_id}")
def delete_topic(topic_id: int, session: Session = Depends(get_session)):
    topic = session.get(Topic, topic_id)
    if not topic:
        raise HTTPException(404, "选题不存在")
    session.delete(topic)
    session.commit()
    return {"ok": True}
