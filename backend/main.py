from fastapi import FastAPI, UploadFile, File
import os
from pdf_extractor import extract_text_from_pdf
from event_extractor import extract_events_from_text

app = FastAPI()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    extracted_text = extract_text_from_pdf(file_path)

    events = extract_events_from_text(extracted_text)

    return {"filename": file.filename, "events": events}
