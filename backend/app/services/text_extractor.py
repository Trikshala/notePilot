import re
from PyPDF2 import PdfReader
from io import BytesIO

def clean_text(text: str) -> str:
    text = re.sub(r'\n+', '\n', text)   
    text = re.sub(r'\s+', ' ', text)    
    return text.strip()


def extract_text_from_pdf(file_bytes : bytes) -> str:
    text = ""
    try:
        reader = PdfReader(BytesIO(file_bytes))
        for page in reader.pages:
            text += page.extract_text() or ""
    except Exception as e:
        print("Error Parsing PDF:",e)
    return clean_text(text)


def extract_text_from_txt(file_bytes : bytes) -> str:
    try:
        text = file_bytes.decode("utf-8", errors="ignore")
    except Exception as e:
        print("Error parsing TXT:", e)
    return clean_text(text)
