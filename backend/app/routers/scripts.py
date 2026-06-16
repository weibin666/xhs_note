from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db import get_session
from ..db_models import Script
from ..schemas.models import (
    CoverTextRequest,
    CoverTextResponse,
    ScriptCreate,
    ScriptGenerateRequest,
    ScriptGenerateResponse,
)
from ..services import scripts as svc

router = APIRouter(prefix="/api/scripts", tags=["scripts"])


@router.get("", response_model=List[Script])
def list_scripts(scene: Optional[str] = None, session: Session = Depends(get_session)):
    stmt = select(Script).order_by(Script.created_at.desc())
    if scene:
        stmt = stmt.where(Script.scene == scene)
    return session.exec(stmt).all()


@router.post("", response_model=Script)
def create_script(data: ScriptCreate, session: Session = Depends(get_session)):
    s = Script(**data.model_dump())
    session.add(s)
    session.commit()
    session.refresh(s)
    return s


@router.delete("/{script_id}")
def delete_script(script_id: int, session: Session = Depends(get_session)):
    s = session.get(Script, script_id)
    if not s:
        raise HTTPException(404, "话术不存在")
    session.delete(s)
    session.commit()
    return {"ok": True}


@router.post("/generate", response_model=ScriptGenerateResponse)
async def generate(req: ScriptGenerateRequest):
    return await svc.generate_scripts(req)


# 封面文案生成(挂在 scripts 路由下,复用同一 service)
cover_router = APIRouter(prefix="/api", tags=["cover"])


@cover_router.post("/cover-text", response_model=CoverTextResponse)
async def cover_text(req: CoverTextRequest):
    return await svc.generate_cover_text(req)
