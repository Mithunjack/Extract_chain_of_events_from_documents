from transformers import pipeline

# Load the model (first time it will download from Hugging Face)
event_extraction_pipe = pipeline(
    "text-generation",
    model="HuggingFaceH4/zephyr-7b-beta",
    device="cpu"  # Set "cuda" if GPU is available
)

def extract_events_from_text(text):
    prompt = f"Extract all events (meetings, deadlines, tasks) with their times from the following text:\n\n{text}\n\nOutput them as a JSON list of objects with 'event' and 'time'."
    result = event_extraction_pipe(prompt, max_new_tokens=500, do_sample=True)
    return result[0]['generated_text']
