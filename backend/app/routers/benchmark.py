from fastapi import APIRouter

from ..schemas.models import BenchmarkRequest, BenchmarkResponse
from ..services import benchmark as svc

router = APIRouter(prefix="/api", tags=["benchmark"])


@router.post("/benchmark", response_model=BenchmarkResponse)
async def benchmark(req: BenchmarkRequest):
    return await svc.benchmark(req)
