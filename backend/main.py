from fastapi import FastAPI, UploadFile, File
import os
from pdf_extractor import extract_text_from_pdf

app = FastAPI()

UPLOAD_FOLDER = "uploads"

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    # Save the file locally
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    # Extract text from PDF
    extracted_text = extract_text_from_pdf(file_path)

    return {"filename": file.filename, "text": extracted_text}
