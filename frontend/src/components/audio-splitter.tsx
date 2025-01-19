// src/components/AudioSplitter.tsx
'use client';
import { useState } from 'react';
import WaveformPlayer from './waveform-player';

interface Segment {
  start: number;
  end: number;
  speaker: string;
  text: string;
}

export default function AudioSplitter() {
  const [audioUrl, setAudioUrl] = useState('');
  const [transcription, setTranscription] = useState('');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleTranscriptionChange = (value: string) => {
    setTranscription(value);
    try {
      const parsed = JSON.parse(value);
      setSegments(parsed);
      if (parsed.length > 0 && audioUrl) {
        setIsExpanded(false);
      }
    } catch (e) {
      // Invalid JSON, ignore
    }
  };

  const handleDownload = async (speaker: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/split-audio/${speaker}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          audio_url: audioUrl,
          segments,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `speaker_${speaker}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing audio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="relative bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out">
        {/* Input Form */}
        <div 
          className={`transform transition-all duration-300 ease-in-out origin-top ${
            isExpanded ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 h-0'
          }`}
        >
          <div className="p-6 space-y-4">
            <div>
              <label className="block mb-2 font-semibold text-gray-900 dark:text-white">
                Audio URL
              </label>
              <input
                type="url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded 
                         bg-white dark:bg-zinc-900 
                         text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-[#ff5500] focus:border-transparent
                         transition-colors"
                placeholder="Enter audio URL"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 dark:text-white">
                Transcription JSON
              </label>
              <textarea
                value={transcription}
                onChange={(e) => handleTranscriptionChange(e.target.value)}
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded 
                         bg-white dark:bg-zinc-900 
                         text-gray-900 dark:text-white
                         font-mono text-sm
                         focus:ring-2 focus:ring-[#ff5500] focus:border-transparent
                         transition-colors h-48"
                placeholder="Paste JSON transcription data here"
                required
              />
              {transcription && !segments.length && (
                <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                  Invalid JSON format
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Collapsed Header */}
        {!isExpanded && (
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Audio URL:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xl">
                {audioUrl}
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                       transition-colors"
            >
              <svg 
                className="w-5 h-5 transform transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {audioUrl && segments.length > 0 && (
        <div className="space-y-8">
          <WaveformPlayer 
            audioUrl={audioUrl} 
            segments={segments} 
            onDownload={handleDownload} 
          />
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <svg className="animate-spin h-5 w-5 text-[#ff5500]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-900 dark:text-white">Processing audio...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}