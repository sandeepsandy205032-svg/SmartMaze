import React, { useState } from 'react';
import AmbientVideoBackground from '../common/AmbientVideoBackground';
import PrimaryButton from '../common/PrimaryButton';
import MazeLoadingSpinner from '../common/MazeLoadingSpinner';
import './landing.css';

/**
 * LandingHero — SmartMaze Cinematic Landing Page Component
 * Full viewport visual opening scene featuring editorial title typography,
 * atmospheric desaturated video background, and subtle environmental CTA hover response.
 *
 * @param {Function} onEnter - Callback function executed when "ENTER SMARTMAZE" action is pressed
 * @param {string} videoSrc - Optional video file path
 * @param {string} className - Additional CSS class
 */
export default function LandingHero({
  onEnter,
  isEntering = false,
  videoSrc = '/assets/media/smartmaze-landing (3).mp4',
  className = '',
}) {
  const [isCtaHovered, setIsCtaHovered] = useState(false);

  return (
    <div className={`smartmaze-landing-root ${className}`.trim()}>
      {/* 1. Environmental Backdrop with Camera Push Depth Response */}
      <AmbientVideoBackground
        videoSrc={videoSrc}
        overlayStrength={isEntering ? 0.25 : (isCtaHovered ? 0.28 : 0.35)}
        blurAmount={isEntering ? '3px' : (isCtaHovered ? '2px' : '8px')}
        playbackRate={0.7}
        showCanvasOverlay={true}
        canvasMode="neutral"
        isCameraPush={isEntering}
      />

      {/* 2. Editorial Spatial Content (Recedes into depth on entry) */}
      <div className={`smartmaze-landing-content ${isEntering ? 'smartmaze-landing-content--receding' : ''}`.trim()}>
        {/* Restrained Metadata */}
        <p className="text-meta smartmaze-landing-meta">
          SYSTEM READY — INTERACTIVE MAZE ENVIRONMENT
        </p>

        {/* Main Display Title (Cinzel Architectural Serif) */}
        <h1 className="smartmaze-landing-title">
          SMARTMAZE
        </h1>

        {/* Structural Accent Line */}
        <div className="smartmaze-landing-divider" />

        {/* Tagline */}
        <p className="smartmaze-landing-tagline">
          Think. Navigate. Solve.
        </p>

        {/* Supporting Description */}
        <p className="smartmaze-landing-description">
          An atmospheric environment dedicated to pathfinding analysis and spatial maze navigation.
        </p>

        {/* Main Entry Action */}
        <div className="smartmaze-landing-action">
          <PrimaryButton
            onClick={onEnter}
            disabled={isEntering}
            onMouseEnter={() => setIsCtaHovered(true)}
            onMouseLeave={() => setIsCtaHovered(false)}
            className="smartmaze-landing-cta"
            trailingIcon={<span>→</span>}
          >
            ENTER SMARTMAZE
          </PrimaryButton>
        </div>
      </div>

      {/* 3. Centered Architectural Buffering Visual */}
      {isEntering && <MazeLoadingSpinner />}
    </div>
  );
}
