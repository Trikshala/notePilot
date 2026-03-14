from app.services.ai_model import generate_summary


def generate_notes(documents, style, length):
    combined_text = "\n".join(doc.raw_text for doc in documents)

    if not combined_text.strip():
        raise ValueError("Document text is empty.")

    words = combined_text.split()
    if len(words) > 50000:
        combined_text = " ".join(words[:50000])

    prompt = build_final_prompt(combined_text, style, length)
    return generate_summary(prompt)


def build_final_prompt(text, style, length):

    style_instructions = {
        "bullet": (
            "Format the notes ONLY as bullet points. "
            "Use '•' for main points. "
            "Group related bullets under a bold heading like **Topic Name**. "
            "Do not write paragraphs."
        ),
        "paragraph": (
            "Write the notes in clean, concise paragraphs. "
            "Each paragraph covers one main concept. "
            "Use a bold heading like **Topic Name** before each paragraph. "
            "Do not use bullet points."
        ),
        "structured": (
            "Write fully structured study notes. "
            "Use bold headings like **Topic Name**, sub-headings, and bullet points under each section. "
            "Include definitions, key terms, and important concepts clearly labeled. "
            "Make it look like proper textbook-style study notes."
        ),
    }

    length_instructions = {
        "short": (
            "Be very concise. Only include the most critical points. "
            "Aim for a brief summary a student could review in 2 minutes."
        ),
        "medium": (
            "Cover all key concepts with moderate detail. "
            "Balance thoroughness and conciseness. "
            "A student should be able to review this in 5 minutes."
        ),
        "long": (
            "Cover every concept thoroughly with clear explanations. "
            "Include definitions, examples where helpful, and all important details. "
            "This should serve as a complete study reference."
        ),
    }

    style_instr = style_instructions.get(style, style_instructions["bullet"])
    length_instr = length_instructions.get(length, length_instructions["medium"])

    prompt = f"""You are an expert study notes generator for college students.

Your task is to convert the provided study material into high-quality notes.

STYLE INSTRUCTIONS:
{style_instr}

LENGTH INSTRUCTIONS:
{length_instr}

STRICT RULES:
- Only use information from the provided text. Do not add outside knowledge.
- Do not include any intro like "Here are your notes". Just output the notes directly.
- Highlight key terms by making them bold using **term**.
- Keep the output clean and ready to display to a student.

STUDY MATERIAL:
{text}

NOTES:"""

    return prompt