
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.deps import get_current_user
from groq import Groq
import os
import json

router = APIRouter()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class GenerateTaskRequest(BaseModel):
    title: str

@router.post("/ai/generate-task")
def generate_task(
    data: GenerateTaskRequest,
    current_user=Depends(get_current_user)
):
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "user",
                "content": f"""You are a project manager helping write task details.

Given this task title: "{data.title}"

Respond ONLY with a valid JSON object like this:
{{
  "description": "2-3 sentence description of what this task involves",
  "priority": "HIGH or MEDIUM or LOW",
  "acceptance_criteria": "One sentence describing what done looks like"
}}

No markdown, no explanation, only JSON."""
            }],
            max_tokens=200,
            temperature=0.4
        )

        raw = response.choices[0].message.content.strip()
        result = json.loads(raw)
        return result

    except Exception as e:
        print("GROQ ERROR:", str(e))
        return {
            "description": "",
            "priority": "MEDIUM",
            "acceptance_criteria": ""
        }