"""
MemoryManager — persistent bug memory for DebugBrain.

Storage strategy:
  - Default: JSON file-based storage (works out of the box)
  - Production: Hybrid approach. Auto-detects Hindsight Cloud for vector search
    while maintaining local JSON for complete history and frequency counting.
"""

import json
import os
import uuid
from datetime import datetime
from typing import List, Optional
from pathlib import Path

# Safely auto-detect Hindsight SDK
try:
    from hindsight import Hindsight
    HINDSIGHT_API_KEY = os.environ.get("HINDSIGHT_API_KEY")
    USE_HINDSIGHT = bool(HINDSIGHT_API_KEY)
    if USE_HINDSIGHT:
        hindsight_client = Hindsight(api_key=HINDSIGHT_API_KEY)
    else:
        hindsight_client = None
except ImportError:
    USE_HINDSIGHT = False
    hindsight_client = None

MEMORY_DIR = Path("./data/memory")
HISTORY_DIR = Path("./data/history")
MEMORY_DIR.mkdir(parents=True, exist_ok=True)
HISTORY_DIR.mkdir(parents=True, exist_ok=True)


def _user_memory_path(user_id: str) -> Path:
    return MEMORY_DIR / f"{user_id}.json"


def _user_history_path(user_id: str) -> Path:
    return HISTORY_DIR / f"{user_id}.json"


def _load_json(path: Path) -> list:
    if path.exists():
        with open(path, "r") as f:
            return json.load(f)
    return []


def _save_json(path: Path, data: list):
    with open(path, "w") as f:
        json.dump(data, f, indent=2, default=str)


class MemoryManager:
    """Manages per-user bug memory with search and frequency tracking."""

    async def store_bug(self, user_id: str, bug: dict, language: str):
        """Store a detected bug in the user's memory."""
        error_type = bug.get("error_type", "Unknown")
        now_iso = datetime.utcnow().isoformat()
        memories = _load_json(_user_memory_path(user_id))
        
        # 1. Update local JSON (Required for frequency tracking & UI tables)
        existing = next(
            (m for m in memories
             if m.get("error_type") == error_type and m.get("language") == language),
            None
        )

        if existing:
            existing["frequency"] = existing.get("frequency", 1) + 1
            existing["last_seen"] = now_iso
            existing["fix"] = bug.get("fixed_code", existing.get("fix"))
            freq = existing["frequency"]
        else:
            freq = 1
            memories.append({
                "id": str(uuid.uuid4()),
                "error_type": error_type,
                "language": language,
                "cause": bug.get("description", ""),
                "fix": bug.get("fixed_code", ""),
                "prevention_tip": bug.get("prevention_tip", ""),
                "frequency": freq,
                "first_seen": now_iso,
                "last_seen": now_iso,
            })

        _save_json(_user_memory_path(user_id), memories)

        # 2. Append to debug history
        history = _load_json(_user_history_path(user_id))
        history.insert(0, {
            "id": str(uuid.uuid4()),
            "error_type": error_type,
            "severity": bug.get("severity", "error"),
            "title": bug.get("title", error_type),
            "language": language,
            "line_number": bug.get("line_number"),
            "timestamp": now_iso,
            "fixed": True,
        })
        _save_json(_user_history_path(user_id), history[:100])

        # 3. Hindsight Cloud Storage (For vectorized semantic search)
        if USE_HINDSIGHT and hindsight_client:
            try:
                await hindsight_client.memory.store(
                    user_id=user_id,
                    content=json.dumps({
                        "error_type": error_type,
                        "language": language,
                        "cause": bug.get("description"),
                        "fix": bug.get("fixed_code"),
                        "prevention_tip": bug.get("prevention_tip"),
                        "frequency": freq  # Include frequency for AI context
                    }),
                    metadata={"language": language, "error_type": error_type}
                )
            except Exception as e:
                print(f"Hindsight store error: {e}")

    async def search_similar_bugs(
        self, code: str, language: str, user_id: str, top_k: int = 5
    ) -> List[dict]:
        """Search memory for bugs similar to what's in the current code."""
        
        # Try Hindsight semantic search first
        if USE_HINDSIGHT and hindsight_client:
            try:
                results = await hindsight_client.memory.search(
                    user_id=user_id,
                    query=code[:500],
                    top_k=top_k,
                    filters={"language": language}
                )
                
                parsed_results = []
                for r in results:
                    try:
                        # CRITICAL FIX: Parse the stringified JSON back into a dictionary
                        parsed_results.append(json.loads(r.content))
                    except (json.JSONDecodeError, AttributeError):
                        pass
                        
                if parsed_results:
                    return parsed_results
            except Exception as e:
                print(f"Hindsight search error: {e}. Falling back to JSON.")

        # Fallback to local JSON search
        memories = _load_json(_user_memory_path(user_id))
        lang_memories = [m for m in memories if m.get("language") == language]
        lang_memories.sort(key=lambda x: x.get("frequency", 1), reverse=True)
        return lang_memories[:top_k]

    async def get_bug_frequency(self, user_id: str, error_type: str) -> int:
        """Return how many times a user has had a specific error type."""
        memories = _load_json(_user_memory_path(user_id))
        entry = next((m for m in memories if m.get("error_type") == error_type), None)
        return entry.get("frequency", 0) if entry else 0

    async def get_all_memories(self, user_id: str, limit: int = 20) -> List[dict]:
        """Return all stored bug memories for a user."""
        memories = _load_json(_user_memory_path(user_id))
        memories.sort(key=lambda x: x.get("frequency", 1), reverse=True)
        return memories[:limit]

    async def get_history(self, user_id: str, limit: int = 30) -> List[dict]:
        """Return debug history timeline."""
        history = _load_json(_user_history_path(user_id))
        return history[:limit]

    async def clear_user_memory(self, user_id: str):
        """Delete all memories for a user."""
        path = _user_memory_path(user_id)
        if path.exists():
            path.unlink()