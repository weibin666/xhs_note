"""LLM 封装(DeepSeek,OpenAI 兼容接口):统一文本与 JSON 生成入口。"""
import json
from typing import Optional

from openai import AsyncOpenAI

from .config import settings

_client: Optional[AsyncOpenAI] = None


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        if not settings.deepseek_api_key:
            raise RuntimeError("未配置 DEEPSEEK_API_KEY,请在 backend/.env 中设置")
        _client = AsyncOpenAI(
            api_key=settings.deepseek_api_key,
            base_url=settings.base_url,
        )
    return _client


async def generate_text(
    system: str,
    prompt: str,
    *,
    fast: bool = False,
    max_tokens: int = 2048,
    temperature: float = 1.0,
) -> str:
    """普通文本生成,返回纯文本。"""
    client = get_client()
    model = settings.model_fast if fast else settings.model_high
    resp = await client.chat.completions.create(
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
    )
    return (resp.choices[0].message.content or "").strip()


async def generate_json(
    system: str,
    prompt: str,
    *,
    fast: bool = False,
    max_tokens: int = 2048,
    temperature: float = 1.0,
) -> dict:
    """要求模型输出 JSON,解析后返回 dict。

    使用 DeepSeek 的 JSON 输出模式(response_format=json_object);
    prompt 中已包含 "JSON" 字样与示例结构,符合该模式要求。
    偶发返回非法 JSON 时自动重试一次。
    """
    client = get_client()
    model = settings.model_fast if fast else settings.model_high
    last_err: Exception | None = None
    for _ in range(2):
        resp = await client.chat.completions.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
        )
        raw = resp.choices[0].message.content or ""
        try:
            return _parse_json(raw)
        except json.JSONDecodeError as e:
            last_err = e
    raise last_err  # type: ignore[misc]


def _parse_json(raw: str) -> dict:
    raw = raw.strip()
    # 去掉可能的 ```json 包裹
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1] if "```" in raw[3:] else raw
        raw = raw.lstrip("json").strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # 兜底:截取首个 { 到末个 }
        start, end = raw.find("{"), raw.rfind("}")
        if start != -1 and end != -1:
            return json.loads(raw[start : end + 1])
        raise
