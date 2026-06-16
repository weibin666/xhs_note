"""笔记数据:速率计算、看板聚合、CSV 导入解析。"""
import csv
import io
from collections import defaultdict
from typing import List

from ..db_models import NoteMetric
from ..schemas.models import (
    DashboardResponse,
    MetricCreate,
    MetricRead,
    TimeSlotStat,
    TopNote,
)


def engagement_rate(m: NoteMetric) -> float:
    if not m.views:
        return 0.0
    return round((m.likes + m.collects + m.comments + m.shares) / m.views * 100, 2)


def collect_rate(m: NoteMetric) -> float:
    if not m.views:
        return 0.0
    return round(m.collects / m.views * 100, 2)


def to_read(m: NoteMetric) -> MetricRead:
    return MetricRead(
        id=m.id,
        title=m.title,
        publish_date=m.publish_date,
        publish_hour=m.publish_hour,
        views=m.views,
        likes=m.likes,
        collects=m.collects,
        comments=m.comments,
        shares=m.shares,
        follows=m.follows,
        engagement_rate=engagement_rate(m),
        collect_rate=collect_rate(m),
    )


def build_dashboard(metrics: List[NoteMetric]) -> DashboardResponse:
    if not metrics:
        return DashboardResponse(
            note_count=0,
            total_views=0,
            total_likes=0,
            total_collects=0,
            total_comments=0,
            total_follows=0,
            avg_engagement_rate=0.0,
            avg_collect_rate=0.0,
            best_time_slots=[],
            top_notes=[],
        )

    n = len(metrics)
    eng_rates = [engagement_rate(m) for m in metrics]
    col_rates = [collect_rate(m) for m in metrics]

    # 按发布小时聚合互动率
    by_hour: dict[int, list[float]] = defaultdict(list)
    for m in metrics:
        if m.publish_hour is not None and m.views:
            by_hour[m.publish_hour].append(engagement_rate(m))
    slots = [
        TimeSlotStat(
            hour=h,
            count=len(rs),
            avg_engagement_rate=round(sum(rs) / len(rs), 2),
        )
        for h, rs in by_hour.items()
    ]
    slots.sort(key=lambda s: s.avg_engagement_rate, reverse=True)

    # Top 笔记(按互动率)
    ranked = sorted(metrics, key=engagement_rate, reverse=True)[:5]
    top = [
        TopNote(
            title=m.title,
            views=m.views,
            engagement_rate=engagement_rate(m),
            collect_rate=collect_rate(m),
        )
        for m in ranked
    ]

    return DashboardResponse(
        note_count=n,
        total_views=sum(m.views for m in metrics),
        total_likes=sum(m.likes for m in metrics),
        total_collects=sum(m.collects for m in metrics),
        total_comments=sum(m.comments for m in metrics),
        total_follows=sum(m.follows for m in metrics),
        avg_engagement_rate=round(sum(eng_rates) / n, 2),
        avg_collect_rate=round(sum(col_rates) / n, 2),
        best_time_slots=slots[:6],
        top_notes=top,
    )


# CSV 列名 → 字段(支持中英文表头)
_COLUMN_MAP = {
    "标题": "title", "title": "title",
    "发布日期": "publish_date", "date": "publish_date", "publish_date": "publish_date",
    "发布小时": "publish_hour", "hour": "publish_hour", "publish_hour": "publish_hour",
    "曝光": "views", "浏览": "views", "浏览量": "views", "views": "views",
    "点赞": "likes", "likes": "likes",
    "收藏": "collects", "collects": "collects",
    "评论": "comments", "comments": "comments",
    "分享": "shares", "shares": "shares",
    "涨粉": "follows", "新增粉丝": "follows", "follows": "follows",
}

_INT_FIELDS = {"publish_hour", "views", "likes", "collects", "comments", "shares", "follows"}


def parse_csv(content: bytes) -> tuple[List[MetricCreate], List[str]]:
    """解析 CSV,返回 (有效记录, 错误信息)。"""
    errors: List[str] = []
    records: List[MetricCreate] = []

    text = content.decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        return [], ["CSV 为空或无表头"]

    for i, row in enumerate(reader, start=2):  # 第 1 行是表头
        data: dict = {}
        for col, raw in row.items():
            field = _COLUMN_MAP.get((col or "").strip())
            if not field or raw is None or raw.strip() == "":
                continue
            val = raw.strip()
            try:
                if field in _INT_FIELDS:
                    data[field] = int(float(val))
                else:
                    data[field] = val
            except ValueError:
                errors.append(f"第 {i} 行「{col}」值无效:{val}")
        if not data.get("title"):
            errors.append(f"第 {i} 行缺少标题,已跳过")
            continue
        try:
            records.append(MetricCreate(**data))
        except Exception as e:  # noqa: BLE001
            errors.append(f"第 {i} 行解析失败:{e}")

    return records, errors
