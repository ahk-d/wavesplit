from pydub import AudioSegment
import requests
from io import BytesIO
from typing import List
from .models import Segment


class AudioProcessor:
    @staticmethod
    def download_audio(url: str) -> AudioSegment:
        response = requests.get(url)
        audio_data = BytesIO(response.content)
        return AudioSegment.from_file(audio_data)

    @staticmethod
    def split_audio(audio: AudioSegment, segments: List[Segment], speaker: str) -> AudioSegment:
        speaker_segments = [seg for seg in segments if seg.speaker == speaker]
        if not speaker_segments:
            return None

        combined = AudioSegment.empty()
        for segment in speaker_segments:
            start_ms = int(segment.start * 1000)
            end_ms = int(segment.end * 1000)
            combined += audio[start_ms:end_ms]
            
        return combined

    @staticmethod
    def process_audio(audio_url: str, segments: List[Segment]) -> dict:
        try:
            audio = AudioProcessor.download_audio(audio_url)
            speakers = set(segment.speaker for segment in segments)
            
            result = {}
            for speaker in speakers:
                speaker_audio = AudioProcessor.split_audio(audio, segments, speaker)
                if speaker_audio:
                    buffer = BytesIO()
                    speaker_audio.export(buffer, format="mp3")
                    result[speaker] = buffer.getvalue()
            
            return result
        except Exception as e:
            raise Exception(f"Error processing audio: {str(e)}")