from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .db import init_db
from .routers import (
    accounts,
    analyzer,
    benchmark,
    calendar,
    content,
    drafts,
    metrics,
    scripts,
    topics,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="小红书运营自动化平台 API", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(content.router)
app.include_router(analyzer.router)
app.include_router(topics.router)
app.include_router(drafts.router)
app.include_router(calendar.router)
app.include_router(metrics.router)
app.include_router(benchmark.router)
app.include_router(accounts.router)
app.include_router(scripts.router)
app.include_router(scripts.cover_router)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": f"服务出错:{exc}"})


@app.get("/health")
async def health():
    return {"status": "ok", "model_high": settings.model_high}
