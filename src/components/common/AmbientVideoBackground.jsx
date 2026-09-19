import React, { useRef, useEffect, useState } from 'react';
import LivingBackgroundCanvas from './LivingBackgroundCanvas';
import './background.css';

/**
 * AmbientVideoBackground — SmartMaze Cinematic Visual Foundation
 * Full viewport slow-motion desaturated blurred video background with dark sage overlay,
 * restrained vignette, and pure CSS atmospheric fallback.
 *
 * @param {string} videoSrc - Video file URL or path
 * @param {string} poster - Poster frame image URL
 * @param {number} overlayStrength - Opacity of the dark sage overlay (0 to 1)
 * @param {string} blurAmount - CSS blur value (e.g., '32px')
 * @param {number} playbackRate - Slow motion playback speed (default 0.7)
 * @param {boolean} showCanvasOverlay - Whether to render LivingBackgroundCanvas overlay
 * @param {string} canvasMode - Living canvas mode ('neutral' | 'play' | 'create' | 'lab' | 'settings')
 * @param {string} className - Additional CSS class names
 */
export default function AmbientVideoBackground({
  videoSrc = null,
  poster = null,
  overlayStrength = 0.84,
  blurAmount = '32px',
  playbackRate = 0.7,
  showCanvasOverlay = false,
  canvasMode = 'neutral',
  isCameraPush = false,
  className = '',
}) {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Apply playback rate on load and rate update
  useEffect(() => {
    if (videoRef.current && !videoError) {
      try {
        videoRef.current.playbackRate = playbackRate;
      } catch (err) {
        // Fallback for browsers restricting playbackRate changes
      }
    }
  }, [playbackRate, videoReady, videoError]);

  const handleVideoCanPlay = () => {
    setVideoReady(true);
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy prevented playback; keep static frame or fallback
      });
    }
  };

  const handleVideoError = () => {
    setVideoError(true);
    setVideoReady(false);
  };

  const isVideoActive = Boolean(videoSrc) && !videoError;

  return (
    <div 
      className={`smartmaze-bg-root ${className}`.trim()} 
      aria-hidden="true"
      style={{ '--bg-blur-amount': blurAmount }}
    >
      {/* 1. Video Layer or Fallback Atmosphere */}
      {isVideoActive ? (
        <div className="smartmaze-bg-video-container">
          <video
            ref={videoRef}
            src={videoSrc}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            onCanPlay={handleVideoCanPlay}
            onError={handleVideoError}
            className={`smartmaze-bg-video ${isCameraPush ? 'smartmaze-bg-video--camera-push' : ''}`.trim()}
            style={{ opacity: videoReady ? 1 : 0, transition: 'opacity 800ms ease' }}
          />
        </div>
      ) : (
        <div className="smartmaze-bg-fallback" />
      )}

      {/* 2. Environmental Overlays */}
      <div 
        className="smartmaze-bg-overlay" 
        style={{ opacity: overlayStrength }}
      />
      <div className="smartmaze-bg-vignette" />

      {/* 3. Optional Living Canvas Overlay */}
      {showCanvasOverlay && (
        <LivingBackgroundCanvas mode={canvasMode} />
      )}
    </div>
  );
}
