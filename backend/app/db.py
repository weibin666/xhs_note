"""SQLite 数据层:引擎、建表、会话依赖。"""
from pathlib import Path
from typing import Iterator

from sqlmodel import Session, SQLModel, create_engine

_DB_PATH = Path(__file__).resolve().parent.parent / "xhs.db"
_engine = create_engine(
    f"sqlite:///{_DB_PATH}",
    connect_args={"check_same_thread": False},
)


def init_db() -> None:
    # 确保模型已注册到 metadata
    from . import db_models  # noqa: F401

    SQLModel.metadata.create_all(_engine)


def get_session() -> Iterator[Session]:
    with Session(_engine) as session:
        yield session
