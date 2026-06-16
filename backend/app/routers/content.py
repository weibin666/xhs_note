from fastapi import APIRouter, Depends
from sqlmodel import Session

from ..db import get_session
from ..db_models import Account
from ..schemas.models import (
    CheckRequest,
    CheckResponse,
    ContentRequest,
    ContentResponse,
    RewriteRequest,
    RewriteResponse,
    TagsRequest,
    TagsResponse,
    TitleRequest,
    TitleResponse,
)
from ..services import checker, content

router = APIRouter(prefix="/api", tags=["content"])


@router.post("/titles", response_model=TitleResponse)
async def titles(req: TitleRequest, session: Session = Depends(get_session)):
    account = session.get(Account, req.account_id) if req.account_id else None
    return await content.gen_titles(req, account)


@router.post("/content", response_model=ContentResponse)
async def gen_content(req: ContentRequest, session: Session = Depends(get_session)):
    account = session.get(Account, req.account_id) if req.account_id else None
    return await content.gen_content(req, account)


@router.post("/rewrite", response_model=RewriteResponse)
async def rewrite(req: RewriteRequest, session: Session = Depends(get_session)):
    account = session.get(Account, req.account_id) if req.account_id else None
    return await content.rewrite(req, account)


@router.post("/tags", response_model=TagsResponse)
async def tags(req: TagsRequest):
    return await content.gen_tags(req)


@router.post("/check", response_model=CheckResponse)
async def check(req: CheckRequest):
    return await checker.check_text(req)
