from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # DeepSeek(OpenAI 兼容接口)
    deepseek_api_key: str = ""
    base_url: str = "https://api.deepseek.com"
    model_high: str = "deepseek-chat"  # 高质量生成
    model_fast: str = "deepseek-chat"  # 轻任务(DeepSeek 无独立廉价档,默认同款)
    frontend_origin: str = "http://localhost:3000"


settings = Settings()
