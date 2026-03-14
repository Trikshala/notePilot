from app.services.text_extractor import clean_text

def split_text_into_chunks(text, chunk_size: int = 700, overlap: int = 50) -> list[str]:
    text = clean_text(text)
    words = text.split()

    if len(words) <= chunk_size:
        return [text]

    if overlap >= chunk_size:
        overlap = chunk_size // 2

    chunks = []
    start = 0

    while start < len(words):
        end = min(start + chunk_size, len(words))
        ext_limit = 0

        while (
            end < len(words)
            and ext_limit < 20
            and not words[end].endswith(('.', '?', '!'))
        ):
            end += 1
            ext_limit += 1

        chunk_words = words[start:end]
        chunk_text = " ".join(chunk_words)
        chunks.append(chunk_text)

        if end == len(words):
            break

        start = end - overlap

    return chunks



