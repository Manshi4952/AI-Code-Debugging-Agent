from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

from analyzer import analyze_code_with_groq
from memory import MemoryManager

app = FastAPI(title="DebugBrain API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your Vercel URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

memory_manager = MemoryManager()


class AnalyzeRequest(BaseModel):
    code: str
    language: str
    user_id: str = "default_user"


class ChatRequest(BaseModel):
    message: str
    code: str = ""
    language: str = "python"
    user_id: str = "default_user"
    history: List[dict] = []


@app.get("/")
def root():
    return {"status": "DebugBrain API running", "version": "1.0.0"}


@app.post("/analyze")
async def analyze_code(req: AnalyzeRequest):
    """Analyze code for bugs, cross-reference with memory, return structured results."""
    try:
        # 1. Retrieve past similar bugs from memory
        past_bugs = await memory_manager.search_similar_bugs(
            code=req.code,
            language=req.language,
            user_id=req.user_id,
            top_k=5
        )

        # 2. Run AI analysis via Groq
        result = await analyze_code_with_groq(
            code=req.code,
            language=req.language,
            past_bugs=past_bugs
        )

        # 3. Store each detected bug in memory
        for bug in result.get("bugs", []):
            await memory_manager.store_bug(
                user_id=req.user_id,
                bug=bug,
                language=req.language
            )

        # 4. Attach recurring info from memory to each bug
        for bug in result.get("bugs", []):
            freq = await memory_manager.get_bug_frequency(
                user_id=req.user_id,
                error_type=bug.get("error_type", "")
            )
            bug["frequency"] = freq
            bug["is_recurring"] = freq > 1

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
async def chat_debug(req: ChatRequest):
    """AI chat assistant for debugging questions."""
    try:
        from analyzer import chat_with_groq
        past_bugs = await memory_manager.search_similar_bugs(
            code=req.code or req.message,
            language=req.language,
            user_id=req.user_id,
            top_k=3
        )
        response = await chat_with_groq(
            message=req.message,
            code=req.code,
            language=req.language,
            history=req.history,
            past_bugs=past_bugs
        )
        return {"reply": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/memory/{user_id}")
async def get_memory(user_id: str, limit: int = 20):
    """Fetch all stored bug memories for a user."""
    try:
        memories = await memory_manager.get_all_memories(user_id=user_id, limit=limit)
        return {"memories": memories, "count": len(memories)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history/{user_id}")
async def get_history(user_id: str, limit: int = 30):
    """Fetch debug history timeline for a user."""
    try:
        history = await memory_manager.get_history(user_id=user_id, limit=limit)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/memory/{user_id}")
async def clear_memory(user_id: str):
    """Clear all memories for a user."""
    try:
        await memory_manager.clear_user_memory(user_id=user_id)
        return {"message": f"Memory cleared for user {user_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
