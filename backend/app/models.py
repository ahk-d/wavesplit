from pydantic import BaseModel
from typing import List


class Segment(BaseModel):
    start: float
    end: float
    speaker: str
    text: str


class TranscriptionRequest(BaseModel):
    audio_url: str
    segments: List[Segment]