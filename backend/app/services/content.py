"""内容生产相关业务:标题、正文、仿写、标签。"""
from typing import Optional

from ..db_models import Account
from ..llm_client import generate_json
from ..schemas.models import (
    ContentRequest,
    ContentResponse,
    RewriteRequest,
    RewriteResponse,
    TagsRequest,
    TagsResponse,
    TitleItem,
    TitleRequest,
    TitleResponse,
)

XHS_PERSONA = (
    "你是资深小红书爆款内容操盘手,深谙平台调性:口语化、有情绪、重利他、"
    "善用 emoji 和分点排版,标题抓人但不做标题党虚假承诺,严格规避广告法极限词。"
)


def _account_block(account: Optional[Account]) -> str:
    """把账号档案拼成可注入 prompt 的定位说明;无账号返回空串。"""
    if not account:
        return ""
    parts = [f"账号名称:{account.name}"]
    if account.niche:
        parts.append(f"赛道:{account.niche}")
    if account.persona:
        parts.append(f"人设:{account.persona}")
    if account.audience:
        parts.append(f"目标人群:{account.audience}")
    if account.tone:
        parts.append(f"惯用语气:{account.tone}")
    if account.bio:
        parts.append(f"账号简介:{account.bio}")
    return (
        "请严格贴合以下账号的定位与人设来创作,保持口吻、视角、人群一致:\n【账号档案】\n"
        + "\n".join(parts)
        + "\n\n"
    )


async def gen_titles(
    req: TitleRequest, account: Optional[Account] = None
) -> TitleResponse:
    prompt = (
        _account_block(account)
        + f"为以下小红书笔记生成 {req.count} 个高点击率标题。\n"
        f"主题:{req.topic}\n"
        f"关键词:{req.keywords or '无'}\n\n"
        "要求:覆盖多种风格(痛点共鸣 / 数字干货 / 悬念好奇 / 利益点 / 身份代入),"
        "每个标题不超过 20 字,可适度使用 emoji。\n"
        '严格输出 JSON:{"titles":[{"title":"...","style":"痛点"}, ...]}'
    )
    data = await generate_json(XHS_PERSONA, prompt, max_tokens=1500)
    items = [TitleItem(**t) for t in data.get("titles", [])]
    return TitleResponse(titles=items)


async def gen_content(
    req: ContentRequest, account: Optional[Account] = None
) -> ContentResponse:
    prompt = (
        _account_block(account)
        + "为以下需求创作一篇完整的小红书笔记。\n"
        f"主题:{req.topic}\n"
        f"关键词:{req.keywords or '无'}\n"
        f"语气风格:{req.tone}\n"
        f"目标人群:{req.audience or '通用'}\n\n"
        "要求:标题抓人;正文开头 3 秒抓住注意力,分点+emoji 排版,有真实感和利他价值,"
        "结尾引导互动;标签 8-12 个。严格规避广告法极限词。\n"
        '严格输出 JSON:{"title":"...","body":"...","tags":["...","..."]}'
    )
    data = await generate_json(XHS_PERSONA, prompt, max_tokens=2500)
    return ContentResponse(
        title=data.get("title", ""),
        body=data.get("body", ""),
        tags=data.get("tags", []),
    )


async def rewrite(
    req: RewriteRequest, account: Optional[Account] = None
) -> RewriteResponse:
    prompt = (
        _account_block(account)
        + "下面是一篇小红书爆款笔记。请先拆解它的爆款结构(标题钩子、开头、正文骨架、"
        "情绪与利他点、结尾引导),再用同样的结构套路改写成新主题的全新笔记(内容原创,勿抄袭)。\n\n"
        f"【参考爆款】\n{req.source}\n\n"
        f"【新主题】{req.new_topic}\n\n"
        '严格输出 JSON:{"structure":"结构拆解说明","title":"...","body":"...","tags":["..."]}'
    )
    data = await generate_json(XHS_PERSONA, prompt, max_tokens=3000)
    return RewriteResponse(
        structure=data.get("structure", ""),
        title=data.get("title", ""),
        body=data.get("body", ""),
        tags=data.get("tags", []),
    )


async def gen_tags(req: TagsRequest) -> TagsResponse:
    prompt = (
        f"为以下小红书笔记推荐 {req.count} 个高曝光潜力的话题标签(不带 # 号)。\n"
        f"主题:{req.topic}\n"
        f"正文:{req.body or '无'}\n\n"
        "要求:覆盖大词(流量)+ 精准词(转化)+ 长尾词,贴合平台热门话题。\n"
        '严格输出 JSON:{"tags":["...","..."]}'
    )
    data = await generate_json(XHS_PERSONA, prompt, fast=True, max_tokens=800)
    return TagsResponse(tags=data.get("tags", []))
