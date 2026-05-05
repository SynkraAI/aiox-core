from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from app.routers import analysis

app = FastAPI(title="ShapeAI AI Engine", version="1.0.0")
app.include_router(analysis.router)

@app.get("/health")
async def health():
    return {"status": "ok"}
