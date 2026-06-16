from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlmodel import Session, select

from ..db import get_session
from ..db_models import NoteMetric
from ..schemas.models import (
    DashboardResponse,
    ImportResult,
    MetricCreate,
    MetricRead,
)
from ..services import metrics as svc

router = APIRouter(prefix="/api/metrics", tags=["metrics"])


@router.get("", response_model=List[MetricRead])
def list_metrics(session: Session = Depends(get_session)):
    rows = session.exec(select(NoteMetric).order_by(NoteMetric.publish_date.desc())).all()
    return [svc.to_read(m) for m in rows]


@router.post("", response_model=MetricRead)
def create_metric(data: MetricCreate, session: Session = Depends(get_session)):
    m = NoteMetric(**data.model_dump())
    session.add(m)
    session.commit()
    session.refresh(m)
    return svc.to_read(m)


@router.post("/import", response_model=ImportResult)
async def import_csv(file: UploadFile = File(...), session: Session = Depends(get_session)):
    content = await file.read()
    records, errors = svc.parse_csv(content)
    for r in records:
        session.add(NoteMetric(**r.model_dump()))
    session.commit()
    return ImportResult(imported=len(records), failed=len(errors), errors=errors)


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(session: Session = Depends(get_session)):
    rows = session.exec(select(NoteMetric)).all()
    return svc.build_dashboard(rows)


@router.delete("/{metric_id}")
def delete_metric(metric_id: int, session: Session = Depends(get_session)):
    m = session.get(NoteMetric, metric_id)
    if not m:
        raise HTTPException(404, "数据不存在")
    session.delete(m)
    session.commit()
    return {"ok": True}
