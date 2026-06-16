"""违禁词 / 限流词检测:本地词库快筛 + AI 语义复检。"""
import json
from pathlib import Path

from ..llm_client import generate_json
from ..schemas.models import CheckHit, CheckRequest, CheckResponse

_DATA = Path(__file__).resolve().parent.parent / "data" / "banned_words.json"

with _DATA.open(encoding="utf-8") as f:
    _BANNED = json.load(f)

_SEVERITY_RANK = {"none": 0, "low": 1, "medium": 2, "high": 3}


def _local_scan(text: str) -> list[CheckHit]:
    hits: list[CheckHit] = []
    seen: set[str] = set()
    for cat in _BANNED.values():
        for word in cat["words"]:
            if word in text and word not in seen:
                seen.add(word)
                hits.append(
                    CheckHit(
                        word=word,
                        reason=cat["reason"],
                        severity=cat["severity"],
                        suggestion="建议删除或改用中性表达",
                    )
                )
    return hits


async def _ai_scan(text: str) -> list[CheckHit]:
    """AI 语义检测,捕捉本地词库覆盖不到的隐性违规/限流表达。"""
    system = (
        "你是小红书内容合规审核专家,熟悉广告法极限词、医疗功效违规、"
        "虚假承诺、站外导流、敏感表达等平台限流/违规风险。"
    )
    prompt = (
        "审核以下文本,找出可能违反广告法或触发小红书限流的词句"
        "(含本地关键词匹配不到的隐性表达)。\n\n"
        f"【文本】\n{text}\n\n"
        '严格输出 JSON:{"hits":[{"word":"原文词句","reason":"风险原因",'
        '"severity":"high|medium|low","suggestion":"替换建议"}]}。若无风险则 hits 为空数组。'
    )
    try:
        data = await generate_json(system, prompt, fast=True, max_tokens=1500)
        return [CheckHit(**h) for h in data.get("hits", [])]
    except Exception:
        return []  # AI 复检失败不阻断本地结果


async def check_text(req: CheckRequest) -> CheckResponse:
    local = _local_scan(req.text)
    ai = await _ai_scan(req.text)

    # 合并去重(按 word)
    merged: dict[str, CheckHit] = {h.word: h for h in local}
    for h in ai:
        if h.word not in merged:
            merged[h.word] = h
    hits = list(merged.values())

    if not hits:
        return CheckResponse(risk_level="none", hits=[], summary="未发现明显风险词,可放心发布 ✅")

    top = max(hits, key=lambda h: _SEVERITY_RANK.get(h.severity, 0))
    level = top.severity
    summary = f"检测到 {len(hits)} 处风险词,最高风险等级:{level}。建议修改后再发布。"
    return CheckResponse(risk_level=level, hits=hits, summary=summary)
