"""爆款笔记拆解器:把一篇爆款拆成可复用的结构套路。"""
from ..llm_client import generate_json
from ..schemas.models import AnalyzeRequest, AnalyzeResponse, StructureSection

SYSTEM = (
    "你是顶级的小红书爆款方法论研究者,擅长把一篇爆款笔记逆向拆解成可复制的结构与套路,"
    "输出要具体、可操作,避免空话。"
)


async def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    prompt = (
        "请拆解下面这篇小红书爆款笔记,输出结构化的爆款套路分析。\n\n"
        f"【标题】{req.title or '(未提供)'}\n"
        f"【正文】\n{req.body}\n\n"
        "要求逐项分析:\n"
        "1. 标题钩子类型(如:痛点/数字/悬念/身份/反差)及具体拆解\n"
        "2. 开头手法(前 3 行如何抓住注意力)\n"
        "3. 正文骨架(分成几个层次,每层作用)\n"
        "4. 情绪与利他价值点\n"
        "5. 结尾引导手法\n"
        "6. 标签套路\n"
        "7. 可直接复用的套路清单(3-6 条,可套到别的主题上)\n\n"
        '严格输出 JSON:{"hook_type":"...","hook_analysis":"...","opening":"...",'
        '"structure":[{"section":"开头","purpose":"..."}],"emotion_value":"...",'
        '"ending":"...","tags_pattern":"...","takeaways":["...","..."]}'
    )
    data = await generate_json(SYSTEM, prompt, max_tokens=3000)
    return AnalyzeResponse(
        hook_type=data.get("hook_type", ""),
        hook_analysis=data.get("hook_analysis", ""),
        opening=data.get("opening", ""),
        structure=[StructureSection(**s) for s in data.get("structure", [])],
        emotion_value=data.get("emotion_value", ""),
        ending=data.get("ending", ""),
        tags_pattern=data.get("tags_pattern", ""),
        takeaways=data.get("takeaways", []),
    )
