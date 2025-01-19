from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from .models import TranscriptionRequest
from .audio_processor import AudioProcessor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]  # Important for file downloads
)

@app.post("/split-audio/{speaker}")
async def split_audio(speaker: str, request: TranscriptionRequest):
    try:
        result = AudioProcessor.process_audio(request.audio_url, request.segments)
        if speaker not in result:
            raise HTTPException(status_code=404, detail=f"No audio segments found for speaker {speaker}")
        
        return Response(
            content=result[speaker],
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f'attachment; filename="speaker_{speaker}.mp3"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))