"""SQLModel 表模型:选题、草稿、排期。"""
from datetime import date, datetime
from typing import List, Optional

from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel


class Topic(SQLModel, table=True):
    """选题库条目。"""

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    keywords: Optional[str] = None
    category: Optional[str] = None  # 赛道/分类
    status: str = "idea"  # idea(灵感) / planned(已排期) / done(已发布)
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Draft(SQLModel, table=True):
    """草稿:保存生成/仿写结果,支持版本链。"""

    id: Optional[int] = Field(default=None, primary_key=True)
    kind: str = "content"  # content / rewrite / title
    title: str = ""
    body: str = ""
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    topic_id: Optional[int] = Field(default=None, foreign_key="topic.id")
    parent_id: Optional[int] = Field(default=None, foreign_key="draft.id")  # 版本溯源
    version: int = 1
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Account(SQLModel, table=True):
    """多账号定位档案。"""

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    niche: Optional[str] = None  # 赛道
    persona: Optional[str] = None  # 人设
    audience: Optional[str] = None  # 目标人群
    tone: Optional[str] = None  # 语气风格
    bio: Optional[str] = None  # 简介/slogan
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Script(SQLModel, table=True):
    """评论 / 私信话术库。"""

    id: Optional[int] = Field(default=None, primary_key=True)
    scene: str = "评论回复"  # 场景
    title: str = ""
    content: str
    account_id: Optional[int] = Field(default=None, foreign_key="account.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class NoteMetric(SQLModel, table=True):
    """笔记数据(手动导入/录入,无官方 API)。"""

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    publish_date: Optional[date] = None
    publish_hour: Optional[int] = None  # 0-23,用于最佳发布时段分析
    views: int = 0  # 曝光/浏览量
    likes: int = 0  # 点赞
    collects: int = 0  # 收藏
    comments: int = 0  # 评论
    shares: int = 0  # 分享
    follows: int = 0  # 涨粉
    topic_id: Optional[int] = Field(default=None, foreign_key="topic.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ScheduleItem(SQLModel, table=True):
    """内容日历 / 排期。"""

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    scheduled_date: date
    status: str = "planned"  # planned / posted
    topic_id: Optional[int] = Field(default=None, foreign_key="topic.id")
    draft_id: Optional[int] = Field(default=None, foreign_key="draft.id")
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
