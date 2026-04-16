import json
import os
from groq import AsyncGroq
from groq.types.chat import ChatCompletionMessageParam
from typing import List

client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY", ""))

ANALYZE_SYSTEM_PROMPT = """You are DebugBrain, an expert AI code debugging assistant with memory of past bugs.

Your job is to:
1. Detect ALL bugs in the provided code (syntax errors, logic errors, runtime errors, edge cases)
2. For each bug, provide a clear explanation and corrected code
3. Reference past bugs from memory when relevant
4. Give personalized tips based on the user's recurring patterns

You MUST respond with valid JSON only. No extra text. Use this exact structure:
{
  "summary": "Brief overall summary of the code quality",
  "bugs": [
    {
      "id": "bug_1",
      "error_type": "IndexError",
      "severity": "error",
      "line_number": 6,
      "title": "Short bug title",
      "description": "Detailed explanation of why this is a bug",
      "buggy_code": "the problematic line or snippet",
      "fixed_code": "the corrected line or snippet",
      "explanation": "Step-by-step explanation of the fix",
      "prevention_tip": "How to avoid this in future"
    }
  ],
  "overall_tips": ["tip1", "tip2"],
  "code_quality_score": 7
}

Severity levels: "error" (crashes), "warning" (logic issues), "info" (style/performance)
"""


async def analyze_code_with_groq(
    code: str,
    language: str,
    past_bugs: List[dict],
) -> dict:
    """Send code to Groq for analysis, injecting past bug memory as context."""

    past_context = ""
    if past_bugs:
        past_context = "\n\n=== USER'S PAST BUG MEMORY ===\n"
        for bug in past_bugs:
            past_context += (
                f"- {bug.get('error_type', 'Unknown')}: {bug.get('cause', '')} "
                f"| Fix: {bug.get('fix', '')} | Seen: {bug.get('frequency', 1)}x\n"
            )
        past_context += "\nUse this memory to identify recurring patterns and mention them in your analysis."

    user_message = (
        f"Analyze this {language} code for bugs:\n\n"
        f"```{language}\n{code}\n```\n"
        f"{past_context}\n\nRespond with JSON only."
    )

    # Fix 1: properly typed messages
    messages: List[ChatCompletionMessageParam] = [
        {"role": "system", "content": ANALYZE_SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    response = await client.chat.completions.create(
        model="llama-3.1-70b-versatile",
        messages=messages,
        temperature=0.1,
        max_tokens=2000,
    )

    # Fix 2: .content can be None — use "or" to guarantee a str
    raw: str = (response.choices[0].message.content or "").strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1] if len(parts) > 1 else raw
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        result: dict = json.loads(raw)
    except json.JSONDecodeError:
        result = {
            "summary": "Analysis complete",
            "bugs": [],
            "overall_tips": [],
            "code_quality_score": 5,
            "raw_response": raw,
        }

    return result


async def chat_with_groq(
    message: str,
    code: str,
    language: str,
    history: List[dict],
    past_bugs: List[dict],
) -> str:
    """Handle conversational debugging chat with context."""

    past_context = ""
    if past_bugs:
        past_context = "\n\nRelevant past bugs from user memory:\n"
        for bug in past_bugs:
            past_context += (
                f"- {bug.get('error_type', 'Unknown')}: {bug.get('cause', '')} "
                f"(seen {bug.get('frequency', 1)}x)\n"
            )

    system_prompt = (
        "You are DebugBrain, a personalized AI debugging assistant.\n"
        "You have memory of the user's past bugs and patterns.\n"
        "Be concise, helpful, and specific. Reference past patterns when relevant.\n"
        f"{past_context}\n"
        f"Current code language: {language}"
    )

    # Fix 3: properly typed messages
    messages: List[ChatCompletionMessageParam] = [
        {"role": "system", "content": system_prompt}
    ]

    # Add conversation history — only keep valid roles
    for h in history[-6:]:
        role = h.get("role", "")
        content = h.get("content", "")
        if role == "user" and isinstance(content, str):
            messages.append({"role": "user", "content": content})
        elif role == "assistant" and isinstance(content, str):
            messages.append({"role": "assistant", "content": content})

    user_content = (
        f"Code:\n```{language}\n{code}\n```\n\n{message}" if code else message
    )
    messages.append({"role": "user", "content": user_content})

    response = await client.chat.completions.create(
        model="llama-3.1-70b-versatile",
        messages=messages,
        temperature=0.3,
        max_tokens=800,
    )

    # Fix 4: .content can be None — return empty string as fallback
    return response.choices[0].message.content or ""
