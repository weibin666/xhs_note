from fastapi import APIRouter

from ..schemas.models import AnalyzeRequest, AnalyzeResponse
from ..services import analyzer

router = APIRouter(prefix="/api", tags=["analyzer"])


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    return await analyzer.analyze(req)
