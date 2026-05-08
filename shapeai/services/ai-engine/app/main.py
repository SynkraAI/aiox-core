from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI
from app.routers import analysis

BUILD_VERSION = "20260508-2"

app = FastAPI(title="ShapeAI AI Engine", version="1.0.0")
app.include_router(analysis.router)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/version")
async def version():
    return {
        "build": BUILD_VERSION,
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY")),
    }
