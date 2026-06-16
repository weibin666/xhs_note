"""话术生成 + 封面文案生成。"""
from ..llm_client import generate_json
from ..schemas.models import (
    CoverTextItem,
    CoverTextRequest,
    CoverTextResponse,
    ScriptGenerateRequest,
    ScriptGenerateResponse,
)

SCRIPT_SYSTEM = (
    "你是小红书私域运营高手,擅长写自然、不机械、有温度的评论与私信话术,"
    "口语化、利他、避免硬广和违规导流措辞。"
)

COVER_SYSTEM = (
    "你是小红书封面文案专家,擅长写大字报式的封面主标题:短、有冲击力、戳痛点或给利益点,"
    "主标题不超过 12 字,副标题点缀。"
)


async def generate_scripts(req: ScriptGenerateRequest) -> ScriptGenerateResponse:
    prompt = (
        f"为以下场景写 {req.count} 条小红书运营话术。\n"
        f"场景:{req.scene}\n"
        f"背景:{req.context}\n\n"
        "要求:每条自然口语化、长度适中、风格略有差异,可适度用 emoji,不要编号前缀。\n"
        '严格输出 JSON:{"scripts":["话术1","话术2"]}'
    )
    data = await generate_json(SCRIPT_SYSTEM, prompt, fast=True, max_tokens=1500)
    return ScriptGenerateResponse(scripts=data.get("scripts", []))


async def generate_cover_text(req: CoverTextRequest) -> CoverTextResponse:
    prompt = (
        f"为以下小红书笔记主题生成 5 组封面文案。\n"
        f"主题:{req.topic}\n"
        f"风格:{req.style or '不限'}\n\n"
        "每组含主标题(大字,<=12字)和副标题(补充点缀,可空)。\n"
        '严格输出 JSON:{"items":[{"main":"...","sub":"..."}]}'
    )
    data = await generate_json(COVER_SYSTEM, prompt, fast=True, max_tokens=1000)
    return CoverTextResponse(items=[CoverTextItem(**i) for i in data.get("items", [])])
