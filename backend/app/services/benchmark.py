"""竞品对标:把竞品笔记交给 AI 做定位/策略/差距分析。"""
from ..llm_client import generate_json
from ..schemas.models import BenchmarkRequest, BenchmarkResponse

SYSTEM = (
    "你是小红书竞品分析顾问,擅长从对方的笔记内容反推其账号定位、内容策略和增长打法,"
    "并给出可落地的对标建议。分析要具体,避免泛泛而谈。"
)


async def benchmark(req: BenchmarkRequest) -> BenchmarkResponse:
    prompt = (
        "分析以下竞品的小红书笔记内容,做对标分析。\n\n"
        f"【竞品笔记】\n{req.competitor_notes}\n\n"
        f"【我的账号定位】{req.my_positioning or '(未提供,可基于行业通用视角)'}\n\n"
        "请输出:\n"
        "1. 竞品定位与人设\n"
        "2. 内容策略/选题套路\n"
        "3. 竞品强项(3-5 条)\n"
        "4. 我可补足的差距/机会点(3-5 条)\n"
        "5. 可落地的行动建议(3-5 条)\n\n"
        '严格输出 JSON:{"positioning":"...","content_strategy":"...",'
        '"strengths":["..."],"my_gaps":["..."],"suggestions":["..."]}'
    )
    data = await generate_json(SYSTEM, prompt, max_tokens=2500)
    return BenchmarkResponse(
        positioning=data.get("positioning", ""),
        content_strategy=data.get("content_strategy", ""),
        strengths=data.get("strengths", []),
        my_gaps=data.get("my_gaps", []),
        suggestions=data.get("suggestions", []),
    )
