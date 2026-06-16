from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


# ---------- 标题生成 ----------
class TitleRequest(BaseModel):
    topic: str = Field(..., description="笔记主题")
    keywords: Optional[str] = Field(None, description="关键词,逗号分隔")
    count: int = Field(6, ge=1, le=15, description="生成数量")
    account_id: Optional[int] = Field(None, description="按该账号定位/人设生成")


class TitleItem(BaseModel):
    title: str
    style: str  # 风格:痛点 / 数字 / 悬念 / 干货 ...


class TitleResponse(BaseModel):
    titles: List[TitleItem]


# ---------- 正文生成 ----------
class ContentRequest(BaseModel):
    topic: str = Field(..., description="主题")
    keywords: Optional[str] = None
    tone: str = Field("亲切种草", description="语气风格")
    audience: Optional[str] = Field(None, description="目标人群")
    account_id: Optional[int] = Field(None, description="按该账号定位/人设生成")


class ContentResponse(BaseModel):
    title: str
    body: str
    tags: List[str]


# ---------- 爆款仿写 ----------
class RewriteRequest(BaseModel):
    source: str = Field(..., description="参考的爆款笔记正文")
    new_topic: str = Field(..., description="要改写成的新主题")
    account_id: Optional[int] = Field(None, description="按该账号定位/人设生成")


class RewriteResponse(BaseModel):
    structure: str  # 拆解出的结构说明
    title: str
    body: str
    tags: List[str]


# ---------- 违禁词检测 ----------
class CheckRequest(BaseModel):
    text: str = Field(..., description="待检测文本")


class CheckHit(BaseModel):
    word: str
    reason: str
    severity: str  # high / medium / low
    suggestion: str  # 替换建议


class CheckResponse(BaseModel):
    risk_level: str  # high / medium / low / none
    hits: List[CheckHit]
    summary: str


# ---------- 标签推荐 ----------
class TagsRequest(BaseModel):
    topic: str
    body: Optional[str] = None
    count: int = Field(10, ge=3, le=20)


class TagsResponse(BaseModel):
    tags: List[str]


# ---------- 爆款拆解 ----------
class AnalyzeRequest(BaseModel):
    title: Optional[str] = Field(None, description="爆款笔记标题")
    body: str = Field(..., description="爆款笔记正文")


class StructureSection(BaseModel):
    section: str  # 段落/层次名称
    purpose: str  # 作用


class AnalyzeResponse(BaseModel):
    hook_type: str  # 标题钩子类型
    hook_analysis: str  # 标题钩子拆解
    opening: str  # 开头手法
    structure: List[StructureSection]  # 正文骨架
    emotion_value: str  # 情绪与利他点
    ending: str  # 结尾引导手法
    tags_pattern: str  # 标签套路
    takeaways: List[str]  # 可复用套路清单


# ---------- 选题库 CRUD ----------
class TopicCreate(BaseModel):
    title: str
    keywords: Optional[str] = None
    category: Optional[str] = None
    status: str = "idea"
    note: Optional[str] = None


class TopicUpdate(BaseModel):
    title: Optional[str] = None
    keywords: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    note: Optional[str] = None


# ---------- 草稿 CRUD ----------
class DraftCreate(BaseModel):
    kind: str = "content"
    title: str = ""
    body: str = ""
    tags: List[str] = Field(default_factory=list)
    topic_id: Optional[int] = None
    parent_id: Optional[int] = None


# ---------- 排期 / 日历 CRUD ----------
class ScheduleCreate(BaseModel):
    title: str
    scheduled_date: date
    status: str = "planned"
    topic_id: Optional[int] = None
    draft_id: Optional[int] = None
    note: Optional[str] = None


class ScheduleUpdate(BaseModel):
    title: Optional[str] = None
    scheduled_date: Optional[date] = None
    status: Optional[str] = None
    note: Optional[str] = None


# ---------- 笔记数据 ----------
class MetricCreate(BaseModel):
    title: str
    publish_date: Optional[date] = None
    publish_hour: Optional[int] = Field(None, ge=0, le=23)
    views: int = 0
    likes: int = 0
    collects: int = 0
    comments: int = 0
    shares: int = 0
    follows: int = 0
    topic_id: Optional[int] = None


class MetricRead(BaseModel):
    id: int
    title: str
    publish_date: Optional[date]
    publish_hour: Optional[int]
    views: int
    likes: int
    collects: int
    comments: int
    shares: int
    follows: int
    engagement_rate: float  # 互动率 %
    collect_rate: float  # 收藏率 %


class ImportResult(BaseModel):
    imported: int
    failed: int
    errors: List[str]


# ---------- 数据看板 ----------
class TimeSlotStat(BaseModel):
    hour: int
    count: int
    avg_engagement_rate: float


class TopNote(BaseModel):
    title: str
    views: int
    engagement_rate: float
    collect_rate: float


class DashboardResponse(BaseModel):
    note_count: int
    total_views: int
    total_likes: int
    total_collects: int
    total_comments: int
    total_follows: int
    avg_engagement_rate: float
    avg_collect_rate: float
    best_time_slots: List[TimeSlotStat]  # 按互动率排序的最佳发布时段
    top_notes: List[TopNote]


# ---------- 竞品对标 ----------
class BenchmarkRequest(BaseModel):
    competitor_notes: str = Field(..., description="竞品笔记内容(可多篇,空行分隔)")
    my_positioning: Optional[str] = Field(None, description="我的账号定位(可选)")


class BenchmarkResponse(BaseModel):
    positioning: str  # 竞品定位与人设
    content_strategy: str  # 内容策略/选题套路
    strengths: List[str]  # 竞品强项
    my_gaps: List[str]  # 我可补足的差距/机会点
    suggestions: List[str]  # 可落地的行动建议


# ---------- 多账号定位档案 ----------
class AccountCreate(BaseModel):
    name: str
    niche: Optional[str] = None
    persona: Optional[str] = None
    audience: Optional[str] = None
    tone: Optional[str] = None
    bio: Optional[str] = None
    note: Optional[str] = None


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    niche: Optional[str] = None
    persona: Optional[str] = None
    audience: Optional[str] = None
    tone: Optional[str] = None
    bio: Optional[str] = None
    note: Optional[str] = None


# ---------- 话术库 ----------
class ScriptCreate(BaseModel):
    scene: str = "评论回复"
    title: str = ""
    content: str
    account_id: Optional[int] = None


class ScriptGenerateRequest(BaseModel):
    scene: str = Field(..., description="场景,如 评论回复 / 私信破冰 / 引流转化")
    context: str = Field(..., description="背景:账号定位 / 用户说了什么 / 想达成的目的")
    count: int = Field(5, ge=1, le=10)


class ScriptGenerateResponse(BaseModel):
    scripts: List[str]


# ---------- 封面文案 ----------
class CoverTextRequest(BaseModel):
    topic: str
    style: Optional[str] = Field(None, description="封面风格,如 干货/痛点/数字")


class CoverTextItem(BaseModel):
    main: str  # 主标题
    sub: str  # 副标题/点缀


class CoverTextResponse(BaseModel):
    items: List[CoverTextItem]
