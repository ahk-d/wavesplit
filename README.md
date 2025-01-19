```markdown
# Wave Splitter

A web application that allows users to visualize and split audio files based on speaker segments. It provides an interactive waveform visualization and enables downloading individual speaker segments.

![Audio Splitter Screenshot](public/screenshot.png)

## Features

- 🎵 Interactive waveform visualization
- 👥 Speaker-based audio segmentation
- 🎨 Unique color coding for each speaker
- ⬇️ Download individual speaker segments
- 🌓 Dark/Light theme support
- ⏯️ Click-to-play segments
- 📱 Responsive design

## Technology Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- WaveSurfer.js
- Material Design Color System

### Backend
- FastAPI
- Python 3.8+
- pydub for audio processing
- Pydantic for data validation

## Getting Started

You can run the application either using Docker or by setting up the development environment locally.

### Option 1: Docker Setup (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/yourusername/audio-splitter.git
cd audio-splitter
```

2. Make sure Docker and Docker Compose are installed on your system

3. Start the application:
```bash
docker-compose up
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Option 2: Local Development Setup

#### Prerequisites

Frontend:
- Node.js 18.17 or later
- npm or yarn

Backend:
- Python 3.8 or later
- pip
- FFmpeg (for audio processing)

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install frontend dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install fastapi uvicorn pydub requests python-multipart
```

4. Run the backend server:
```bash
uvicorn main:app --reload
```

## Project Structure

```
audio-splitter/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── AudioSplitter.tsx
│   │   │   └── WaveformPlayer.tsx
│   │   └── contexts/
│   │       └── ThemeContext.tsx
│   └── public/
│       └── screenshot.png
│
├── backend/
│   ├── main.py
│   ├── audio_processor.py
│   └── models.py
│
└── README.md
```

## Backend Components

### Models (`models.py`)
```python
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
```

### Audio Processor (`audio_processor.py`)
Handles audio file processing:
- Downloading audio from URL
- Splitting audio based on speaker segments
- Combining segments per speaker
- Converting to MP3 format

### FastAPI Server (`main.py`)
Provides the REST API endpoints:
- POST `/split-audio/{speaker}` - Splits audio by speaker

## API Endpoints

### Split Audio by Speaker
```
POST /split-audio/{speaker}
Content-Type: application/json

{
  "audio_url": "https://example.com/audio.mp3",
  "segments": [
    {
      "start": 0.0,
      "end": 2.5,
      "speaker": "A",
      "text": "Hello, how are you?"
    }
  ]
}
```

Response: MP3 file containing the speaker's segments

## Usage

1. Enter an audio URL in the input field
2. Paste the JSON transcription data with speaker segments
3. The waveform will display with color-coded regions for each speaker
4. Click on segments to play specific portions
5. Use the download button to get individual speaker audio files

### JSON Format

The transcription data should follow this format:
```json
[
  {
    "start": 0.0,
    "end": 2.5,
    "speaker": "A",
    "text": "Hello, how are you?"
  },
  {
    "start": 2.5,
    "end": 5.0,
    "speaker": "B",
    "text": "I'm doing well, thank you!"
  }
]
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

1. Audio processing fails
   - Ensure FFmpeg is installed and accessible in your PATH
   - Verify the audio URL is accessible
   - Check the audio format is supported

2. CORS errors
   - Verify the frontend URL is listed in the backend's CORS configuration
   - Check that credentials are properly handled

3. JSON parsing errors
   - Ensure the transcription JSON matches the expected format
   - Validate the timestamps are within the audio duration

4. Docker-related issues
   - Ensure both Docker and Docker Compose are installed and up to date
   - Check if ports 3000 and 8000 are available on your system
   - If volumes aren't updating, try rebuilding the containers:
     ```bash
     docker-compose down
     docker-compose up --build
     ```
   - For Windows users, ensure Docker Desktop is running with WSL 2 backend

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```
