from app.services.ai_model import generate_summary
import json
import re


def generate_quiz(documents, difficulty: str, num_questions: int = 5):
    combined_text = "\n".join(doc.raw_text for doc in documents)

    if not combined_text.strip():
        raise ValueError("Document text is empty.")

    words = combined_text.split()
    if len(words) > 50000:
        combined_text = " ".join(words[:50000])

    prompt = build_quiz_prompt(combined_text, difficulty, num_questions)
    raw_output = generate_summary(prompt)

    questions = parse_quiz_output(raw_output)
    return questions


def build_quiz_prompt(text, difficulty: str, num_questions: int):

    difficulty_instructions = {
        "easy": (
            "Generate EASY questions. "
            "Focus on basic definitions, simple facts, and straightforward recall. "
            "The correct answer should be clearly supported by the text. "
            "Wrong options should be obviously incorrect to someone who read the material."
        ),
        "medium": (
            "Generate MEDIUM difficulty questions. "
            "Focus on understanding concepts, relationships between ideas, and application. "
            "Wrong options should be plausible but clearly wrong to someone who studied the material."
        ),
        "hard": (
            "Generate HARD questions. "
            "Focus on deep understanding, nuanced differences, edge cases, and analysis. "
            "All options should seem plausible. Only someone who studied carefully will get it right."
        ),
    }

    difficulty_instr = difficulty_instructions.get(difficulty, difficulty_instructions["medium"])

    prompt = f"""You are an expert quiz generator for college students.

Generate exactly {num_questions} multiple choice questions from the study material below.

DIFFICULTY: {difficulty_instr}

STRICT OUTPUT FORMAT — respond ONLY with a valid JSON array, no extra text, no markdown, no explanation:
[
  {{
    "question": "Question text here?",
    "options": {{
      "A": "Option A text",
      "B": "Option B text",
      "C": "Option C text",
      "D": "Option D text"
    }},
    "correct_answer": "A",
    "explanation": "Brief explanation of why this is correct."
  }}
]

RULES:
- Generate exactly {num_questions} questions.
- Every question must have exactly 4 options (A, B, C, D).
- correct_answer must be one of: "A", "B", "C", "D".
- Only use information from the provided text.
- Do not repeat questions.
- Output ONLY the JSON array. Nothing else.

STUDY MATERIAL:
{text}"""

    return prompt


def parse_quiz_output(raw_output: str) -> list:
    # Strip markdown code fences if Gemini wraps in ```json ... ```
    cleaned = re.sub(r"```json|```", "", raw_output).strip()

    try:
        questions = json.loads(cleaned)
        if not isinstance(questions, list):
            raise ValueError("Output is not a JSON array")
        return questions
    except json.JSONDecodeError as e:
        print("JSON PARSE ERROR:", e)
        print("RAW OUTPUT:", raw_output[:500])
        raise ValueError("AI returned invalid JSON. Try again.")