from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "McCare API Phase 1"
    DEBUG: bool = True
    
    class Config:
        env_file = "../.env"

settings = Settings()
