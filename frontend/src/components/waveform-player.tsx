// src/components/WaveformPlayer.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.js';
import HoverPlugin from 'wavesurfer.js/dist/plugins/hover.js';
import { useTheme } from '../theme-context';

interface WaveformPlayerProps {
  audioUrl: string;
  segments: any[];
  onDownload: (speaker: string) => void;
}

const speakerColors = [
    'rgba(255, 111, 97, 0.5)',    // Coral Red
    'rgba(87, 202, 244, 0.5)',    // Bright Sky Blue
    'rgba(255, 206, 84, 0.5)',    // Sunny Yellow
    'rgba(172, 121, 255, 0.5)',   // Bright Purple
    'rgba(88, 235, 160, 0.5)',    // Mint Green
    'rgba(255, 138, 48, 0.5)',    // Tangerine
    'rgba(75, 207, 250, 0.5)',    // Aqua Blue
    'rgba(255, 112, 166, 0.5)',   // Bubblegum Pink
    'rgba(130, 230, 123, 0.5)',   // Fresh Green
    'rgba(255, 163, 222, 0.5)',   // Cotton Candy
    'rgba(91, 192, 235, 0.5)',    // Ocean Blue
    'rgba(255, 169, 77, 0.5)',    // Mango
    'rgba(112, 224, 210, 0.5)',   // Turquoise
    'rgba(255, 145, 120, 0.5)',   // Peach
    'rgba(149, 207, 255, 0.5)',   // Baby Blue
    'rgba(255, 196, 106, 0.5)',   // Golden Yellow
  ];
export default function WaveformPlayer({ audioUrl, segments, onDownload }: WaveformPlayerProps) {
  const { theme } = useTheme();
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Group segments by speaker
  const groupedSegments = segments.reduce((acc, segment) => {
    if (!acc[segment.speaker]) {
      acc[segment.speaker] = [];
    }
    acc[segment.speaker].push(segment);
    return acc;
  }, {} as Record<string, typeof segments>);

  // Get unique speakers and create color mapping
  const uniqueSpeakers = [...new Set(segments.map(segment => segment.speaker))];
  const speakerColorMap = Object.fromEntries(
    uniqueSpeakers.map((speaker, index) => [speaker, speakerColors[index]])
  );

  const handleSegmentClick = (segment) => {
    if (!wavesurfer.current) return;
    
    // Get region for this segment
    const regionId = `${segment.start}-${segment.end}`;
    const regions = wavesurfer.current.plugins[0].regions;
    const region = regions[regionId];

    // Always pause current playback first
    wavesurfer.current.pause();
    
    if (region) {
      // Play the specific region
      region.play();
    } else {
      // Fallback if region not found
      wavesurfer.current.setTime(segment.start);
      wavesurfer.current.play();
      
      // Stop when reaching segment end
      const checkEnd = () => {
        if (wavesurfer.current?.getCurrentTime() >= segment.end) {
          wavesurfer.current.pause();
          wavesurfer.current.un('audioprocess', checkEnd);
        }
      };
      wavesurfer.current.on('audioprocess', checkEnd);
    }
  };

  useEffect(() => {
    if (!waveformRef.current) return;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      height: 128,
      waveColor: theme === 'light' ? '#ccc' : '#4a5568',
      progressColor: '#ff5500',
      cursorColor: '#ff5500',
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      barHeight: 0.9,
      minPxPerSec: 50,
      fillParent: true,
      plugins: [
        RegionsPlugin.create({
          dragSelection: false,
          regionsMinLength: 0,
          regions: {
            borderLeft: false,
            borderRight: false,
            handleStyle: {
              left: { display: 'none' },
              right: { display: 'none' }
            }
          }
        }),
        TimelinePlugin.create({
          height: 20,
          insertPosition: 'beforebegin',
          style: {
            color: theme === 'light' ? '#999' : '#ccc',
            fontSize: '10px',
            fontFamily: 'monospace'
          }
        }),
        HoverPlugin.create({
          lineColor: '#fff',
          lineWidth: 2,
          labelBackground: '#000',
          labelColor: '#fff',
          labelSize: '11px'
        })
      ]
    });

    wavesurfer.current = ws;

    ws.load(audioUrl);

    ws.on('ready', () => {
      setDuration(ws.getDuration());
      
      segments.forEach((segment) => {
        ws.plugins[0].addRegion({
          start: segment.start,
          end: segment.end,
          color: speakerColorMap[segment.speaker],
          id: `${segment.start}-${segment.end}`,
          content: segment.speaker,
          data: {
            speaker: segment.speaker,
            systemRegionId: `${segment.start}-${segment.end}`
          }
        });
      });
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));
    ws.on('audioprocess', (time) => setCurrentTime(time));

    return () => {
      ws.destroy();
    };
  }, [audioUrl, segments, theme]);

  const togglePlayPause = () => {
    if (!wavesurfer.current) return;
    wavesurfer.current.playPause();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
      {/* Player controls and waveform */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={togglePlayPause}
            className="w-12 h-12 flex items-center justify-center bg-[#ff5500] text-white rounded-full hover:bg-[#ff7700] transition-colors"
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-x-2">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        <div 
          ref={waveformRef} 
          className="bg-white dark:bg-zinc-800 rounded-lg shadow-inner p-4"
        />
      </div>

      {/* Speakers and transcripts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(groupedSegments).map(([speaker, speakerSegments]) => (
          <div 
            key={speaker}
            className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 border border-gray-100 dark:border-zinc-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: speakerColorMap[speaker] }}
                />
                Speaker {speaker}
              </h3>
              <button
                onClick={() => onDownload(speaker)}
                className="px-4 py-2 bg-[#ff5500] text-white rounded-full hover:bg-[#ff7700] transition-colors text-sm"
              >
                Download Audio
              </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {speakerSegments.map((segment, index) => (
                <div 
                  key={index}
                  className="p-3 rounded bg-zinc-50 dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 cursor-pointer transition-colors"
                  onClick={() => handleSegmentClick(segment)}
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {formatTime(segment.start)} - {formatTime(segment.end)}
                  </div>
                  <div className="text-sm text-gray-900 dark:text-gray-100">{segment.text}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}